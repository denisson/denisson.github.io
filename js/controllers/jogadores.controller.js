angular
  .module('app.controllers')
  .controller('jogadoresController', ['$scope', '$state', '$stateParams', 'DataService', 'CameraService', '$ionicModal', 'AuthService', '$ionicActionSheet', '$ionicPopup', '$jgModalAssinatura',  
  function ($scope, $state, $stateParams, DataService, CameraService, $ionicModal, AuthService, $ionicActionSheet, $ionicPopup, $jgModalAssinatura) {
    inicializarJogador();

    $scope.posicoes = [];

    $ionicModal.fromTemplateUrl('templates/jogadores/formJogador.html',{
      scope: $scope
    }).then(function(modal){
        $scope.modalFormJogador = modal;
        if($stateParams.abrirModal){
          modal.show();
        }
      }
    );

    $scope.$on('adicionarJogador', function(event, timeId){
      $scope.adicionarJogador(timeId);
    });

    $scope.jogadorModal = {};
    $ionicModal.fromTemplateUrl('templates/jogadores/verJogador.html', {
      scope: $scope,
      animation: 'fade-in'
    }).then(function(modal){
      $scope.modalJogador = modal;
    });

    
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


    $scope.verJogador = function(jogador, temporada){
      $scope.jogadorModal = jogador;
      temporada = temporada || moment().year();
      $scope.temporadaModal = temporada;
      $scope.modalJogador.show();
      moment.locale('pt-BR');


      if(temporada != "todas"){
        var numerosTemporada = _.find(jogador.temporadas, {ano: _.parseInt(temporada)});
      } else {
        var numerosTemporada = jogador.numeros;
      }
      $scope.jogadorModal.numerosTemporada = numerosTemporada;

      DataService.jogadorEstatisticas(jogador._id, jogador.time, temporada).then(function(estatisticas){
        $scope.jogadorModal.pro = estatisticas.pro;
        $scope.jogadorModal.estatisticas = estatisticas;
        $scope.jogadorModal.jogosPorMes = estatisticas.jogosPorMes;
      });
    }

    $scope.verJogadorPorId = function(jogadorId, temporada){
      DataService.jogador(jogadorId).then(function(jogador){
        $scope.verJogador(jogador, temporada);
      });
    }

    $scope.verJogo = function(jogo){
      $scope.modalJogador.hide();
      $state.go('jogo', {id: jogo._id});
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
              $scope.atualizar();
              $scope.modalJogador.hide();
            });
            return true;
         },
         buttonClicked: function(index) {
            switch(index){
              case 0: 
                $scope.editarJogador(jogador);
                break;
            }
           return true;
         }
       });
    }

    $scope.capturarFoto = function(){
      CameraService.getPicture().then(function(imagePath){
        $scope.jogador.foto = imagePath;
        $scope.jogador.fotoAlterada = true;
        $scope.$apply();
      });
    };

    function jogadorValido(){
      var camisaValida = /^\d+$/.test($scope.jogador.camisa);
      if($scope.jogador.camisa && !camisaValida){
        $ionicPopup.alert({
          title: 'Número da camisa inválido',
          content: 'O número da camisa não pode conter letras ou outros caracteres'
        });
        return false;
      }

      return true;
    }

    $scope.salvarJogador = function(){
      if(!jogadorValido()){
        return;
      }
      var jogadorSalvar = angular.copy($scope.jogador);
      if(!$scope.jogador.fotoAlterada) {
        jogadorSalvar.foto = '';
      }
      DataService.salvarJogador(jogadorSalvar).then(function(registroSalvo){
        if(!jogadorSalvar._id) { // Caso não esteja editando, mas incluindo novo jogador
            $scope.$emit('jogadorAdicionado', {_id: registroSalvo.id, time: $scope.jogador.time, foto: $scope.jogador.foto, nome: $scope.jogador.nome, posicao: $scope.jogador.posicao, ehGoleiro: registroSalvo.ehGoleiro})
        }
        inicializarJogador();
        $scope.modalFormJogador.hide();
      });
    }

    $scope.adicionarJogador = function(timeId, opcaoConvidado){
        inicializarJogador();
        $scope.carregarPosicoes();
        $scope.jogador.time = timeId;
        if(opcaoConvidado){
          $scope.opcaoConvidado = true;
          $scope.jogador.convidado = false;
        }
        $scope.modalFormJogador.show();
    }

    $scope.carregarPosicoes = function(){
      if(!$scope.posicoes.length){
        DataService.jogadorPosicoes().then(function(posicoes){
          $scope.posicoes = posicoes;
        });        
      }
    }

    $scope.editarJogador = function(jogador){
      $scope.carregarPosicoes();
      $scope.jogador = jogador;
      $scope.modalFormJogador.show();
      $scope.modalJogador.hide();
    }

    function inicializarJogador(){
      $scope.jogador = {};
      $scope.jogador.foto = '';
      $scope.jogador.nome = '';
      $scope.jogador.posicao = '';
      $scope.jogador.fotoAlterada = false;
    }

    $scope.timeUsuarioPro = function(){
      return $scope.jogadorModal.pro && ($scope.editavel() || AuthService.isUsuarioPro());
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

}])
