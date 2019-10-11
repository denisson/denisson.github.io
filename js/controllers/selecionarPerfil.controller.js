angular
  .module('app.controllers')
  .controller('selecionarPerfilController', ['$scope', '$state', '$stateParams', 'DataService', 'AuthService', function ($scope, $state, $stateParams, DataService, AuthService) {

    $scope.selecionarPerfil = function(perfilCompleto){
      AuthService.atualizarPerfilCompleto(perfilCompleto);
      AuthService.goToInicioPerfil(perfilCompleto);
    }
    
    if(!$scope.perfis || $scope.perfis.length == 0){
      DataService.usuarioPerfis().then(function(perfis){
        AuthService.setPerfisUsuario(perfis);
        if(!perfis || perfis.length == 0){
          AuthService.goToCadastro();
        } else {
          $scope.perfis = perfis;
        }
      });
    }

    $scope.podeCadastrarTime = function(){
      return !_.some($scope.perfis, {tipo: 'Time'});
    }

    $scope.cadastrarTime = function(){
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

  }])
