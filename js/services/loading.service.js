angular
  .module('app.services')
  .service('LoadingService', function($rootScope, $ionicPopup) {
    var popup = null;
    $rootScope.$on('loading.init', function () {
      if(!popup){
        popup = $ionicPopup.show({
          template: '<ion-spinner icon="spiral"></ion-spinner> Processando...',
          cssClass: 'popup-loading'
        });        
      }
    });

    $rootScope.$on('loading.finish', function () {
      if(popup){ popup.close();}
      popup = null;
    });
});
