angular
  .module('app.controllers')
  .controller('cadastroRachaController', ['$scope', '$state', '$stateParams', 'DataService', '$ionicModal', 'AuthService', '$rootScope', 'CameraService', '$ionicHistory', '$ionicPopup', function ($scope, $state, $stateParams, DataService, $ionicModal, AuthService, $rootScope, CameraService, $ionicHistory,  $ionicPopup) {

    $scope.cadastradoPelaLiga = $stateParams.id;

    function configurarRachaVazio(){
      $scope.racha = {
        duracao: '01:30'
      };
    };
    configurarRachaVazio();

    $scope.podeSalvar = function(){
      try{
        return $scope.racha.dia && ($scope.racha.hora != undefined) && ($scope.racha.duracao != undefined) && $scope.racha.local._id;
      } catch (exception){
        return false;
      }
    }

    $ionicModal.fromTemplateUrl('templates/jogos/selecionarLocal.html', {
      scope: $scope,
      focusFirstInput: true,
    }).then(function(modal){
      $scope.modalLocal = modal;
    });

    $scope.localSelecionado = function(local){
      $scope.racha.local = local;
      $scope.modalLocal.hide();
    }

    $scope.cancelar = function(){
      if($ionicHistory.backView()){
        $ionicHistory.goBack();
      } else {
        $state.go('abasInicio.meuTime');
      }
    }

    $scope.salvar = function(){

      var racha = {
        local: $scope.racha.local,
        hora: $scope.racha.hora,
        duracao: {
            horas: getDuracaoHoras(),
            minutos: getDuracaoMinutos()
        },
        responsavel: $scope.racha.responsavel,
        telefone: $scope.racha.telefone,
        nome: $scope.racha.nome,
      }

      DataService.salvarRacha(racha, $stateParams.id).then(function(retorno){
        racha._id = retorno.id;
        $ionicHistory.nextViewOptions({
          // disableAnimate: true,
          disableBack: true
        });
        AuthService.redirectClean('racha', null, {id: racha._id}).then(configurarRachaVazio);
      });
    }

    $scope.getDuracaoHoras = function(){
        return $scope.racha.hora.split(':')[0];
    }

    $scope.getDuracaoMinutos = function(){
        return $scope.racha.hora.split(':')[1];
    }
}])
