angular
  .module('app.controllers')
  .controller('rankingTimesController', ['$scope', '$rootScope', '$stateParams', 'DataService', 'AuthService', function ($scope, $rootScope, $stateParams, DataService, AuthService) {

      $scope.times = [];
      $scope.perfilFiltro = AuthService.getPerfilFiltro();
      $scope.tipoRanking = 'vitorias';

      $scope.aoAlterarPerfilFiltro = function(filtro){
        $scope.perfilFiltro = filtro;
        $scope.carregarTimes();
      }
      
      $scope.carregarTimes = function(){
        var esporte = _.get($scope.perfilFiltro, 'esporte.chave');
        var regiao = $scope.perfilFiltro.regiao;
        var plataforma = _.get($scope.perfilFiltro, 'plataforma.chave');
        if(regiao || _.get($scope.perfilFiltro, 'esporte.efootball')){
          return DataService.rankingGeralTimes($scope.tipoRanking, esporte, regiao, plataforma).then(function(times){
              $scope.times = times;
          });
        }
      }
      $scope.formatarFiltro = function(filtro){
        if(_.get(filtro, 'esporte.efootball')){
          var nomePlataforma = _.get(filtro, 'plataforma.nome');
          return filtro.esporte.nome + (nomePlataforma ? " • " + nomePlataforma : "");
        } else {
          return filtro.regiao || 'BR';
        }
      }

      $scope.alterTipoRanking = function(tipoRanking){
        $scope.tipoRanking = tipoRanking;
        $scope.carregarTimes();
      }

      $scope.carregarTimes();

  }])
