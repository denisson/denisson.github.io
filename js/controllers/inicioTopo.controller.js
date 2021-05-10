angular
  .module('app.controllers')
  .controller('inicioTopoController', ['$scope', '$rootScope', 'PerfilFiltroService', function ($scope, $rootScope, PerfilFiltroService) {
    $scope.perfilFiltro = PerfilFiltroService.getAtual();
    
    $scope.aoAlterarPerfilFiltro = function(filtro) {
      $scope.perfilFiltro = filtro;
      PerfilFiltroService.setAtual(filtro);
      $scope.$broadcast('alterarPerfilFiltro', filtro);
    }

    $scope.$on('$ionicView.enter', function(){
      if (PerfilFiltroService.diferenteDoAtual($scope.perfilFiltro)) {
        $scope.aoAlterarPerfilFiltro(PerfilFiltroService.getAtual());
      }
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
