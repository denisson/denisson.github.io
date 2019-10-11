angular
  .module('app.controllers')
  .controller('cadastrarArbitroController', ['$scope', '$state', '$stateParams', 'DataService', 'CameraService', 'AuthService','$ionicModal', '$ionicPopup',  function ($scope, $state, $stateParams, DataService, CameraService, AuthService, $ionicModal, $ionicPopup) {
    var imagePath = '';
    $scope.arbitro = null;


  if(editando()){
    $scope.arbitroId = AuthService.getArbitro();

    DataService.arbitro($scope.arbitroId).then(function(arbitro){
      $scope.arbitro = arbitro;
    });

    $scope.titulo = 'Editar perfil';
    $scope.labelBotao = 'Salvar';
  } else if (AuthService.getArbitro()) {
   AuthService.redirectClean('abasInicio.meuPerfil');
  } else {
    $scope.conviteDaLiga = AuthService.getConvite('Arbitro');
    $scope.arbitro = {nome: '', foto: ''};
    $scope.titulo = 'Cadastro';
    $scope.labelBotao = 'Confirmar cadastro';
  }

  function editando(){
    return AuthService.getArbitro() && ($stateParams.id == AuthService.getArbitro());
  }

  $scope.capturarFoto = function(){
    CameraService.getPicture().then(function(imagePath){
        $scope.arbitro.foto = imagePath;
        $scope.fotoAlterada = true;
        $scope.$apply();
    });
  };

  $scope.enviar = function(){
    if(editando()){
      var arbitroSalvar = angular.copy($scope.arbitro);
      if(!$scope.fotoAlterada) {
        arbitroSalvar.foto = '';
      }
      
      DataService.editarArbitro(arbitroSalvar).then(function(arbitro){
        // AuthService.atualizarArbitro(arbitro);
        $state.go('arbitro', {id: arbitro.id});
      });
    } else {
      $scope.arbitro.usuario = AuthService.getUsuarioId();
      $scope.arbitro.liga = $scope.conviteDaLiga ? $scope.conviteDaLiga.ligaId : null;
      $scope.arbitro.token = $scope.conviteDaLiga ? $scope.conviteDaLiga.token : null;
      DataService.salvarArbitro($scope.arbitro).then(function(resposta){
        AuthService.atualizarPerfil(resposta.perfil, resposta.token)
        AuthService.limparConvite('Arbitro');
        $state.go('arbitro');
      });
    }
  }

  $scope.sair = function(){
    AuthService.logout();
  }
}])
