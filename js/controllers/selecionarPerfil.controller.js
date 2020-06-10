angular
  .module('app.controllers')
  .controller('selecionarPerfilController', ['$scope', '$rootScope',  '$state', '$stateParams', 'DataService', 'AuthService', function ($scope, $rootScope, $state, $stateParams, DataService, AuthService) {

    $scope.selecionarPerfil = function(perfilCompleto){
      AuthService.atualizarPerfilCompleto(perfilCompleto);
      AuthService.goToInicioPerfil(perfilCompleto);
      $rootScope.$broadcast('alterarRegiao', AuthService.getPerfilFiltro());
    }
    
    if(!$scope.perfis || $scope.perfis.length == 0){
      DataService.usuarioPerfis().then(function(usuario){
        AuthService.setPerfisUsuario(usuario.perfis);
        if(!usuario.perfis || usuario.perfis.length == 0){
          AuthService.goToCadastro();
        } else {
          $scope.perfis = usuario.perfis;
        }
      });
    }

    $scope.jaTemTimeCadastrado = function(){
      return _.some($scope.perfis, {tipo: 'Time'});
    }

    $scope.cadastrarTime = function(){
      AuthService.atualizarPerfil(null);
      $rootScope.$broadcast('alterarRegiao', AuthService.getPerfilFiltro());
      $state.go('abasInicio.cadastrarTime');
    }

    $scope.getDescricaoPerfil = function(tipo){
      var tipoDescricao = {
        'Arbitro': 'Árbitro',
        'Time': 'Time',
        'Liga': 'Administrador',
        'Jogador': 'Jogador'
      }
      return tipoDescricao[tipo];
    }

    $scope.sair = function(){
      AuthService.logout();
    }

    $scope.usuarioPro = function(){
      return AuthService.isUsuarioPro();
    }

  }])
