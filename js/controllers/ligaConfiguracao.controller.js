angular
  .module('app.controllers')
  .controller('ligaConfiguracaoController', ['$rootScope', '$scope', '$state', '$stateParams', 'DataService', 'AuthService', '$ionicActionSheet', '$ionicHistory', '$ionicPopup', '$ionicModal', 'config', function ($rootScope, $scope, $state, $stateParams, DataService, AuthService, $ionicActionSheet,$ionicHistory, $ionicPopup, $ionicModal, config) {
  	$scope.liga = null;

  	DataService.ligaConfiguracao($stateParams.id).then(function(liga){
  		$scope.liga = liga;
  	});

    $scope.salvar = function(){
        DataService.editarConfiguracaoLiga({_id: $scope.liga._id, arbitragem: $scope.liga.arbitragem}).then(function(liga){
          $state.go('liga', {id: liga.id});
        });
    }

}])
