angular
  .module('app.controllers')
  .controller('verJogoController', ['$scope', '$state', '$stateParams', 'DataService', 'AuthService', '$ionicPopup', '$ionicActionSheet', '$ionicHistory', function ($scope, $state, $stateParams, DataService, AuthService, $ionicPopup, $ionicActionSheet, $ionicHistory) {

    $scope.voltar = function(){
      if($ionicHistory.backView()){
        $ionicHistory.goBack();
      } else {
        $state.go('abasInicio.meuPerfil');
      }
    }

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
        && _.get($scope.jogo[time], ['_id']) === AuthService.getTime();
    }

    $scope.editavelLiga = function(){
      return $scope.jogo 
        && AuthService.getLiga() 
        && $scope.jogo.temSolicitacaoArbitragem
        && _.get($scope.jogo, 'arbitragem.solicitacao.liga._id') === AuthService.getLiga();
    }    

    $scope.permissaoArbitragem = function(){
      return $scope.jogo && 
        (AuthService.getArbitro() && _.get($scope.jogo, 'arbitragem.arbitro._id') === AuthService.getArbitro())
        ||
        (AuthService.getLiga() && _.get($scope.jogo, 'arbitragem.solicitacao.liga.id') === AuthService.getLiga());
    }

    $scope.temArbitragem = function(){
      return $scope.jogo.temSolicitacaoArbitragem;
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
      $state.go('informarSumula', {id:$scope.jogo._id, time: $scope.timeDoUsuario()});
    }

    $scope.podeInformarPlacar = function(){
      return $scope.jogo.aguardandoPlacar && 
              ((!$scope.temArbitragem() && $scope.editavel('mandante'))
              ||
              ($scope.temArbitragem() && $scope.permissaoArbitragem()));
    }

    $scope.podeCorrigirPlacar = function(){
      return $scope.jogo.encerrado && 
              ((!$scope.temArbitragem() && $scope.editavel('mandante'))
              ||
              ($scope.temArbitragem() && $scope.permissaoArbitragem()));
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
            if($scope.editavelLiga()){
              if($ionicHistory.backView()){
                $ionicHistory.goBack();
              } else {
                $state.go('liga');
              }
            } else {
              $state.go('time');
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
        if(!jogo){
            mostrarAlerta('Esse jogo não foi encontrado');
            return;
        }
        $scope.jogo = jogo;
        $scope.jogo.jogadores.mandante = _.orderBy($scope.jogo.jogadores.mandante, ['gols', 'assistencias', 'cartoes.vermelho', 'cartoes.amarelo', 'cartoes.azul', 'jogador.nome'], ['desc', 'desc', 'asc', 'asc', 'asc', 'asc']);
        $scope.jogo.jogadores.visitante = _.orderBy($scope.jogo.jogadores.visitante, ['gols', 'assistencias', 'cartoes.vermelho', 'cartoes.amarelo', 'cartoes.azul', 'jogador.nome'], ['desc', 'desc', 'asc', 'asc', 'asc', 'asc']);

      });
    });

    $scope.deveExibirMenu = function(){
      return  $scope.editavelLiga() || 
              $scope.podeImportarJogoParaRanking() || 
              $scope.editavel('mandante') ||
              ( 
                $scope.editavel('visitante') &&
                (
                  $scope.jogo.situacao == 'placarConfirmado' ||
                  $scope.jogo.situacao == 'jogoConfirmado')
              );
    }

    $scope.exibirMenu = function(){
      var i=0;
      var buttons = [];
      var indicesBotoes = {};
        
      //Se o time do usuário logado já informou os gols
      if($scope.timeDoUsuario() && $scope.informouGols($scope.timeDoUsuario())){
        indicesBotoes['sumula'] = i;
        buttons[i++] = { text: 'Editar Súmula (Gols)' };
      } else if($scope.timeDoUsuario() && $scope.naoInformouGols($scope.timeDoUsuario())){
        indicesBotoes['sumula'] = i;
        buttons[i++] = { text: 'Cadastrar Súmula (Gols)' };
      }

      if($scope.podeSolicitarArbitragem()){
        indicesBotoes['arbitragem'] = i;
        buttons[i++] = { text: 'Solicitar Arbitragem' };
      }

      if($scope.podeImportarJogoParaRanking()){
        indicesBotoes['importar'] = i;
        buttons[i++] = { text: 'Importar para ranking' };
      }

      if($scope.podeCorrigirPlacar()){
        indicesBotoes['placar'] = i;
        buttons[i++] = { text: 'Corrigir Placar' };
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
              case indicesBotoes['sumula']: 
                $scope.informarSumula();
                break;
              case indicesBotoes['arbitragem']:
                $scope.solicitarArbitragem();
                break;
              case indicesBotoes['importar']:
                $scope.importarJogoParaRanking();
                break;
              case indicesBotoes['placar']:
                $scope.informarPlacar();
                break;
            }
           return true;
         }
       }

       if($scope.timeDoUsuario() || $scope.editavelLiga()){
        params.destructiveText ='Remover Jogo';
       }

       $ionicActionSheet.show(params);
    }

    $scope.podeSolicitarArbitragem = function(){
      var agora = moment.tz(_.get($scope.jogo, 'local.cidade.timezone'));
      return $scope.deveExibirMenu() && !$scope.jogo.temSolicitacaoArbitragem && existeLigaDisponivel() && agora.isBefore($scope.jogo.dataHora);
    }

    $scope.solicitarArbitragem = function(){
      $state.go('solicitarArbitragem', {id: $scope.jogo._id, jogo: $scope.jogo});
    }

    $scope.podeImportarJogoParaRanking = function (){
      return AuthService.getLiga() && $scope.jogo && !$scope.jogo.temSolicitacaoArbitragem;
    }

    $scope.importarJogoParaRanking = function(){
      DataService.importarJogoParaLiga($scope.jogo._id).then(function(jogoImportado){
        $state.reload();
      });
    }

    function existeLigaDisponivel(){
      return $scope.jogo.temLigasDisponiveis;
    }

    function mostrarAlerta(mensagem){
      $ionicPopup.alert({
        title: 'Ops!',
        content: mensagem
      }).then(function(){
        $ionicHistory.goBack();
      });
    }

    $scope.temporadaJogo = function(jogo){
      return moment(jogo.dataHora).year();
    }

}]);
