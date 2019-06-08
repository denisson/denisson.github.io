angular
  .module('app.controllers')
  .controller('placarController', ['$scope', '$stateParams', '$state', 'DataService', '$ionicPopup', '$ionicHistory',   function ($scope, $stateParams, $state, DataService, $ionicPopup, $ionicHistory) {

    $scope.jogo = $stateParams.jogo;
    if(!$scope.jogo){
      DataService.jogo($stateParams.id).then(function(jogo){
        if(!jogo){
            mostrarAlerta('Esse jogo não foi encontrado');
            return;
        }
        $scope.jogo = jogo;
        $scope.jogo.placar = {mandante: 0, visitante: 0};
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
        // if($scope.jogo.placar.mandante > 0){
          $state.go('informarSumula', {location: 'replace', id:$scope.jogo._id, jogo: $scope.jogo, time:'mandante'});
        // } else {
        //   $state.go('abasInicio.meuTime');
        // }
      });
    };

    $scope.informarDepois = function(){
      $state.go('abasInicio.meuTime');
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
