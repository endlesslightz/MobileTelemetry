<!--
# license: Copyright 2016 Franco Bugnano
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
-->

# cordova-plugin-networking-bluetooth


This plugin provides Bluetooth RFCOMM connectivity for peer to peer networking
between Android devices, with an API inspired by
[Mobile Chrome Apps Bluetooth Socket](https://developer.chrome.com/apps/bluetoothSocket).

For an explaination of the rationale behind this plugin,
see [this blog post](http://cownado.com/posts/2016/02/bluetooth-networking-plugin-for-cordova.html).

## Installation

    cordova plugin add cordova-plugin-networking-bluetooth

## Supported Platforms

- Android

# Namespace and API

All the functions and events described in this plugin reside in the `networking.bluetooth` namespace.

All the functions are asynchronous and have 2 callbacks as their last 2 parameters, the first
being the success callback, and the second being the error callback.

All the events have the following methods:

```javascript
Event.addListener(function callback)
Event.removeListener(function callback)
boolean Event.hasListener(function callback)
boolean Event.hasListeners()
```

# Adapter information

To obtain the state of the Bluetooth adapter, use the `getAdapterState` method: 

```javascript
networking.bluetooth.getAdapterState(function (adapterInfo) {
    // The adapterInfo object has the following properties:
    // address: String --> The address of the adapter, in the format 'XX:XX:XX:XX:XX:XX'.
    // name: String --> The human-readable name of the adapter.
    // enabled: Boolean --> Indicates whether or not the adapter is enabled.
    // discovering: Boolean --> Indicates whether or not the adapter is currently discovering.
    // discoverable: Boolean --> Indicates whether or not the adapter is currently discoverable.
    console.log('Adapter ' + adapterInfo.address + ': ' + adapterInfo.name);
}, function (errorMessage) {
    console.error(errorMessage);
});
```

The `onAdapterStateChanged` event is sent whenever the adapter state changes.
This can be used, for example, to determine when the adapter is enabled or disabled.

```javascript
var enabled = false;
networking.bluetooth.getAdapterState(function (adapterInfo) {
    enabled = adapterInfo.enabled;
});

networking.bluetooth.onAdapterStateChanged.addListener(function (adapterInfo) {
    // The adapterInfo object has the same properties as getAdapterState
    if (adapterInfo.enabled !== enabled) {
        enabled = adapterInfo.enabled;
        if (enabled) {
            console.log('Adapter is enabled');
        } else {
            console.log('Adapter is disabled');
        }
    }
});
```

To enable the adapter, either the `requestEnable` or the `enable` functions can be used,
the difference being that the `requestEnable` function is recommended, as it nicely prompts
the user before enabling the adapter.

To disable the adapter, use the `disable` function.

```javascript
networking.bluetooth.requestEnable(function () {
    // The adapter is now enabled
}, function () {
    // The user has cancelled the operation
});
```

# Device information and discovery

To get a list of the devices known to the Bluetooth adapter, use the `getDevices` method:

```javascript
networking.bluetooth.getDevices(function (devices) {
    for (var i = 0; i < devices.length; i++) {
        // The deviceInfo object has the following properties:
        // address: String --> The address of the device, in the format 'XX:XX:XX:XX:XX:XX'.
        // name: String --> The human-readable name of the device.
        // paired: Boolean --> Indicates whether or not the device is paired with the system.
        // uuids: Array of String --> UUIDs of protocols, profiles and services advertised by the device.
        console.log(devices[i].address);
    }
});
```

To begin discovery of nearby devices, use the `startDiscovery` method.
Discovery can be resource intensive so you should call `stopDiscovery` when done.

You should call `startDiscovery` whenever your app needs to discover nearby devices.
Do not make the call conditional on the `discovering` property of the adapterInfo.

Information about each newly discovered device is received using the `onDeviceAdded` event.

Example:

```javascript
var device_names = {};
var updateDeviceName = function (device) {
    device_names[device.address] = device.name;
};

// Add listener to receive newly found devices
networking.bluetooth.onDeviceAdded.addListener(updateDeviceName);

// With the listener in place, get the list of known devices
networking.bluetooth.getDevices(function (devices) {
    for (var i = 0; i < devices.length; i++) {
        updateDeviceName(devices[i]);
    }
});

// Now begin the discovery process.
networking.bluetooth.startDiscovery(function () {
    // Stop discovery after 30 seconds.
    setTimeout(function () {
        networking.bluetooth.stopDiscovery();
    }, 30000);
});
```

To make the device discoverable, use the `requestDiscoverable` function, that will
prompt the user to make the device discoverable for a limited amount of time (120 seconds on Android).

```javascript
networking.bluetooth.requestDiscoverable(function () {
    // The device is now discoverable
}, function () {
    // The user has cancelled the operation
});
```

# Connecting to a socket

In order to make a connection to a device you need two things.
The address of the device you wish to connect to, and the UUID of the service itself.

Example:

```javascript
var uuid = '94f39d29-7d6d-437d-973b-fba39e49d4ee';

networking.bluetooth.connect(device.address, uuid, function (socketId) {
    // Profile implementation here.
}, function (errorMessage) {
    console.log('Connection failed: ' + errorMessage);
});
```

Keep a handle to the `socketId` so that you can later send data to this socket. 

# Receiving from and sending to a socket

Receiving data from and sending to a socket uses [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays) objects.

To send data you have in `arrayBuffer` use `send`:

```javascript
networking.bluetooth.send(socketId, arrayBuffer, function(bytes_sent) {
    console.log('Sent ' + bytes_sent + ' bytes');
}, function (errorMessage) {
    console.log('Send failed: ' + errorMessage);
});
```

In contrast to the method to send data, data is received in an event (`onReceive`).

```javascript
networking.bluetooth.onReceive.addListener(function (receiveInfo) {
    if (receiveInfo.socketId !== socketId) {
        return;
    }

    // receiveInfo.data is an ArrayBuffer.
});
```

# Receiving socket errors and disconnection

To be notified of socket errors, including disconnection, add a listener to the `onReceiveError` event.

```javascript
networking.bluetooth.onReceiveError.addListener(function (errorInfo) {
    if (errorInfo.socketId !== socketId) {
        return;
    }

    // Cause is in errorInfo.errorMessage.
    console.log(errorInfo.errorMessage);
});
```

# Disconnecting from a socket

To hang up the connection and disconnect the socket use `close`.

```javascript
networking.bluetooth.close(socketId);
```

# Listening on a socket

```javascript
var uuid = '94f39d29-7d6d-437d-973b-fba39e49d4ee';
networking.bluetooth.listenUsingRfcomm(uuid, function (serverSocketId) {
    // Keep a handle to the serverSocketId so that you can later accept connections (onAccept) from this socket.
}, function (errorMessage) {
    console.error(errorMessage);
});
```

# Accepting client connections

Client connections are accepted and passed to your application through the `onAccept` event.

```javascript
networking.bluetooth.onAccept.addListener(function (acceptInfo) {
    if (acceptInfo.socketId !== serverSocketId) {
        return;
    }

    // Say hello...
    networking.bluetooth.send(acceptInfo.clientSocketId, data, onSendCallback, onSendErrorCallback);

    // Set the onReceive listener
    networking.bluetooth.onReceive.addListener(onReceive);
});
```

# Stop accepting client connections

To stop accepting client connections and unpublish the service use `close`.

```javascript
networking.bluetooth.close(serverSocketId);
```

<!-- vim: set et: -->

