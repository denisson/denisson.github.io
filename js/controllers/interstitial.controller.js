angular
  .module('app.controllers')
  .controller('interstitialController', ['$scope', '$state', '$stateParams', 'DataService', 'AuthService', function ($scope, $state, $stateParams, DataService, AuthService) {

    $scope.irParaUrl = function(url){
      window.open(url, '_system');
      return false;
    }

    $scope.irParaAnuncio = function(url){
      $scope.irParaUrl('https://cntr.click/9ct8RR7');
    }
    
    $scope.pularAnuncio = function(){
      AuthService.redirectClean($stateParams.rota, null, $stateParams.parametros);
    }

  }])
