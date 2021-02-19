angular
  .module('app.controllers')
  .controller('timeAdversariosController', ['$scope', '$stateParams', 'DataService', 'AuthService', '$ionicPopup', '$state', function ($scope, $stateParams, DataService, AuthService, $ionicPopup, $state) {
    $scope.temporada = $stateParams.temporada = $stateParams.temporada || moment().year();
    $scope.timeId = $stateParams.id || AuthService.getTime();
    
    if(!$stateParams.time) {
        DataService.time($scope.timeId).then(function(time){
            $scope.time = time;
        });
    } else {
        $scope.time = $stateParams.time;
    }


    DataService.timeAdversarios($scope.timeId, $stateParams.temporada, $stateParams.ordem).then(function(adversarios){
        $scope.adversarios = adversarios;
    }).catch(function(){
        mostrarAlerta('Não foi possível carregar a lista de adversários');
    });

    function mostrarAlerta(mensagem){
        $ionicPopup.alert({
          title: 'Ops!',
          content: mensagem
        });
    }

    $scope.verHistoricoConfrontos = function(adversario){
        $state.go('times_confrontos', {idTimeA: $scope.timeId, idTimeB: adversario._id || adversario.nome});
    }

}])
