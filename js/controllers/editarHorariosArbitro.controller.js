angular
  .module('app.controllers')
  .controller('editarHorariosArbitroController', ['$rootScope', '$scope', '$state', '$stateParams', 'DataService', 'AuthService', '$ionicActionSheet', '$ionicHistory', '$ionicPopup', '$ionicModal' , function ($rootScope, $scope, $state, $stateParams, DataService, AuthService, $ionicActionSheet,$ionicHistory, $ionicPopup, $ionicModal) {
  
    $scope.arbitro = $stateParams.arbitro;

    $scope.horariosAlterados = function(horarios){
      $scope.arbitro.horariosDisponiveis = horarios;
    }

    $scope.salvar = function(){
      var arbitroSalvar = {
        _id: $scope.arbitro._id,
        horariosDisponiveis: $scope.arbitro.horariosDisponiveis
      };
      DataService.editarArbitro(arbitroSalvar).then(function(arbitro){
        $state.go('arbitro', {id: $scope.arbitro._id});
      });
    }

}])
