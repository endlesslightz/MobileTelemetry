// Copyright 2016 Franco Bugnano
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//	http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package cordova.plugin.networking.bluetooth;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaArgs;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.apache.cordova.PluginResult;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothServerSocket;
import android.bluetooth.BluetoothSocket;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.Manifest;
import android.os.ParcelUuid;
import android.util.Log;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.atomic.AtomicInteger;

public class NetworkingBluetooth extends CordovaPlugin {
	public static final String TAG = "CordovaNetworkingBluetooth";
	public static final String SERVICE_NAME = "CordovaNetworkingBluetooth";
	public static final int REQUEST_ENABLE_BT = 1773;
	public static final int REQUEST_DISCOVERABLE_BT = 1885;
	public static final int START_DISCOVERY_REQ_CODE = 1997;
	public static final int READ_BUFFER_SIZE = 4096;

	public class SocketSendData {
		public CallbackContext mCallbackContext;
		public BluetoothSocket mSocket;
		public byte[] mData;

		public SocketSendData(CallbackContext callbackContext, BluetoothSocket socket, byte[] data) {
			this.mCallbackContext = callbackContext;
			this.mSocket = socket;
			this.mData = data;
		}
	}

	public BluetoothAdapter mBluetoothAdapter = null;
	public ConcurrentHashMap<Integer, CallbackContext> mContextForActivity = new ConcurrentHashMap<Integer, CallbackContext>();
	public ConcurrentHashMap<Integer, CallbackContext> mContextForPermission = new ConcurrentHashMap<Integer, CallbackContext>();
	public CallbackContext mContextForAdapterStateChanged = null;
	public CallbackContext mContextForDeviceAdded = null;
	public CallbackContext mContextForReceive = null;
	public CallbackContext mContextForReceiveError = null;
	public CallbackContext mContextForAccept = null;
	public CallbackContext mContextForAcceptError = null;
	public CallbackContext mContextForEnable = null;
	public CallbackContext mContextForDisable = null;
	public boolean mDeviceAddedRegistered = false;
	public int mPreviousScanMode = BluetoothAdapter.SCAN_MODE_NONE;
	public AtomicInteger mSocketId = new AtomicInteger(1);
	public ConcurrentHashMap<Integer, BluetoothSocket> mClientSockets = new ConcurrentHashMap<Integer, BluetoothSocket>();
	public ConcurrentHashMap<Integer, BluetoothServerSocket> mServerSockets = new ConcurrentHashMap<Integer, BluetoothServerSocket>();
	public LinkedBlockingQueue<SocketSendData> mSendQueue = new LinkedBlockingQueue<SocketSendData>();

	@Override
	public void initialize(CordovaInterface cordova, CordovaWebView webView) {
		super.initialize(cordova, webView);

		this.mBluetoothAdapter = BluetoothAdapter.getDefaultAdapter();

		if (this.mBluetoothAdapter != null) {
			this.mPreviousScanMode = this.mBluetoothAdapter.getScanMode();
		}

		cordova.getThreadPool().execute(new Runnable() {
			public void run() {
				writeLoop();
			}
		});
	}

