angular
  .module('app.controllers')
  .controller('loginController', ['$scope', '$state', '$stateParams', '$auth', 'AuthService', function ($scope, $state, $stateParams, $auth, AuthService) {
    $scope.authenticate = function(provider) {
      // $auth.authenticate(provider);
      AuthService.login(provider);
    };
  }]);
