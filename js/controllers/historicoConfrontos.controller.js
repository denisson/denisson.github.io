angular
  .module('app.controllers')
  .controller('historicoConfrontosController', ['$scope', '$stateParams', 'DataService', '$state', '$ionicModal', function ($scope, $stateParams, DataService, $state, $ionicModal) {
    $scope.historicoConfrontos;
    $scope.timeModal;

    $ionicModal.fromTemplateUrl('templates/times/modalJogadoresConfrontos.html', {
        scope: $scope
    }).then(function(modal){
        $scope.modalJogadores = modal;
    });


    DataService.jogoHistoricoConfrontos($stateParams.idTimeA, $stateParams.idTimeB).then(function(result){
        $scope.historicoConfrontos = result;
    });

    $scope.getWidthBar = function(time, propriedade){
        var total = $scope.historicoConfrontos['timeA'][propriedade] + $scope.historicoConfrontos['timeB'][propriedade];
        var percentual = total > 0 ? ($scope.historicoConfrontos[time][propriedade] / total * 100) : 50;
        return {width: percentual + '%'};
    }

    $scope.getWidthBarSaldo = function(time){
        var saldo = $scope.historicoConfrontos[time]['golsPro'] - $scope.historicoConfrontos[time]['golsContra'];
        if( saldo < 0 ) {
            return {width: '0%'};
        } else if ( saldo === 0 ) {
            return {width: '50%'};
        } else if (saldo > 0) {
            return {width: '100%'};    
        }
    }

    $scope.verJogadores = function(time){
        $scope.timeModal = $scope.historicoConfrontos[time];
        $scope.timeModal.hashTime = time;
        $scope.modalJogadores.show();
    }

    $scope.getWidthBarraJogador = function(jogador){
        
        // var total = $scope.timeModal.golsPro;
        var total = $scope.timeModal.jogadores[0].gols;
        var percentual = total > 0 ? (jogador.gols / total * 100) : 0;
        return {width: percentual + '%'};
    }

    $scope.irParaTime = function(time){
        $state.go('time', {id: time._id});
    }

}])
