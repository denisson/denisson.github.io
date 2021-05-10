angular
  .module('app.controllers')
  .controller('selecionarPerfilController', ['$scope', '$rootScope',  '$state', 'DataService', 'AuthService', 'PerfilFiltroService', '$jgModalAssinatura',
  function ($scope, $rootScope, $state, DataService, AuthService, PerfilFiltroService, $jgModalAssinatura) {

    $scope.selecionarPerfil = function(perfilCompleto){
      AuthService.atualizarPerfilCompleto(perfilCompleto);
      AuthService.goToInicioPerfil(perfilCompleto);
      // $rootScope.$broadcast('alterarRegiao', );
      PerfilFiltroService.setAtual(AuthService.getPerfilFiltro());
    }
    
    if(!$scope.perfis || $scope.perfis.length == 0){
      DataService.usuarioPerfis().then(function(usuario){
        AuthService.setUserPro(usuario.pro);
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
      if($scope.jaTemTimeCadastrado()){
        $jgModalAssinatura.confirmarAssinatura('times').then(function(){
          irParaCadastroTime();
        });
      } else {
        irParaCadastroTime();
      }
    }

    function irParaCadastroTime(){
      AuthService.atualizarPerfil(null);
      // $rootScope.$broadcast('alterarRegiao', AuthService.getPerfilFiltro());
      PerfilFiltroService.setAtual(AuthService.getPerfilFiltro());
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
