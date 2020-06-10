angular
  .module('app.controllers')
  .controller('inicioTopoController', ['$scope', '$rootScope', 'AuthService', function ($scope, $rootScope, AuthService) {
    $scope.perfilFiltro = AuthService.getPerfilFiltro();

    $rootScope.$on('alterarRegiao', function(event, filtro){
      $scope.perfilFiltro = filtro;
    });

    $scope.formatarFiltro = function(filtro){
      if(_.get(filtro, 'esporte.efootball')){
        var nomePlataforma = _.get(filtro, 'plataforma.nome');
        return filtro.esporte.nome + (nomePlataforma ? " • " + nomePlataforma : "");
      } else {
        return filtro.regiao || 'BR';
      }
    }

  }]);
