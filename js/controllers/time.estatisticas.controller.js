angular
  .module('app.controllers')
  .controller('timeEstatisticasController', ['$scope', '$state', '$stateParams', 'DataService', 'AuthService', '$ionicPopup', function ($scope, $state, $stateParams, DataService, AuthService, $ionicPopup) {
    $scope.temporada = $stateParams.temporada = $stateParams.temporada || moment().year();
    $scope.timeId = $stateParams.id || AuthService.getTime();
    $scope.competicao = $stateParams.competicao;
    
    DataService.time($scope.timeId, $stateParams.temporada).then(function(time){
        $scope.time = time;
    });

    $scope.carregarEstatisticas = function (){
        DataService.timeEstatisticas($scope.timeId, $scope.temporada, $scope.mes, $scope.competicao).then(function(estatisticas){
            $scope.estatisticas = estatisticas;
            
            $scope.saldoGolsDados = estatisticas.numerosPorJogo.map(function(numeros){
                return {t: moment(numeros.jogo.dataHora), y: numeros.saldoGols, jogo: numeros.jogo};
            });
    
            $scope.golsProDados = estatisticas.numerosPorJogo.map(function(numeros){
                return {t: moment(numeros.jogo.dataHora), y: numeros.golsPro};
            });
    
            $scope.golsContraDados = estatisticas.numerosPorJogo.map(function(numeros){
                return {t: moment(numeros.jogo.dataHora), y: numeros.golsContra * -1};
            });
    
            $scope.jogadoresDados = estatisticas.numerosPorJogo.map(function(numeros){
                return {t: moment(numeros.jogo.dataHora), y: numeros.jogadores, jogo: numeros.jogo};
            });
            
        }).catch(function(){
            mostrarAlerta('Não foi possível carregar as estatísticas do time');
        });
    }

    $scope.carregarEstatisticas();

    $scope.verAdversarios = function(ordem){
        $state.go('time_adversarios', {id: $scope.timeId, temporada: $scope.temporada, ordem: ordem, time: $scope.time});
    }

    $scope.verHistoricoConfrontos = function(adversario){
        $state.go('times_confrontos', {idTimeA: $scope.timeId, idTimeB: adversario._id || adversario.nome, temporada: $scope.temporada,});
    }

    $scope.alterarPeriodo = function (temporada, mes){
        $scope.temporada = temporada || 'todas';
        $scope.mes = mes;
        $scope.carregarEstatisticas();
    }

    $scope.verCompeticao = function (competicao) {
        $state.go('time_estatisticas', {id: $scope.timeId, temporada: 'todas', competicao: competicao._id });
    }

    function mostrarAlerta(mensagem){
        $ionicPopup.alert({
          title: 'Ops!',
          content: mensagem
        }).then(function(){
          // $ionicHistory.goBack();
        });
      }

}])
