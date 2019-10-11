angular
  .module('app.controllers')
  .controller('cadastrarLigaController', ['$scope', '$state', '$stateParams', 'DataService', 'CameraService', 'AuthService','$ionicModal', '$ionicPopup',  function ($scope, $state, $stateParams, DataService, CameraService, AuthService, $ionicModal, $ionicPopup) {
    $scope.liga = null;


  if(editando()){
    $scope.ligaId = AuthService.getLiga();

    DataService.liga($scope.ligaId).then(function(liga){
      $scope.liga = liga;
    });

    $scope.titulo = 'Editar perfil';
    $scope.labelBotao = 'Salvar';
  } else if (AuthService.getLiga()) {
    AuthService.redirectClean('liga');
  } else {
    $scope.liga = {nome: '', escudo: ''};
    $scope.titulo = 'Cadastro';
    $scope.labelBotao = 'Confirmar cadastro';
  }

  function editando(){
    return AuthService.getLiga() && ($stateParams.id == AuthService.getLiga());
  }

  $scope.capturarFoto = function(){
    CameraService.getPicture().then(function(imagePath){
        $scope.liga.escudo = imagePath;
        $scope.fotoAlterada = true;
        $scope.$apply();
    });
  };

  $scope.enviar = function(){
    if(editando()){
      var ligaSalvar = angular.copy($scope.liga);
      if(!$scope.fotoAlterada) {
        ligaSalvar.escudo = '';
      }
      
      DataService.editarLiga(ligaSalvar).then(function(liga){
        // AuthService.atualizarArbitro(arbitro);
        AuthService.redirectClean('liga', null, {id: liga.id});
      });
    } else {
      // $scope.liga.usuario = AuthService.getUsuarioId();
      // DataService.salvarArbitro($scope.liga).then(function(resposta){
      //   // AuthService.atualizarArbitro(resposta.liga, resposta.token);
      //   $state.go('editarArbitro', {id: resposta.liga});
      // });
    }
  }

  $scope.cidadesAtuacaoSelecionadas = function(cidades){
    $scope.liga.cidadesAtuacao = cidades;
  }

  $scope.cidadeSelecionada = function(cidade, estado){
    $scope.liga.cidade = cidade;
    $scope.liga.cidadesAtuacao = [cidade];
    $scope.estadoCidadesAtuacao = estado;
  }

  $scope.nomesCidadesAtuacao = function(){
   return _.map($scope.liga.cidadesAtuacao, 'nome').join(', '); 
  }
  
  $scope.sair = function(){
    AuthService.logout();
  }

}])
