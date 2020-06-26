angular
  .module('app.controllers')
  .controller('placarController', ['$scope', '$stateParams', '$state', 'DataService', '$ionicPopup', '$ionicHistory', 'AuthService',   function ($scope, $stateParams, $state, DataService, $ionicPopup, $ionicHistory, AuthService) {
    $scope.jogo = $stateParams.jogo;
    if(!$scope.jogo){
      DataService.jogo($stateParams.id).then(function(jogo){
        if(!jogo){
            mostrarAlerta('Esse jogo não foi encontrado');
            return;
        }
        $scope.jogo = jogo;
        checarEditando();
      });
    } else {
      checarEditando();
    }

    function checarEditando(){
      if($scope.jogo.encerrado){
        $scope.titulo = 'Corrigir placar';
        $scope.botaoVoltar = 'Cancelar';
        $scope.editando = true;
        $scope.jogo.placar = $scope.jogo.placar || {mandante: 0, visitante: 0};
      } else {
        $scope.jogo.placar = {mandante: 0, visitante: 0};
        $scope.editando = false;
        $scope.titulo = 'Informar placar';
        $scope.botaoVoltar = 'Informar depois';
      }
    }
    
    $scope.increment = function(time) {
      $scope.jogo.placar[time] ++;
    };

    $scope.decrement = function(time) {
      if ($scope.jogo.placar[time] > 0) $scope.jogo.placar[time]--;
    };

    $scope.salvarPlacar = function(){
      DataService.salvarPlacar($scope.jogo._id, $scope.jogo.placar).then(function(retorno){
        if($scope.jogo.temSolicitacaoArbitragem){
          AuthService.redirectClean('jogo', null, {id: $scope.jogo._id});
        } else {
          AuthService.redirectClean('informarSumula', null, {id:$scope.jogo._id, jogo: $scope.jogo, time:'mandante'});
        }
      });
    };

    $scope.informarDepois = function(){
      if(AuthService.isUsuarioPro()){
        AuthService.redirectClean('jogo', null, {id: $scope.jogo._id});
      } else {
        AuthService.redirectClean('interstitial', null, {rota: 'jogo', parametros: {id: $scope.jogo._id}});
      }
      
    }


    function mostrarAlerta(mensagem){
      $ionicPopup.alert({
        title: 'Ops!',
        content: mensagem
      }).then(function(){
        $ionicHistory.goBack();
      });
    }
}])
