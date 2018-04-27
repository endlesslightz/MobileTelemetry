
function startCamera(){
    CameraPreview.startCamera({x: 0, y: 60, width:window.screen.width, height: 300, camera: "back", toBack: true, previewDrag: false, tapPhoto: false, tapFocus: true});
}

var app = {
  startCameraAbove: function(){
    CameraPreview.startCamera({x: 0, y: 60, width:window.screen.width, height: 300, camera: "back", toBack: true, previewDrag: false, tapPhoto: false, tapFocus: true});
  },

  stopCamera: function(){
    CameraPreview.stopCamera();
  },

  takePicture: function(){
    CameraPreview.takePicture(function(imgData){
      document.getElementById('originalPicture').src = 'data:image/jpeg;base64,' + imgData;
    });
  },

  switchCamera: function(){
    CameraPreview.switchCamera();
  },

  show: function(){
    CameraPreview.show();
  },

  hide: function(){
    CameraPreview.hide();
  },

  changeColorEffect: function(){
    var effect = document.getElementById('selectColorEffect').value;
    CameraPreview.setColorEffect(effect);
  },

  changeFlashMode: function(){
    var mode = document.getElementById('selectFlashMode').value;
    CameraPreview.setFlashMode(mode);
  },

  changeZoom: function(){
    var zoom = document.getElementById('zoomSlider').value;
    CameraPreview.setZoom(zoom);
    // document.getElementById('zoomValue').innerHTML = zoom;
  },


  init: function(){
    document.getElementById('startCameraAboveButton').addEventListener('click', this.startCameraAbove, false);
    document.getElementById('stopCameraButton').addEventListener('click', this.stopCamera, false);
    // document.getElementById('switchCameraButton').addEventListener('click', this.switchCamera, false);
    document.getElementById('takePictureButton').addEventListener('click', this.takePicture, false);
    document.getElementById('selectColorEffect').addEventListener('change', this.changeColorEffect, false);
    document.getElementById('selectFlashMode').addEventListener('change', this.changeFlashMode, false);
    document.getElementById('zoomSlider').addEventListener('change', this.changeZoom, true);
    window.smallPreview = true;
    // document.getElementById('changePreviewSize').addEventListener('click', this.changePreviewSize, false);
    // legacy - not sure if this was supposed to fix anything
    //window.addEventListener('orientationchange', this.onStopCamera, false);
  }
};

document.addEventListener('deviceready', function(){	
  app.init();
  startCamera();
}, false);
