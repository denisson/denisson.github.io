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



  $scope.enviar = function(){
    tratarModalidadeParaEnvio();
    if(editando()){
      var timeSalvar = angular.copy($scope.time);
      if(!$scope.fotoAlterada) {
        timeSalvar.escudo = '';
      }
      
      DataService.editarTime(timeSalvar).then(function(time){
        AuthService.atualizarTime(time);
        $state.go('abasInicio.paginaDoTime-aba-time', {id: time._id});
      });
    } else {
      $scope.time.dono = AuthService.getUsuarioId();
      DataService.salvarTime($scope.time).then(function(resposta){
        AuthService.atualizarTime(resposta.time, resposta.token);
        $state.go('abasInicio.editarTime', {id: resposta.time._id});
      });
    }
  }

}])
