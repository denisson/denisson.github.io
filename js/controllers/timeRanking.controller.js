angular
  .module('app.controllers')
  .controller('timeRankingController', ['$rootScope', '$scope', '$state', '$stateParams', 'DataService', 'AuthService', '$ionicActionSheet', '$ionicHistory', '$ionicPopup', '$ionicModal' , function ($rootScope, $scope, $state, $stateParams, DataService, AuthService, $ionicActionSheet,$ionicHistory, $ionicPopup, $ionicModal) {
 
    function mostrarAlerta(mensagem){
      $ionicPopup.alert({
        title: 'Ops!',
        content: mensagem
      }).then(function(){
        $ionicHistory.goBack();
      });
    }

    $scope.id = $stateParams.id;
      
    DataService.timeRanking($scope.id).then(function(timeRanking){
      $scope.timeRanking = timeRanking;
    }).catch(function(){
        mostrarAlerta('Não foi possível carregar as informações deste time');
    });

    $scope.verTime = function(time){
      $state.go('time', {id: time._id});
    }

    $scope.pluralize = function(quantidade, palavra){
      if(quantidade == 1) {
        return palavra;
      } else {
        return palavra + 's';
      }
    }

}])
