angular
  .module('app.services')
  .service('CameraService', function($cordovaCamera, DataService, $ionicPopup, $ionicPlatform) {

    function getPicture(){
      return new Promise(function(resolve, reject){

        
        var permissions = window.cordova.plugins.permissions;

        var error = function(){
          mostrarErroPermissao();
          reject('Não tem permissão para acessar a galeria de fotos');
          DataService.logError('Não tem permissão para acessar a galeria de fotos');
        }

        permissions.requestPermission(permissions.READ_EXTERNAL_STORAGE, function(status){
          if( !status.hasPermission ) return error();
          abrirGaleria(resolve, reject);
        }, error);
        
        
      });
    }

    function mostrarErroPermissao(){
      var titulo = 'Configurar permissões';
      var texto = 'Para conseguir enviar uma imagem você precisa permitir que o Jogueiros acesse os arquivos do seu celular. Para isso altere as configurações do seu aparelho.';
      if (window.cordova && window.cordova.plugins.settings) {
          $ionicPopup.confirm({
            title: titulo,
            content: texto,
            okText: 'Configurar'
          }).then(function(res) {
            if(res && $ionicPlatform.is('android')) {
                window.cordova.plugins.settings.open("application_details_storage");
            } else if(res && $ionicPlatform.is('ios')) {
              window.cordova.plugins.settings.open("application_details");
            }
          });
      } else {
        $ionicPopup.alert({title: titulo, content: text});
      }
    }

    function abrirGaleria(resolve, reject){
      if (typeof Camera != 'undefined'){ // Executando no celular
        var options = {
          quality: 100,
          destinationType: Camera.DestinationType.DATA_URL,
          sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
          allowEdit: false,
          encodingType: Camera.EncodingType.PNG,
          mediaType: Camera.MediaType.PICTURE,
          targetWidth: 400,
          targetHeight: 400,
          // correctOrientation:true
        };
    
        $cordovaCamera.getPicture(options).then(function(imagePath) {
          resolve("data:image/png;base64," +  imagePath)
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
    }

    return {getPicture: getPicture}

});
