angular
  .module('app.controllers')
  .controller('adminController', ['$scope', '$rootScope', '$stateParams', 'DataService', 'AuthService', function ($scope, $rootScope, $stateParams, DataService, AuthService) {

      // $scope.dados = [];
      $scope.perfilFiltro = AuthService.getPerfilFiltro();
      $scope.tipoGrafico = 'jogosCadastrados';

      $rootScope.$on('alterarRegiao', function(event, filtro){
        $scope.perfilFiltro = filtro;
        $scope.carregarDados();
      });

      
      $scope.carregarDados = function(){
        var esporte = _.get($scope.perfilFiltro, 'esporte.chave');
        var regiao = $scope.perfilFiltro.regiao;
        var plataforma = _.get($scope.perfilFiltro, 'plataforma.chave');
        if(regiao || _.get($scope.perfilFiltro, 'esporte.efootball')){
          return DataService.adminGrafico($scope.tipoGrafico, esporte, regiao, plataforma).then(function(dados){
              $scope.dados = dados;
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

      $scope.alterarTipoGrafico = function(tipoGrafico){
        $scope.tipoGrafico = tipoGrafico;
        $scope.carregarDados();
      }

      $scope.carregarDados();

  }])
