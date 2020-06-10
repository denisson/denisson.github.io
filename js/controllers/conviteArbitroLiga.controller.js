angular
  .module('app.controllers')
  .controller('conviteArbitroLigaController', ['$rootScope', '$scope', '$state', '$stateParams', 'DataService', 'AuthService', '$ionicActionSheet', '$ionicHistory', '$ionicPopup', '$ionicModal', 'config', function ($rootScope, $scope, $state, $stateParams, DataService, AuthService, $ionicActionSheet,$ionicHistory, $ionicPopup, $ionicModal, config) {

    $scope.liga = null;
    $scope.usuarioJaTemPerfil = false;

    function mostrarAlerta(mensagem){
      $ionicPopup.alert({
        title: 'Ops!',
        content: mensagem
      });
    }

    DataService.validarTokenLiga($stateParams.ligaId, $stateParams.token, AuthService.getUsuarioId()).then(function(result){
      if(!result.liga){
          mostrarAlerta('Essa liga não existe mais');
          return;
      }
      $scope.liga = result.liga;
      if(AuthService.isAuthenticated()){
        AuthService.salvarConvite({papel: 'Arbitro', ligaId: $scope.liga._id, token:$stateParams.token});
      }
      if(result.perfil){
        $scope.usuarioJaTemPerfil = true;
        AuthService.atualizarPerfil(result.perfil, result.tokenPerfil);
        $rootScope.$broadcast('alterarRegiao', AuthService.getPerfilFiltro());
      }
    }).catch(function(){
        mostrarAlerta('Este convite não é mais válido... Que tal pedir um link atualizado?');
    });

    $scope.usuarioLogado = function(){
      return AuthService.isAuthenticated();
    }

    $scope.authenticate = function(provider) {
      // $auth.authenticate(provider);
      AuthService.login(provider, {convite: {papel: 'Arbitro', ligaId: $scope.liga._id, token:$stateParams.token} });
    };

    $scope.continuar = function(provider) {
      if(AuthService.getArbitro()){
        AuthService.limparConvite('Arbitro');
        $state.go('arbitro');
      } else {
        $state.go('cadastrarArbitro');
      }
    };

    $scope.sair = function(){
      AuthService.logout();
    }

}])
