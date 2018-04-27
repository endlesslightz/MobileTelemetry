
document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
  document.getElementById("cameraTakePicture").addEventListener 
   ("click", cameraTakePicture); 
 }

function cameraTakePicture() { 
   navigator.camera.getPicture(onSuccess, onFail, {  
      quality: 50, 
      destinationType: Camera.DestinationType.DATA_URL ,
      saveToPhotoAlbum: 'true'

   });  
   
   function onSuccess(imageData) { 
      var image = document.getElementById('myImage'); 
      image.src = "data:image/jpeg;base64," + imageData; 

   }  
   
   function onFail(message) { 
      alert('Failed because: ' + message); 
   } 
}