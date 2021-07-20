angular
  .module('app.controllers')
  .controller('jogadorController', ['$rootScope', '$scope', '$state', '$stateParams', 'DataService', '$ionicModal', 'AuthService', '$ionicActionSheet', '$jgModalAssinatura', '$ionicHistory', 
  function ($rootScope, $scope, $state, $stateParams, DataService, $ionicModal, AuthService, $ionicActionSheet, $jgModalAssinatura, $ionicHistory
) {
      
    $scope.verJogador = function(jogador, temporada, mes){
        $scope.jogadorModal = jogador;
        temporada = temporada || moment().year();
        $scope.temporadaModal = temporada;
        $scope.mesModal = mes;
        moment.locale('pt-BR');
  
  
        if(temporada != "todas"){
          var numerosTemporada = _.find(jogador.temporadas, {ano: _.parseInt(temporada)});
        } else {
          var numerosTemporada = jogador.numeros;
        }
        $scope.jogadorModal.numerosTemporada = numerosTemporada;
  
        DataService.jogadorEstatisticas(jogador._id, jogador.time, temporada, mes).then(function(estatisticas){
          $scope.jogadorModal.pro = estatisticas.pro;
          $scope.jogadorModal.estatisticas = estatisticas;
          $scope.jogadorModal.jogosPorMes = estatisticas.jogosPorMes;
        });
    }

    $scope.alterarPeriodo = function (temporada, mes){
      $scope.verJogador($scope.jogadorModal, temporada || 'todas', mes)
    }
  
    $scope.verJogadorPorId = function(jogadorId, temporada){
        DataService.jogador(jogadorId).then(function(jogador){
            $scope.verJogador(jogador, temporada);
        });
    }

    if($stateParams.jogador) {
        $scope.verJogador($stateParams.jogador, $stateParams.temporada);
    } else {
        $scope.verJogadorPorId($stateParams.id, $stateParams.temporada);
    }

    $scope.editavel = function(){
        return $scope.jogadorModal && $scope.jogadorModal.time && AuthService.getTime() && $scope.jogadorModal.time === AuthService.getTime();
      }
  
    $scope.verJogo = function(jogo){
        $state.go('jogo', {id: jogo._id});
    }

    // $ionicModal.fromTemplateUrl('templates/jogadores/formJogador.html',{
    //   scope: $scope
    // }).then(function(modal){
    //     $scope.modalFormJogador = modal;
    //     if($stateParams.abrirModal){
    //       modal.show();
    //     }
    //   }
    // );
    
    $ionicModal.fromTemplateUrl('templates/jogadores/verMesJogador.html', {
      scope: $scope,
      animation: 'fade-in'
    }).then(function(modal){
      $scope.modalMesJogador = modal;
    });

    $scope.formatarData = function(jogo){
      var timezone = _.get(jogo, 'local.cidade.timezone', 'America/Fortaleza'); //caso não tenha no cadastro do jogo, utilizar o timezone compatível com Maceió
       return moment(jogo.dataHora).tz(timezone).format('DD/MM/YYYY');
    }

    $scope.formatarHora = function(jogo){
      var timezone = _.get(jogo, 'local.cidade.timezone', 'America/Fortaleza'); //caso não tenha no cadastro do jogo, utilizar o timezone compatível com Maceió
      return moment(jogo.dataHora).tz(timezone).format('HH:mm');
    }     

    $scope.verDetalhesJogo = function(jogo, mes, jogos){
      $scope.mesClicadoMapa = mes;
      $scope.jogoClicadoMapa = jogo;
      $scope.jogosMesClicadoMapa = jogos;
      $scope.modalMesJogador.show();
    }

    $scope.mesExtenso = function(mes){
      return moment(mes, 'MMM').format('MMMM');
    }

    $scope.verDetalhesMes = function(mes, jogos){
      $scope.jogoClicadoMapa = jogos[0] || null;
      $scope.mesClicadoMapa = mes;
      $scope.jogosMesClicadoMapa = jogos;
      $scope.modalMesJogador.show();
    }

    $scope.formatarDataMapa= function(dataHora){
      return moment(dataHora).format('DD');
    }

    $scope.formatarDiaSemana= function(dataHora){
      return moment(dataHora).format('ddd');
    }

    // $scope.clicarJogador = function(jogador){
    //     $scope.verJogador(jogador);
    // }

    $scope.exibirMenuJogador = function(jogador){
       $ionicActionSheet.show({
         buttons: [
           { text: 'Editar ' + jogador.nome }
         ],
         destructiveText: 'Remover ' + jogador.nome,
         cancelText: 'Cancelar',
         destructiveButtonClicked: function(){
            DataService.removerJogador(jogador._id, jogador.time).then(function(){
                $rootScope.$emit('jogadorAdicionado', jogador._id);
                $state.go('time');
            });
            return true;
         },
         buttonClicked: function(index) {
            switch(index){
              case 0: 
                $state.go('jogador_editar', {timeId: jogador.time, id: jogador._id, jogador: jogador});
                break;
            }
           return true;
         }
       });
    }

    $scope.timeUsuarioPro = function(){
      return $scope.jogadorModal && $scope.jogadorModal.pro && ($scope.editavel() || AuthService.isUsuarioPro());
    }

    $scope.isAuthenticated = function(){
      return AuthService.isAuthenticated();
    }

    $scope.assinarJogueirosPro = function(){
      $jgModalAssinatura.confirmarAssinaturaTime('graficos', $scope.jogadorModal.time, $scope.jogadorModal.pro);
    }

    $scope.numerosGraficoDesempenhoJogador = function(){
      var numeros = $scope.jogadorModal.estatisticas.jogador;
      if (numeros.vitorias + numeros.empates + numeros.derrotas) {
        return numeros;
      } else {
        return {
          vitorias: 10,
          empates: 2,
          derrotas: 4
        }
      }
    }

    $scope.reativarJogador = function(){
      DataService.reativarJogador($scope.jogadorModal._id, $scope.jogadorModal.time).then(function(){
        $scope.jogadorModal.saiuDoTime = false;
        $scope.jogadorModal.saiuDoTimeEm = null;
      })
    }

}])
