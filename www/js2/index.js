// index.js

var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        // Method below REQUIRES elements we removed from body in index.html
        // So we comment it out.
        // this.receivedEvent('deviceready');

        let options = {
            x: 0,
            y: 260,
            width: window.screen.width,
            height: window.screen.height/2,
            camera: CameraPreview.CAMERA_DIRECTION.BACK,  // Front/back camera
            toBack: true,   // Set to true if you want your html in front of your preview
            tapPhoto: false,  // Tap to take photo
            tapFocus: true,   // Tap to focus
            previewDrag: false
        };

        var flash_mode = 'off';
        // Take a look at docs: https://github.com/cordova-plugin-camera-preview/cordova-plugin-camera-preview#methods
        CameraPreview.startCamera(options);


        // Create a rectangle & buttons
        var rect = document.createElement('div');
        var take_pic_btn = document.createElement('img');
        var flash_on_btn = document.createElement('img');
        var flash_off_btn = document.createElement('img');

        // You must specify path relative to www folder
        take_pic_btn.src = 'img2/take_photo.png';
        flash_on_btn.src = 'img2/flash_on.svg';
        flash_off_btn.src = 'img2/flash_off.svg';

        // Add styles
        rect.className += 'rect_class';
        take_pic_btn.className += ' take_pic_class'
        flash_on_btn.className += ' flash_class'
        flash_off_btn.className += ' flash_class'

        // Hide flash_off btn by default
        flash_off_btn.style.visibility = 'hidden';

        // Append to body section
        document.body.appendChild(rect);
        document.body.appendChild(take_pic_btn);
        document.body.appendChild(flash_on_btn);
        document.body.appendChild(flash_off_btn);

        // Get rectangle coordinates
        var rect_coords = rect.getBoundingClientRect();
        var x_coord = rect_coords.left, y_coord = rect_coords.top;

        take_pic_btn.onclick = function(){
            // Get rectangle size
            var rect_width = rect.offsetWidth, rect_height = rect.offsetHeight;

            CameraPreview.takePicture(function(result){
            document.getElementById('originalPicture').src = 'data:image/jpeg;base64,' + result; 
            var img = document.getElementById('originalPicture');
            //var img = new Image();

                cordova.base64ToGallery(
                    result,
                    function(msg) {
                        alert("Base64 success: " + msg);
                    },
                    function(err) {
                        alert("Base64 error: " + err);
                    }
                );
            

            //img.src = 'data:image/jpeg;base64,' +result;//originalPicturePath;

            //document.getElementById('previewPicture').src = result[1];//previewPicturePath;
        });

        };

        flash_on_btn.onclick = function() {
            flash_mode = 'on';
            flash_off_btn.style.visibility = 'visible';
            flash_on_btn.style.visibility = 'hidden';

            CameraPreview.setFlashMode(flash_mode);
        }

        flash_off_btn.onclick = function() {
            flash_mode = 'off';
            flash_off_btn.style.visibility = 'hidden';
            flash_on_btn.style.visibility = 'visible';

            CameraPreview.setFlashMode(flash_mode);
        }
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

app.initialize();