	@Override
	public boolean execute(String action, CordovaArgs args, final CallbackContext callbackContext) throws JSONException {
		IntentFilter filter;

		if (this.mBluetoothAdapter == null) {
			callbackContext.error("Device does not support Bluetooth");
			return false;
		}

		if (action.equals("registerAdapterStateChanged")) {
			this.mContextForAdapterStateChanged = callbackContext;

			filter = new IntentFilter();
			filter.addAction(BluetoothAdapter.ACTION_STATE_CHANGED);
			filter.addAction(BluetoothAdapter.ACTION_DISCOVERY_STARTED);
			filter.addAction(BluetoothAdapter.ACTION_DISCOVERY_FINISHED);
			filter.addAction(BluetoothAdapter.ACTION_SCAN_MODE_CHANGED);
			cordova.getActivity().registerReceiver(this.mReceiver, filter);

			return true;
		} else if (action.equals("registerDeviceAdded")) {
			this.mContextForDeviceAdded = callbackContext;
			return true;
		} else if (action.equals("registerReceive")) {
			this.mContextForReceive = callbackContext;
			return true;
		} else if (action.equals("registerReceiveError")) {
			this.mContextForReceiveError = callbackContext;
			return true;
		} else if (action.equals("registerAccept")) {
			this.mContextForAccept = callbackContext;
			return true;
		} else if (action.equals("registerAcceptError")) {
			this.mContextForAcceptError = callbackContext;
			return true;
		} else if (action.equals("getAdapterState")) {
			this.getAdapterState(callbackContext, false);
			return true;
		} else if (action.equals("requestEnable")) {
			if (!this.mBluetoothAdapter.isEnabled()) {
				Intent enableBtIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
				this.prepareActivity(action, args, callbackContext, enableBtIntent, REQUEST_ENABLE_BT);
			} else {
				callbackContext.success();
			}
			return true;
		} else if (action.equals("enable")) {
			// If there already is another enable action pending, call the error callback in order
			// to notify that the previous action has been cancelled
			if (this.mContextForEnable != null) {
				this.mContextForEnable.error(1);
				this.mContextForEnable = null;
			}

			if (!this.mBluetoothAdapter.isEnabled()) {
				if (!this.mBluetoothAdapter.enable()) {
					callbackContext.error(0);
				} else {
					// Save the context, in order to send the result once the action has been completed
					this.mContextForEnable = callbackContext;
				}
			} else {
				callbackContext.success();
			}
			return true;
		} else if (action.equals("disable")) {
			// If there already is another disable action pending, call the error callback in order
			// to notify that the previous action has been cancelled
			if (this.mContextForDisable != null) {
				this.mContextForDisable.error(1);
				this.mContextForDisable = null;
			}

			if (this.mBluetoothAdapter.isEnabled()) {
				if (!this.mBluetoothAdapter.disable()) {
					callbackContext.error(0);
				} else {
					// Save the context, in order to send the result once the action has been completed
					this.mContextForDisable = callbackContext;
				}
			} else {
				callbackContext.success();
			}
			return true;
		} else if (action.equals("getDevice")) {
			String address = args.getString(0);
			BluetoothDevice device = this.mBluetoothAdapter.getRemoteDevice(address);
			callbackContext.success(this.getDeviceInfo(device));
			return true;
		} else if (action.equals("getDevices")) {
			Set<BluetoothDevice> devices = this.mBluetoothAdapter.getBondedDevices();
			JSONArray deviceInfos = new JSONArray();
			for (BluetoothDevice device : devices) {
				deviceInfos.put(this.getDeviceInfo(device));
			}
			callbackContext.success(deviceInfos);
			return true;
		} else if (action.equals("startDiscovery")) {
			// Automatically cancel any previous discovery
			if (this.mBluetoothAdapter.isDiscovering()) {
				this.mBluetoothAdapter.cancelDiscovery();
			}

			if (cordova.hasPermission(Manifest.permission.ACCESS_COARSE_LOCATION)) {
				this.startDiscovery(callbackContext);
			} else {
				this.getPermission(callbackContext, START_DISCOVERY_REQ_CODE, Manifest.permission.ACCESS_COARSE_LOCATION);
			}
			return true;
		} else if (action.equals("stopDiscovery")) {
			if (this.mBluetoothAdapter.isDiscovering()) {
				if (this.mBluetoothAdapter.cancelDiscovery()) {
					callbackContext.success();
				} else {
					callbackContext.error(0);
				}
			} else {
				callbackContext.success();
			}
			return true;
		} else if (action.equals("requestDiscoverable")) {
			Intent discoverableIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_DISCOVERABLE);
			discoverableIntent.putExtra(BluetoothAdapter.EXTRA_DISCOVERABLE_DURATION, 300);
			this.prepareActivity(action, args, callbackContext, discoverableIntent, REQUEST_DISCOVERABLE_BT);
			return true;
		} else if (action.equals("connect")) {
			final String address = args.getString(0);
			final String uuid = args.getString(1);
			cordova.getThreadPool().execute(new Runnable() {
				public void run() {
					int socketId;
					BluetoothSocket socket;

					try {
						BluetoothDevice device = mBluetoothAdapter.getRemoteDevice(address);
						socket = device.createRfcommSocketToServiceRecord(UUID.fromString(uuid));

						// Note: You should always ensure that the device is not performing
						// device discovery when you call connect().
						// If discovery is in progress, then the connection attempt will be
						// significantly slowed and is more likely to fail.
						mBluetoothAdapter.cancelDiscovery();

						socket.connect();

						socketId = mSocketId.getAndIncrement();
						mClientSockets.put(socketId, socket);
						callbackContext.success(socketId);
					} catch (NullPointerException e) {
						callbackContext.error(e.getMessage());
						return;
					} catch (IllegalArgumentException e) {
						callbackContext.error(e.getMessage());
						return;
					} catch (IOException e) {
						callbackContext.error(e.getMessage());
						return;
					}

					// Now that the connection has been made, begin the read loop
					readLoop(socketId, socket);
				}
			});
			return true;
		} else if (action.equals("close")) {
			int socketId = args.getInt(0);
			BluetoothSocket socket = this.mClientSockets.remove(socketId);
			if (socket != null) {
				// The socketId refers to a client socket
				try {
					socket.close();
					callbackContext.success();
				} catch (IOException e) {
					callbackContext.error(e.getMessage());
				}
			} else {
				BluetoothServerSocket serverSocket = this.mServerSockets.remove(socketId);
				if (serverSocket != null) {
					// The socketId refers to a server socket
					try {
						serverSocket.close();
						callbackContext.success();
					} catch (IOException e) {
						callbackContext.error(e.getMessage());
					}
				} else {
					// Closing an already closed socket is not an error
					callbackContext.success();
				}
			}
			return true;
		} else if (action.equals("send")) {
			int socketId = args.getInt(0);
			byte[] data = args.getArrayBuffer(1);
			BluetoothSocket socket = this.mClientSockets.get(socketId);
			if (socket != null) {
				try {
					// The send operation occurs in a separate thread
					this.mSendQueue.put(new SocketSendData(callbackContext, socket, data));
				} catch (InterruptedException e) {
					callbackContext.error(e.getMessage());
				}
			} else {
				callbackContext.error("Invalid socketId");
			}
			return true;
		} else if (action.equals("listenUsingRfcomm")) {
			final String uuid = args.getString(0);
			cordova.getThreadPool().execute(new Runnable() {
				public void run() {
					int serverSocketId;
					BluetoothServerSocket serverSocket;

					try {
						serverSocket = mBluetoothAdapter.listenUsingRfcommWithServiceRecord(SERVICE_NAME, UUID.fromString(uuid));
						serverSocketId = mSocketId.getAndIncrement();
						mServerSockets.put(serverSocketId, serverSocket);
						callbackContext.success(serverSocketId);
					} catch (NullPointerException e) {
						callbackContext.error(e.getMessage());
						return;
					} catch (IllegalArgumentException e) {
						callbackContext.error(e.getMessage());
						return;
					} catch (IOException e) {
						callbackContext.error(e.getMessage());
						return;
					}

					// Now that the server socket has been made, begin the accept loop
					acceptLoop(serverSocketId, serverSocket);
				}
			});
			return true;
		} else {
			callbackContext.error("Invalid action");
			return false;
		}
	}

	public void getAdapterState(CallbackContext callbackContext, boolean keepCallback) {
		PluginResult pluginResult;

		try {
			JSONObject adapterState = new JSONObject();
			adapterState.put("address", this.mBluetoothAdapter.getAddress());
			adapterState.put("name", this.mBluetoothAdapter.getName());
			adapterState.put("enabled", this.mBluetoothAdapter.isEnabled());
			adapterState.put("discovering", this.mBluetoothAdapter.isDiscovering());
			adapterState.put("discoverable", this.mBluetoothAdapter.getScanMode() == BluetoothAdapter.SCAN_MODE_CONNECTABLE_DISCOVERABLE);

            pluginResult = new PluginResult(PluginResult.Status.OK, adapterState);
            pluginResult.setKeepCallback(keepCallback);
            callbackContext.sendPluginResult(pluginResult);
		} catch (JSONException e) {
            pluginResult = new PluginResult(PluginResult.Status.ERROR, e.getMessage());
            pluginResult.setKeepCallback(keepCallback);
            callbackContext.sendPluginResult(pluginResult);
		}
	}

	public JSONObject getDeviceInfo(BluetoothDevice device) throws JSONException {
		JSONObject deviceInfo = new JSONObject();

		deviceInfo.put("address", device.getAddress());
		deviceInfo.put("name", device.getName());
		deviceInfo.put("paired", device.getBondState() == BluetoothDevice.BOND_BONDED);

		JSONArray deviceUUIDs = new JSONArray();
		ParcelUuid[] uuids = device.getUuids();
		if (uuids != null) {
			for (int i = 0; i < uuids.length; i++) {
				deviceUUIDs.put(uuids[i].toString());
			}
		}
		deviceInfo.put("uuids", deviceUUIDs);

		return deviceInfo;
	}

	public void prepareActivity(String action, CordovaArgs args, CallbackContext callbackContext, Intent intent, int requestCode) {
		// If there already is another activity with this request code, call the error callback in order
		// to notify that the activity has been cancelled
		if (this.mContextForActivity.containsKey(requestCode)) {
			callbackContext.error("Attempted to start the same activity twice");
			return;
		}

		// Store the callbackContext, in order to send the result once the activity has been completed
		this.mContextForActivity.put(requestCode, callbackContext);

		// Store the callbackContext, in order to send the result once the activity has been completed
		cordova.startActivityForResult(this, intent, requestCode);
	}

	@Override
	public void onActivityResult(int requestCode, int resultCode, Intent intent) {
		CallbackContext callbackContext = this.mContextForActivity.remove(requestCode);

		if (callbackContext != null) {
			if (resultCode == Activity.RESULT_CANCELED) {
				callbackContext.error(0);
			} else {
				callbackContext.success();
			}
		} else {
			// TO DO -- This may be a bug on the JavaScript side, as we get here only if the
			// activity has been started twice, before waiting the completion of the first one.
			Log.e(TAG, "BUG: onActivityResult -- (callbackContext == null)");
		}
	}

	public final BroadcastReceiver mReceiver = new BroadcastReceiver() {
		@Override
		public void onReceive(Context context, Intent intent) {
			String action = intent.getAction();
			PluginResult pluginResult;

			if (action.equals(BluetoothAdapter.ACTION_STATE_CHANGED)) {
				int state = intent.getIntExtra(BluetoothAdapter.EXTRA_STATE, -1);
				int previousState = intent.getIntExtra(BluetoothAdapter.EXTRA_PREVIOUS_STATE, -1);

				// If there was an enable request pending, send the result
				if ((previousState == BluetoothAdapter.STATE_TURNING_ON) && (mContextForEnable != null)) {
					if (state == BluetoothAdapter.STATE_ON) {
						mContextForEnable.success();
					} else {
						mContextForEnable.error(2);
					}
					mContextForEnable = null;
				}

				// If there was a disable request pending, send the result
				if ((previousState == BluetoothAdapter.STATE_TURNING_OFF) && (mContextForDisable != null)) {
					if (state == BluetoothAdapter.STATE_OFF) {
						mContextForDisable.success();
					} else {
						mContextForDisable.error(2);
					}
					mContextForDisable = null;
				}

				// Send the state changed event only if the state is not a transitioning one
				if ((state == BluetoothAdapter.STATE_OFF) || (state == BluetoothAdapter.STATE_ON)) {
					getAdapterState(mContextForAdapterStateChanged, true);
				}
			} else if (action.equals(BluetoothAdapter.ACTION_DISCOVERY_STARTED) || action.equals(BluetoothAdapter.ACTION_DISCOVERY_FINISHED)) {
				getAdapterState(mContextForAdapterStateChanged, true);
			} else if (action.equals(BluetoothDevice.ACTION_FOUND)) {
				try {
					BluetoothDevice device = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);
					JSONObject deviceInfo = getDeviceInfo(device);

					pluginResult = new PluginResult(PluginResult.Status.OK, deviceInfo);
					pluginResult.setKeepCallback(true);
					mContextForDeviceAdded.sendPluginResult(pluginResult);
				} catch (JSONException e) {
					pluginResult = new PluginResult(PluginResult.Status.ERROR, e.getMessage());
					pluginResult.setKeepCallback(true);
					mContextForDeviceAdded.sendPluginResult(pluginResult);
				}
			} else if (action.equals(BluetoothAdapter.ACTION_SCAN_MODE_CHANGED)) {
				// BUG: The documented EXTRA_PREVIOUS_SCAN_MODE field of the intent is not implemented on Android.
				// For details see:
				// http://stackoverflow.com/questions/30553911/extra-previous-scan-mode-always-returns-an-error-for-android-bluetooth
				// As a workaround, the previous scan mode is handled manually here
				int scanMode = intent.getIntExtra(BluetoothAdapter.EXTRA_SCAN_MODE, -1);

				// Report only the transitions from/to SCAN_MODE_CONNECTABLE_DISCOVERABLE
				if ((scanMode == BluetoothAdapter.SCAN_MODE_CONNECTABLE_DISCOVERABLE) || (mPreviousScanMode == BluetoothAdapter.SCAN_MODE_CONNECTABLE_DISCOVERABLE)) {
					getAdapterState(mContextForAdapterStateChanged, true);
				}
				mPreviousScanMode = scanMode;
			}
		}
	};

	public void readLoop(int socketId, BluetoothSocket socket) {
		byte[] readBuffer = new byte[READ_BUFFER_SIZE];
		byte[] data;
		ArrayList<PluginResult> multipartMessages;
		PluginResult pluginResult;

		try {
			InputStream stream = socket.getInputStream();
			int bytesRead;

			while (socket.isConnected()) {
				bytesRead = stream.read(readBuffer);
				if (bytesRead < 0) {
					throw new IOException("Disconnected");
				} else if (bytesRead > 0) {
					data = Arrays.copyOf(readBuffer, bytesRead);
					multipartMessages = new ArrayList<PluginResult>();
					multipartMessages.add(new PluginResult(PluginResult.Status.OK, socketId));
					multipartMessages.add(new PluginResult(PluginResult.Status.OK, data));
					pluginResult = new PluginResult(PluginResult.Status.OK, multipartMessages);
					pluginResult.setKeepCallback(true);
					this.mContextForReceive.sendPluginResult(pluginResult);
				}
			}
		} catch (IOException e) {
			try {
				JSONObject info = new JSONObject();
				info.put("socketId", socketId);
				info.put("errorMessage", e.getMessage());
				pluginResult = new PluginResult(PluginResult.Status.OK, info);
				pluginResult.setKeepCallback(true);
				this.mContextForReceiveError.sendPluginResult(pluginResult);
			} catch (JSONException ex) {}
		}

		try {
			socket.close();
		} catch (IOException e) {}

		// The socket has been closed, remove its socketId
		this.mClientSockets.remove(socketId);
	}

	public void acceptLoop(int serverSocketId, BluetoothServerSocket serverSocket) {
		int clientSocketId;
		BluetoothSocket clientSocket;
		ArrayList<PluginResult> multipartMessages;
		PluginResult pluginResult;

		try {
			while (true) {
				clientSocket = serverSocket.accept();
				if (clientSocket == null) {
					throw new IOException("Disconnected");
				}

				clientSocketId = this.mSocketId.getAndIncrement();
				this.mClientSockets.put(clientSocketId, clientSocket);

				multipartMessages = new ArrayList<PluginResult>();
				multipartMessages.add(new PluginResult(PluginResult.Status.OK, serverSocketId));
				multipartMessages.add(new PluginResult(PluginResult.Status.OK, clientSocketId));
				pluginResult = new PluginResult(PluginResult.Status.OK, multipartMessages);
				pluginResult.setKeepCallback(true);
				this.mContextForAccept.sendPluginResult(pluginResult);

				this.newReadLoopThread(clientSocketId, clientSocket);
			}
		} catch (IOException e) {
			try {
				JSONObject info = new JSONObject();
				info.put("socketId", serverSocketId);
				info.put("errorMessage", e.getMessage());
				pluginResult = new PluginResult(PluginResult.Status.OK, info);
				pluginResult.setKeepCallback(true);
				this.mContextForAcceptError.sendPluginResult(pluginResult);
			} catch (JSONException ex) {}
		}

		try {
			serverSocket.close();
		} catch (IOException e) {}

		// The socket has been closed, remove its socketId
		this.mServerSockets.remove(serverSocketId);
	}

	public void newReadLoopThread(final int socketId, final BluetoothSocket socket) {
		cordova.getThreadPool().execute(new Runnable() {
			public void run() {
				readLoop(socketId, socket);
			}
		});
	}

	public void writeLoop() {
		SocketSendData sendData;

		try {
			while (true) {
				sendData = this.mSendQueue.take();

				try {
					sendData.mSocket.getOutputStream().write(sendData.mData);
					sendData.mCallbackContext.success(sendData.mData.length);
				} catch (IOException e) {
					sendData.mCallbackContext.error(e.getMessage());
				}
			}
		} catch (InterruptedException e) {}
	}

	public void startDiscovery(CallbackContext callbackContext) {
		if (!this.mDeviceAddedRegistered) {
			IntentFilter filter = new IntentFilter(BluetoothDevice.ACTION_FOUND);
			cordova.getActivity().registerReceiver(this.mReceiver, filter);
			this.mDeviceAddedRegistered = true;
		}

		if (this.mBluetoothAdapter.startDiscovery()) {
			callbackContext.success();
		} else {
			callbackContext.error(0);
		}
	}

	public void getPermission(CallbackContext callbackContext, int requestCode, String permission) {
		// If there already is another permission request with this request code, call the error callback in order
		// to notify that the request has been cancelled
		if (this.mContextForPermission.containsKey(requestCode)) {
			callbackContext.error("Attempted to request the same permission twice");
			return;
		}

		// Store the callbackContext, in order to send the result once the activity has been completed
		this.mContextForPermission.put(requestCode, callbackContext);

		cordova.requestPermission(this, requestCode, permission);
	}

	@Override
	public void onRequestPermissionResult(int requestCode, String[] permissions, int[] grantResults) throws JSONException {
		CallbackContext callbackContext = this.mContextForPermission.remove(requestCode);

		if (requestCode == START_DISCOVERY_REQ_CODE) {
			if ((grantResults.length > 0) && (grantResults[0] == PackageManager.PERMISSION_GRANTED)) {
				this.startDiscovery(callbackContext);
			} else {
				callbackContext.error(0);
			}
		}
	}
}

