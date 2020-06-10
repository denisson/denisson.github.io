angular
  .module('app.controllers')
  .controller('timeEstatisticasController', ['$scope', '$stateParams', 'DataService', 'AuthService', '$locale', function ($scope, $stateParams, DataService, AuthService, $locale) {
    $scope.temporada = $stateParams.temporada = $stateParams.temporada || moment().year();
    $scope.timeId = $stateParams.id || AuthService.getTime();
    
    DataService.time($scope.timeId, $stateParams.temporada).then(function(time){
        $scope.time = time;
    });

    DataService.timeEstatisticas($scope.timeId, $stateParams.temporada).then(function(estatisticas){
        $scope.estatisticas = estatisticas;
        
        $scope.saldoGolsDados = estatisticas.numerosPorJogo.map(function(numeros){
            return {t: moment(numeros.jogo.dataHora), y: numeros.saldoGols}
        });

        $scope.golsProDados = estatisticas.numerosPorJogo.map(function(numeros){
            return {t: moment(numeros.jogo.dataHora), y: numeros.golsPro}
        });

        $scope.golsContraDados = estatisticas.numerosPorJogo.map(function(numeros){
            return {t: moment(numeros.jogo.dataHora), y: numeros.golsContra * -1}
        });

        $scope.jogadoresDados = estatisticas.numerosPorJogo.map(function(numeros){
            return {t: moment(numeros.jogo.dataHora), y: numeros.jogadores}
        });
        
    }).catch(function(){
        mostrarAlerta('Não foi possível carregar as informações do time');
    });

}])
