angular
  .module('app.controllers')
  .controller('propostaJogoController', ['$scope', '$state', '$stateParams', 'DataService', 'AuthService', '$ionicModal', function ($scope, $state, $stateParams, DataService, AuthService, $ionicModal) {

    $scope.propostaJogo = null;

    $scope.$on('$ionicView.enter', function(){
      DataService.propostaJogo($stateParams.id).then(function(propostaJogo){
        $scope.propostaJogo = propostaJogo;
      });
    });


    // $scope.confirmarAmistoso = function(mandoCampo, data){
    //   $scope.amistoso = {
    //     mandante: mandoCampo.time,
    //     visitante: AuthService.getTime(),
    //     dataHora: moment(data + ' ' + mandoCampo.horario, 'DD/MM/YYYY HH:mm'),
    //     local: mandoCampo.local
    //   }
    //   $scope. modalConfirmarAmistoso.show();
    // }


    $scope.confirmarJogo = function(propostaJogo){
      DataService.confirmarPropostaJogo($scope.propostaJogo._id, $scope.propostaJogo.mandante._id).then(function(result){
        $state.go('abasInicio.meuTime');
      });
    }
     
  }])
