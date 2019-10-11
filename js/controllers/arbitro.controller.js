angular
  .module('app.controllers')
  .controller('arbitroController', ['$rootScope', '$scope', '$state', '$stateParams', 'DataService', 'AuthService', '$ionicActionSheet', '$ionicHistory', '$ionicPopup', '$ionicModal' , function ($rootScope, $scope, $state, $stateParams, DataService, AuthService, $ionicActionSheet,$ionicHistory, $ionicPopup, $ionicModal) {
 
    $scope.$on('$ionicView.enter', function(){
      DataService.blockPopup();
      $scope.atualizar();
    });

    function mostrarAlerta(mensagem){
      $ionicPopup.alert({
        title: 'Ops!',
        content: mensagem
      }).then(function(){
        $ionicHistory.goBack();
      });
    }

    $scope.atualizar = function(){

      $scope.arbitroId = $stateParams.id || AuthService.getArbitro();
      
      DataService.arbitro($scope.arbitroId).then(function(arbitro){
        if(!arbitro){
            mostrarAlerta('Esse perfil não existe mais');
            return;
        }
        
        if(arbitro.jogos.encerrados && !$scope.exibindoJogosAnteriores){
          $scope.jogosAnteriores = arbitro.jogos.encerrados.slice(0); //clona o array
          var primeirosJogos = $scope.jogosAnteriores.splice(0, 3);
          arbitro.jogos.encerrados = primeirosJogos;
        }

        $scope.arbitro = arbitro;

        // $scope.setTemporada();
        $scope.$broadcast('scroll.refreshComplete');
        $rootScope.$emit('loading.finish');
      }).catch(function(){
          mostrarAlerta('Não foi possível carregar as informações deste perfil');
      });
      //Todo: checar quando falhar a consulta ao banco e exibir um erro
    }

    $scope.editavel = function(){
      return $scope.usuarioArbitro() ||  $scope.usuarioLiga();
    }

    $scope.usuarioArbitro = function(){
      return AuthService.getArbitro() && $scope.arbitroId === AuthService.getArbitro();
    }

    $scope.usuarioLiga = function(){
      return $scope.arbitro && $scope.arbitro.liga == AuthService.getLiga();
    }

    $scope.editarPerfil = function(){
      if($scope.editavel()){
        $state.go('editarArbitro', {id: $scope.arbitro._id});
      } else {
        // $scope.exibirModalTime($scope.time);
      }
    }


    $scope.exibirMenu = function(){
      var botoes = [];
      var destructiveText = 'Excluir árbitro';
      if($scope.usuarioArbitro()){
        botoes = [ 
         { text: 'Editar Perfil' },
         { text: 'Gerenciar perfis' },
        ];
        destructiveText = 'Sair';
      }

      $ionicActionSheet.show({
       buttons: botoes,
       destructiveText: destructiveText,
       cancelText: 'Cancelar',
       destructiveButtonClicked: function(){
          if($scope.usuarioArbitro()){
            AuthService.logout();
          } else {
            $scope.excluirArbitro($scope.arbitro);
          }
          return true;
       },
       buttonClicked: function(index) {
          switch(index){
            case 0: 
              $scope.editarPerfil();
              break;
            case 1:
              $scope.selecionarPerfil();
              break;
          }
         return true;
       }
      });
    }

    $scope.selecionarPerfil = function(){
      $state.go('selecionarPerfil');
    }

    $scope.verJogos = function(proximos){
      $state.go('arbitroJogos', {id: $scope.arbitroId, nomeArbitro: $scope.arbitro.nome, proximos: proximos});
    }

    $scope.excluirArbitro = function(arbitro){
        var confirmPopup = $ionicPopup.confirm({
          title: 'Confirmar exclusão',
          content: 'Deseja realmente remover '+ arbitro.nome +'?<br/> Ele será retirado dos jogos que ele tinha sido escalado.'
        });
       confirmPopup.then(function(res) {
         if(res) {
            DataService.excluirArbitro(arbitro._id).then(function(){
              // _.remove($scope.liga.arbitros, {_id: arbitro._id});
              $state.go('liga');
            }, function(err){
              $ionicPopup.alert({
                title: 'Erro',
                content: err.data.erro
              });
            });
         }
       });
    }

    $scope.editarHorariosDisponiveis = function(){
      $state.go('editarHorariosArbitro', {arbitro: $scope.arbitro});
    }

}])
