angular
  .module('app.controllers')
  .controller('verJogoController', ['$scope', '$state', '$stateParams', 'DataService', 'AuthService', '$ionicPopup', '$ionicActionSheet', '$ionicHistory', function ($scope, $state, $stateParams, DataService, AuthService, $ionicPopup, $ionicActionSheet, $ionicHistory) {
    $scope.naoInformouGols = function(time){
      //O jogo já foi encerrado (placar informado), mas o time não informou a súmula.
      return $scope.jogo.encerrado && $scope.jogo.jogadores[time].length == 0;
    }

    $scope.informouGols = function(time){
      //caso algum gol tenha sido informado
      return $scope.jogo.jogadores[time].length > 0;
    }

    $scope.editavel = function(time){
      return $scope.jogo 
        && AuthService.getTime() 
        && _.get($scope.jogo[time], ['_id']) === AuthService.getTime()._id;
    }

    $scope.jogoValido = function(){
      return ($scope.jogo.situacao == 'jogoConfirmado' || $scope.jogo.situacao == 'placarConfirmado') && $scope.jogo.visitante['_id'];
    }

    $scope.timeDoUsuario = function(){
      if($scope.editavel('mandante')){
        return 'mandante';
      } else if($scope.editavel('visitante')){
        return 'visitante';
      } else {
        return false;
      }
    }

    $scope.informarSumula = function(){
      $state.go('informarSumula', {id:$scope.jogo._id, jogo: $scope.jogo, time: $scope.timeDoUsuario()});
    }

    $scope.informarPlacar = function(){
      $state.go('informarPlacar', {id: $scope.jogo._id, jogo: $scope.jogo});
    }

    $scope.aguardandoConfirmarJogo = function(){
      return $scope.jogo.situacao == 'confirmarJogo' && $scope.editavel('visitante');
    }

    $scope.aguardandoConfirmarPlacar = function(){
      return $scope.jogo.situacao == 'confirmarPlacar' && $scope.editavel('visitante');
    }

    $scope.confirmarJogo = function(){
      DataService.confirmarJogo($scope.jogo._id, $scope.jogo.visitante['_id']).then(function(){
        $scope.jogo.situacao = 'jogoConfirmado';
      });
    }

    $scope.rejeitarJogo = function(){
      DataService.rejeitarJogo($scope.jogo._id, $scope.jogo.visitante['_id']).then(function(){
        $scope.jogo.situacao = 'jogoRejeitado';
        $state.go('abasInicio.meuTime');
      });
    }


    $scope.confirmarPlacar = function(){
      DataService.confirmarPlacar($scope.jogo._id, $scope.jogo.visitante['_id']).then(function(){
        $scope.jogo.situacao = 'placarConfirmado';
        $scope.informarSumula();
      });
    }


    $scope.rejeitarPlacar = function(){
      DataService.rejeitarPlacar($scope.jogo._id, $scope.jogo.visitante['_id']).then(function(){
        $scope.jogo.situacao = 'placarRejeitado';
        $state.go('abasInicio.meuTime');
      });
    }
    

    $scope.removerJogo = function(){
        var confirmPopup = $ionicPopup.confirm({
          title: 'Confirmar exclusão',
          content: 'Deseja realmente remover este jogo?'
        });
       confirmPopup.then(function(res) {
         if(res) {
           DataService.removerJogo($scope.jogo._id).then(function(){
              if($ionicHistory.backView()){
                $ionicHistory.goBack();
              } else {
                $state.go('abasInicio.meuTime');
              }
           }, function(err){
              $ionicPopup.alert({
                title: 'Erro',
                content: err.data.erro
              });
           });
         }
       });
    }
      
    $scope.$on('$ionicView.enter', function(){
      DataService.jogo($stateParams.id).then(function(jogo){
        $scope.jogo = jogo;
        $scope.jogo.jogadores.mandante = _.orderBy($scope.jogo.jogadores.mandante, ['gols', 'assistencias', 'cartoes.vermelho', 'cartoes.amarelo', 'cartoes.azul', 'jogador.nome'], ['desc', 'desc', 'asc', 'asc', 'asc', 'asc']);
        $scope.jogo.jogadores.visitante = _.orderBy($scope.jogo.jogadores.visitante, ['gols', 'assistencias', 'cartoes.vermelho', 'cartoes.amarelo', 'cartoes.azul', 'jogador.nome'], ['desc', 'desc', 'asc', 'asc', 'asc', 'asc']);

      });
    });

    $scope.deveExibirMenu = function(){
      return $scope.editavel('mandante') || ( $scope.editavel('visitante') &&  ($scope.jogo.situacao == 'placarConfirmado' ||  $scope.jogo.situacao == 'jogoConfirmado'));
    }

    $scope.exibirMenu = function(){
        var buttons = [];
        
      //Se o time do usuário logado já informou os gols
      if($scope.timeDoUsuario() && $scope.informouGols($scope.timeDoUsuario())){
        buttons.push({ text: 'Editar Súmula (Gols)' });
      } else if($scope.timeDoUsuario() && $scope.naoInformouGols($scope.timeDoUsuario())){
        buttons.push({ text: 'Cadastrar Súmula (Gols)' });
      }

      var params = {
         buttons: buttons,
         cancelText: 'Cancelar',
         destructiveButtonClicked: function(){
            $scope.removerJogo();
            return true;
         },
         buttonClicked: function(index) {
            switch(index){
              case 0: 
                $scope.informarSumula();
                break;
              // case 1:
              //   $scope.adicionarJogadores();
              //   break;
            }
           return true;
         }
       }

       if($scope.timeDoUsuario()){
        params.destructiveText ='Remover Jogo';
       }

       $ionicActionSheet.show(params);
    }

}]);
