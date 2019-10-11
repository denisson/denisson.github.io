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
        $scope.jogo.placar = $scope.jogo.placar || {mandante: 0, visitante: 0};
      });
    } else {
      $scope.jogo.placar = {mandante: 0, visitante: 0};
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
      AuthService.redirectClean('jogo', null, {id: $scope.jogo._id});
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
