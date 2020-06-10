angular
  .module('app.services')
  .service('CameraService', function($cordovaCamera, DataService) {

    function getPicture(){
      return new Promise(function(resolve, reject){
        if (typeof Camera != 'undefined'){ // Executando no celular
          var options = {
            quality: 100,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
            allowEdit: false,
            encodingType: Camera.EncodingType.PNG,
            mediaType: Camera.MediaType.PICTURE,
            targetWidth: 400,
            targetHeight: 400,
            // correctOrientation:true
          };
      
          $cordovaCamera.getPicture(options).then(function(imagePath) {
            resolve(imagePath)
          }, function(err) {
            if(err != "No Image Selected"){
              DataService.logError(err);
            }
            reject(err);
            
            // if (err == "Unable to retrieve path to picture!") {
              // reject("A imagem selecionada não está no formato permitido. Tente uma imagem png, jpeg ou bmp. Não é permitido o uso de gifs.");
            // }
          });
        } else {
          reject('Plugin Camera não inicializdo (Camera == undefined)');
          DataService.logError('Plugin Camera não inicializdo (Camera == undefined)');
        }
      });
    }

    return {getPicture: getPicture}

});
