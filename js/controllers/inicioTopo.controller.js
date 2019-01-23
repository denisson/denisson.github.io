angular
  .module('app.controllers')
  .controller('inicioTopoController', ['$scope', 'AuthService', function ($scope, AuthService) {
    $scope.regiao = AuthService.getRegiao() || 'BR';

    $scope.$on('alterarRegiao', function(event, regiao){
      $scope.regiao = regiao;
    });
  }]);
