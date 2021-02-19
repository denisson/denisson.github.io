angular
.module('app.controllers')
.controller('cadastrarJogadorController', ['$scope', '$rootScope', '$stateParams', '$state', 'DataService',
    function ($scope, $rootScope, $stateParams, $state, DataService) {
        $scope.dadosCarregados = false;
        $scope.timeId = $stateParams.timeId;
        if ($stateParams.id && $stateParams.jogador) {
            $scope.jogador = $stateParams.jogador;
            $scope.dadosCarregados = true;
        } else if ($stateParams.id){
            DataService.jogador($stateParams.id).then(function(jogador){
                $scope.jogador = jogador;
                $scope.dadosCarregados = true;
            });
        } else {
            $scope.dadosCarregados = true;
        }

        $scope.aposSalvar = function() {
            $state.go('time');
        }
    }
])
