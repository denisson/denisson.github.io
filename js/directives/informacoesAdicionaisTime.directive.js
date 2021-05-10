angular.module('app.directives')
.directive('informacoesAdicionaisTime', ['$ionicModal', 'DataService', '$ionicPopup', function($ionicModal, DataService, $ionicPopup){
    return {
        restrict: 'E',
        templateUrl: 'templates/times/informacoesAdicionaisTime.html',
        scope: {time: '='},
        link: function($scope) {
          $scope.aoInformarTelefone = function(telefone) {
            DataService.editarTime({_id: $scope.time.id, telefone: telefone});
          }
        }
    };
}])