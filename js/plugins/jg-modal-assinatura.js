angular.module('app')
.factory('$jgModalAssinatura', [
  '$q',
  '$ionicModal',
  'AuthService',
function($q, $ionicModal, AuthService) {

    // AuthService.setUserPro(false);//TODO: remove

  return {
    confirmarAssinatura: function(feature){
      return action(feature, AuthService.isUsuarioPro());
    },
    confirmarAssinaturaTime: function (feature, timeId, timePro){
      // usuário que está logado é admin de um time pro. Mesmo que o usuário não seja PRO, ele pode acessar as funcionalidades somente do time que ele está logado.
      var timeProLogado = timePro && timeId && AuthService.getTime() && (timeId === AuthService.getTime());
      //O usuário logado é PRO, então consegue acessar as funcionalidades de qualquer time que seja PRO também, mesmo não sendo o dono do time
      var usuarioProTimePro = AuthService.isUsuarioPro() && timePro;
      return action(feature, timeProLogado || usuarioProTimePro)
    },
    confirmarAssinaturaUmDosTimes: function(feature, timeA, timeB){
      var usuarioDeUmDosTimes = timeA == AuthService.getTime() || timeB == AuthService.getTime();
      var regraValidacao = (usuarioDeUmDosTimes && AuthService.isTimePro()) || AuthService.isUsuarioPro();
      return action(feature, regraValidacao);
    }
  };

  function action(feature, liberarAcesso) {
    var deferred = $q.defer();

    if (liberarAcesso){
      deferred.resolve();
    } else {
      $ionicModal.fromTemplateUrl('templates/assinaturaModal.html', {
        // scope: scopeModal,
        animation: 'fade-in'
      }).then(function(modal){
        modal.show();
        modal.scope.feature = feature;
        modal.scope.$on('fechar-modal', function () {
            modal.hide();
            deferred.reject();
        });

        modal.scope.$on('assinatura-finalizada', function () {
            modal.hide();
            // AuthService.setUserPro(true);//TODO: remove
            deferred.resolve();
        });
      
      });
    }
    return deferred.promise;
  }
}]);