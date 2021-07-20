angular
  .module('app.controllers')
  .controller('informarSumulaController', ['$scope', '$stateParams', 'DataService', 'AuthService', '$ionicPopup', 'SumulaService', '$ionicModal', function ($scope, $stateParams, DataService, AuthService, $ionicPopup, SumulaService, $ionicModal) {
    var time = $stateParams.time || 'mandante';
    $scope.time = time;
    $scope.jogo = $stateParams.jogo;
    $scope.jogadores = [];
    $scope.idJogadorAberto = null;
    $scope.golsTime;

    var scoutsJogador = ['gols', 'golsSofridos', 'assistencias', 'defesasDificeis' , 'desarmes'];

    if(!$scope.jogo){
      DataService.jogo($stateParams.id).then(function(jogo){
        // jogo.houveDisputaPenaltis = true;
        $scope.jogo = jogo;
        inicializar();
      });
    } else {
      inicializar();
    }

    $ionicModal.fromTemplateUrl('templates/jogadores/modalAdicionarJogador.html', {
      scope: $scope,
      animation: 'fade-in'
    }).then(function(modal){
      $scope.modalAdicionarJogador = modal;
    });

    $scope.atualizarRestante = function(campo, valor) {
      $scope.restantes[campo] += valor || 0;
    }


    $scope.adicionarJogador = function(timeId){
      $scope.timeIdModalJogador = timeId;
      $scope.modalAdicionarJogador.show();
    }

    $scope.aposAdicionarJogador = function(jogador){
      $scope.modalAdicionarJogador.hide();
      var novoJogador = {jogador: jogador, elenco: true};
      zerarScouts(novoJogador);
      $scope.jogadores.push(novoJogador);
      $scope.checkJogador(novoJogador);
    }

    function timeOposto(time){
      if (time == 'visitante') {
        return 'mandante';
      } else {
        return 'visitante';
      }
    }

    function zerarScouts(jogador){
      scoutsJogador.forEach(function(scout){
        jogador[scout] = 0;
      })
      return jogador;
    }
    
    function inicializar(){
      var jogadoresGolsSalvos = $scope.jogo.jogadores ? $scope.jogo.jogadores[time] : [];
      $scope.golsTime = $scope.jogo.placar[time];
      var golsOutroTime = $scope.jogo.placar[timeOposto(time)];

      inicializarRestantes(jogadoresGolsSalvos, $scope.golsTime, golsOutroTime);

      var jogadores = jogadoresGolsSalvos.slice(0);

      jogadores.forEach(function(el){el.elenco = true;});
      
      DataService.blockPopup();
      DataService.timeJogadores($scope.jogo[time]._id).then(function(jogadoresTime){
        // $scope.jogo[time] = time;
        for (var i = jogadoresTime.length - 1; i >= 0; i--) {
          var jogador = jogadoresTime[i];
          var encontrado = _.find(jogadoresGolsSalvos, function(jogadorGol){
            return jogadorGol.jogador.id === jogador.id;
          });
          if(!encontrado){
            jogadores.push(zerarScouts({jogador: jogador}));
          }
        }

        jogadores = SumulaService.ordenarJogadores(jogadores);
        // jogadores.sort(function(a, b){
        //     return a.jogador.nome.localeCompare(b.jogador.nome);
        // });

        $scope.jogadores = jogadores;
      });
    }

    function inicializarRestantes(jogadoresGolsSalvos, golsTime, golsOutroTime){
      $scope.restantes = {
        gols: golsTime,
        assistencias: golsTime,
        golsSofridos: golsOutroTime
      }

      //Pega os jogadores já salvos e computa para saber os restantes
      for (var i = jogadoresGolsSalvos.length - 1; i >= 0; i--) {
        Object.keys($scope.restantes).forEach(function (key) {
          var val = jogadoresGolsSalvos[i][key] || 0;
          $scope.atualizarRestante(key, val * -1);
       });
      }
    }

    $scope.checkJogador = function(jogador){
      if(jogador.elenco){
        $scope.idJogadorAberto = jogador.jogador.id;  
      } else {
        $scope.idJogadorAberto = null;  
        zerarDadosJogador(jogador);
      }
    };

    function zerarDadosJogador(jogador){
      Object.keys($scope.restantes).forEach(function(key){
        $scope.atualizarRestante(key, jogador[key]);
        jogador[key] = 0  
      });
    }

    $scope.expandirJogador= function(jogador){
      jogador.elenco = true;      
      if($scope.idJogadorAberto && $scope.idJogadorAberto == jogador.jogador.id){
        $scope.idJogadorAberto = null;
      } else {
        $scope.idJogadorAberto = jogador.jogador.id;  
      }
    };

    $scope.toggleCartao = function(jogador, cartao) {
      var valorAnterior = _.get(jogador, ['cartoes', cartao], 0);
      _.set(jogador, ['cartoes', cartao], !valorAnterior);
    };

    $scope.toggleDestaque = function(jogador) {
      if ( jogador.destaque ) { // já era destaque, então está retirando a estrela
        jogador.destaque = false;
      } else { //não era o destaque, então desativa os outros e seta o destaque para ele
        $scope.jogadores.forEach(function(jog){jog.destaque = false;});
        jogador.destaque = true;
      }
    };

    function getJogadoresElenco(){
      var jogadoresGols = [];
      $scope.jogo.jogadores = $scope.jogo.jogadores || {};
      // $scope.jogo.jogadores[time] = [];
      for (var i = $scope.jogadores.length - 1; i >= 0; i--) {
        var jogadorGol = $scope.jogadores[i]
        if(jogadorGol.elenco){
          // $scope.jogo.jogadores[time].push(jogadorGol);
          var jog = _.clone(jogadorGol);
          jog.jogador = jogadorGol.jogador._id;
          jogadoresGols.push(jog);
        }
      }
      return jogadoresGols;
    }

    $scope.salvarGols = function(){
      if(sumulaCompativelComPlacar()){
        DataService.salvarSumula($scope.jogo._id, getJogadoresElenco(), time).then(function(retorno){          
          if(AuthService.isUsuarioPro()){
            AuthService.redirectClean('abasInicio.jogo-aba-time', null, {id: $scope.jogo._id});
          } else {
            AuthService.redirectClean('interstitial', null, {rota: 'abasInicio.jogo-aba-time', parametros: {id: $scope.jogo._id}});
          }
        });
      } else {
        $ionicPopup.alert({
          title: 'Corrigir antes de salvar',
          content: mensagemSumulaIncompativelComPlacar()
        });
      }
    };

    function sumulaCompativelComPlacar(){
      return ($scope.restantes.gols >= 0) && ($scope.restantes.assistencias >= 0) && ($scope.restantes.golsSofridos >= 0);
    }

    function mensagemSumulaIncompativelComPlacar(){
      var golsTime = $scope.jogo.placar[time];
      var golsOutroTime = $scope.jogo.placar[timeOposto(time)];
      var placar = $scope.jogo.mandanteNaEsquerda
        ? $scope.jogo.placar.mandante + ' x ' + $scope.jogo.placar.visitante
        : $scope.jogo.placar.visitante + ' x ' + $scope.jogo.placar.mandante;

      if ($scope.restantes.gols < 0) {
        return 'Foram informados ' + (golsTime - $scope.restantes.gols) + 'gols, mas o placar do jogo foi ' + placar;
      } else if($scope.restantes.assistencias < 0) {
        return 'Foram informados ' + (golsTime - $scope.restantes.assistencias) + 'assistências, mas o placar do jogo foi ' + placar;
      } else if($scope.restantes.golsSofridos < 0) {
        return 'Foram informados ' + (golsOutroTime - $scope.restantes.golsSofridos) + 'gols sofridos pelos goleiros, mas o placar do jogo foi ' + placar;
      }
    }
    
    $scope.informarDepois = function(){
      if(AuthService.isUsuarioPro()){
        AuthService.redirectClean('abasInicio.meuTime', null, {});
      } else {
        AuthService.redirectClean('interstitial', null, {rota: 'abasInicio.meuTime'});
      }
    }

  }])
