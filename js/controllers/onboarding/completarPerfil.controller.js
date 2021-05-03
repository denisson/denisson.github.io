angular
.module('app.controllers')
.controller('completarPerfilController', ['$scope', 'DataService', 'AuthService', '$state', function ($scope, DataService, AuthService, $state) {

    $scope.time = {
        _id: AuthService.getTime()
    };

    $scope.salvar = function(){
        DataService.editarTime($scope.time).then(function(){
            $state.go('onboarding_jogo');
        });
    }

}])
