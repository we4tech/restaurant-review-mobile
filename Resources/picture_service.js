var PictureService = {

  uploadImage: function(event, restaurant, window, progressBar, cancelButton) {
    var image = event.media;
    var f = Ti.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, 'camera_photo.png');
    f.write(image);
    progressBar.setMax(image.size);

    var data_to_send = {
      "multi_image[][uploaded_datum]": f.read(),
      "multi_image[][captions]": 'camera_photo.png',
      "restaurant_id": restaurant.id
    };

    var xhr = Titanium.Network.createHTTPClient();
    xhr.setRequestHeader("enctype", "multipart/form-data");
    xhr.setRequestHeader("Content-Type", "image/png");
    
    xhr.onsendstream = function(e) {
			progressBar.value = e.progress ;
		};
    
    xhr.onload = function() {
      progressBar.hide();
      window.setToolbar([]);
      alert(this.responseText);
      Ti.API.info(this.responseText);
    };

    xhr.onerror = function(e) {
      Ti.UI.createAlertDialog({title:'Error', message: e.error}).show();
      Ti.API.info('IN ERROR ' + e.error);
    };

    xhr.open("POST", ServiceDomain + "/service/mobile/image_upload");
    xhr.send(data_to_send);

    if (cancelButton) {
      cancelButton.addEventListener(function(e) {
        xhr.abort();
        window.setToolbar([]);
      });
    }
  },

  takePicture: function(window, restaurant) {
    var cancelButton = Ti.UI.createButton({title: 'Cancel'});
    var progressBar = Titanium.UI.createProgressBar({
      width:220,
      min:0,
      max:10,
      value:0,
      color:'#fff',
      message:'Uploading...',
      font:{fontSize:14, fontWeight:'bold'},
      style:Titanium.UI.iPhone.ProgressBarStyle.PLAIN
    });

    Ti.Media.showCamera({
      success: function(event) {
        var cropRect = event.cropRect;
        var image = event.media;

        window.setToolbar([progressBar, cancelButton]);
        progressBar.show();
        try {
          PictureService.uploadImage(event, restaurant, window, progressBar, cancelButton);
        } catch (e) {
          var a = Titanium.UI.createAlertDialog({title: 'Camera'});
          a.setMessage('Failed to upload your file - ' + e.code);

          progressBar.hide();
          window.setToolbar([]);
          
          a.show();
        }
      },

      cancel: function() {
        
      },

      error: function(error) {

        // create alert
        var a = Titanium.UI.createAlertDialog({title:'Camera'});

        // set message
        if (error.code == Titanium.Media.NO_CAMERA) {
          a.setMessage('Please run this test on device');
        }
        else {
          a.setMessage('Unexpected error: ' + error.code);
        }

        // show alert
        a.show();
      },
      allowImageEditing: true,
      saveToPhotoGallery: true,
      showControls: true
    });

  }
};