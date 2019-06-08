angular
  .module('app.controllers')
  .controller('jogadoresController', ['$scope', '$state', '$stateParams', 'DataService', '$cordovaCamera', '$ionicModal', 'AuthService', '$ionicActionSheet', '$ionicPopup', function ($scope, $state, $stateParams, DataService, $cordovaCamera, $ionicModal, AuthService, $ionicActionSheet, $ionicPopup) {
    inicializarJogador();

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


      DataService.timeJogos(jogador.time, temporada).then(function(time){
        let jogos = time.jogos.encerrados;
        if(jogos) {
          let jogosPorMes = {};
          let ultimoMes = ( temporada == moment().year() ) ? ( moment().month() ) : 11; 
          for (var i = 11; i >= 0; i--) {
            jogosPorMes[i] = {jogos: [], mes: moment().month(i).format('MMM'), mesFuturo: (i > ultimoMes)};
          }
          
          for (var i = jogos.length - 1; i >= 0; i--) {
            let jogo = jogos[i];
            let numerosJogador = _.find(jogo.jogadores.mandante, {jogador: jogador._id}) || _.find(jogo.jogadores.visitante, {jogador: jogador._id});
            let mes = moment(jogo.dataHora).month();

            jogosPorMes[mes].jogos.push({
              jogo: jogo,
              numeros: numerosJogador
            });
            
          }

          $scope.jogadorModal.jogosPorMes = jogosPorMes;
        }

      });
    }

    $scope.verJogo = function(jogo){
      $scope.modalJogador.hide();
      $state.go('abasInicio.jogo-'+Object.keys($state.current.views)[0], {id: jogo._id});
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
      var options = {
        quality: 100,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
        allowEdit: true,
        encodingType: Camera.EncodingType.JPEG,
        mediaType: Camera.MediaType.PICTURE,
        targetWidth: 400,
        targetHeight: 400,
        correctOrientation:true
      };

      $cordovaCamera.getPicture(options).then(function(imagePath) {
        $scope.jogador.foto = imagePath;
        $scope.jogador.fotoAlterada = true;
      }, function(err) {
        console.log(err)
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
            $scope.$emit('jogadorAdicionado', {_id: registroSalvo.id, time: $scope.jogador.time, foto: $scope.jogador.foto, nome: $scope.jogador.nome, posicao: $scope.jogador.posicao})
        }
        inicializarJogador();
        $scope.modalFormJogador.hide();
      });
    }

    $scope.adicionarJogador = function(timeId, opcaoConvidado){
        inicializarJogador();
        $scope.jogador.time = timeId;
        if(opcaoConvidado){
          $scope.opcaoConvidado = true;
          $scope.jogador.convidado = true;
        }
        $scope.modalFormJogador.show();
    }

    $scope.editarJogador = function(jogador){
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
}])
