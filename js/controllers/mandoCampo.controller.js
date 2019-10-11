angular
  .module('app.controllers')
  .controller('mandoCampoController', ['$scope', '$state', '$stateParams', 'DataService', 'AuthService','$ionicModal', '$ionicPopup',  function ($scope, $state, $stateParams, DataService, AuthService, $ionicModal, $ionicPopup) {

  $scope.time = AuthService.getTime();


    $ionicModal.fromTemplateUrl('templates/times/informarTelefone.html', {
      scope: $scope,
      animation: 'no-animation',
      focusFirstInput: true,
    }).then(function(modal){
      $scope.modalTelefone = modal;
    });


}])
