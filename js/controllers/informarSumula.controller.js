angular
  .module('app.controllers')
  .controller('informarSumulaController', ['$scope', '$stateParams', 'DataService', 'AuthService', '$ionicPopup', function ($scope, $stateParams, DataService, AuthService, $ionicPopup) {
    var time = $stateParams.time || 'mandante';
    $scope.time = time;
    $scope.jogo = $stateParams.jogo;
    $scope.jogadores = [];
    $scope.idJogadorAberto = null;
    $scope.golsTime;

    if(!$scope.jogo){
      DataService.jogo($stateParams.id).then(function(jogo){
        $scope.jogo = jogo;
        inicializar();
      });
    } else {
      inicializar();
    }

    $scope.$on('jogadorAdicionado', function(events, jogador){
      var novoJogador = {jogador: jogador, gols: 0, golsSofridos: 0, assistencias: 0, elenco: true};
      $scope.jogadores.push(novoJogador);
      $scope.checkJogador(novoJogador);
    });

    function timeOposto(time){
      if (time == 'visitante') {
        return 'mandante';
      } else {
        return 'visitante';
      }
    }
    
    function inicializar(){
      var jogadoresGolsSalvos = $scope.jogo.jogadores ? $scope.jogo.jogadores[time] : [];
      $scope.golsTime = $scope.jogo.placar[time];
      var golsOutroTime = $scope.jogo.placar[timeOposto(time)];

      $scope.golsRestantes = $scope.golsTime;
      $scope.golsSofridosRestantes = golsOutroTime;
      $scope.assistenciasRestantes = $scope.golsTime;

      for (var i = jogadoresGolsSalvos.length - 1; i >= 0; i--) {
        $scope.golsRestantes -= jogadoresGolsSalvos[i].gols;

        jogadoresGolsSalvos[i].assistencias = jogadoresGolsSalvos[i].assistencias || 0;
        $scope.assistenciasRestantes -= jogadoresGolsSalvos[i].assistencias;

        jogadoresGolsSalvos[i].golsSofridos = jogadoresGolsSalvos[i].golsSofridos || 0;
        $scope.golsSofridosRestantes -= jogadoresGolsSalvos[i].golsSofridos;
      }

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
            jogadores.push({jogador: jogador, gols: 0, golsSofridos: 0, assistencias: 0});
          }
        }
        jogadores = _.orderBy(jogadores, ['elenco', 'gols', 'golsSofridos', 'assistencias', 'cartoes.vermelho', 'cartoes.amarelo', 'cartoes.azul', 'jogador.nome'], ['asc', 'desc', 'desc', 'asc', 'asc', 'asc', 'asc']);
        // jogadores.sort(function(a, b){
        //     return a.jogador.nome.localeCompare(b.jogador.nome);
        // });

        $scope.jogadores = jogadores;
      });
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
      $scope.golsRestantes += jogador.gols;
      $scope.assistenciasRestantes += jogador.assistencias;
      $scope.golsSofridosRestantes += jogador.golsSofridos;
      jogador.gols = 0;
      jogador.assistencias = 0;
      jogador.golsSofridos = 0;
    }

    $scope.expandirJogador= function(jogador){
      jogador.elenco = true;      
      if($scope.idJogadorAberto && $scope.idJogadorAberto == jogador.jogador.id){
        $scope.idJogadorAberto = null;
      } else {
        $scope.idJogadorAberto = jogador.jogador.id;  
      }
    };

    $scope.incrementGol = function(jogador) {
      jogador.gols++;
      $scope.golsRestantes--;
    };

    $scope.decrementGol = function(jogador) {
      if (jogador.gols > 0){
        jogador.gols--;
        $scope.golsRestantes++;
      }
    };

    $scope.incrementGolSofrido = function(jogador) {
      jogador.golsSofridos++;
      $scope.golsSofridosRestantes--;
    };

    $scope.decrementGolSofrido = function(jogador) {
      if (jogador.golsSofridos > 0){
        jogador.golsSofridos--;
        $scope.golsSofridosRestantes++;
      }
    };

    $scope.incrementAssistencia = function(jogador) {
      jogador.assistencias++;
      $scope.assistenciasRestantes--;
    };

    $scope.decrementAssistencia = function(jogador) {
      if (jogador.assistencias > 0){
        jogador.assistencias--;
        $scope.assistenciasRestantes++;
      }
    };

    $scope.toggleCartao = function(jogador, cartao) {
      var valorAnterior = _.get(jogador, ['cartoes', cartao], 0);
      _.set(jogador, ['cartoes', cartao], !valorAnterior);
    };

    function getJogadoresElenco(){
      var jogadoresGols = [];
      $scope.jogo.jogadores = $scope.jogo.jogadores || {};
      $scope.jogo.jogadores[time] = [];
      for (var i = $scope.jogadores.length - 1; i >= 0; i--) {
        var jogadorGol = $scope.jogadores[i]
        if(jogadorGol.elenco){
          $scope.jogo.jogadores[time].push(jogadorGol);
          jogadoresGols.push({
            jogador: jogadorGol.jogador._id,
            gols: jogadorGol.gols,
            golsSofridos: jogadorGol.golsSofridos,
            assistencias: jogadorGol.assistencias,
            cartoes: jogadorGol.cartoes
          });
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
      return ($scope.golsRestantes >= 0) && ($scope.assistenciasRestantes >= 0) && ($scope.golsSofridosRestantes >= 0);
    }

    function mensagemSumulaIncompativelComPlacar(){
      var golsTime = $scope.jogo.placar[time];
      var golsOutroTime = $scope.jogo.placar[timeOposto(time)];

      if ($scope.golsRestantes < 0) {
        return 'Foram informados ' + (golsTime - $scope.golsRestantes) + 'gols, mas o placar do jogo foi ' + $scope.jogo.placar.mandante + ' x ' + $scope.jogo.placar.visitante;
      } else if($scope.assistenciasRestantes < 0) {
        return 'Foram informados ' + (golsTime - $scope.assistenciasRestantes) + 'assistências, mas o placar do jogo foi ' + $scope.jogo.placar.mandante + ' x ' + $scope.jogo.placar.visitante;
      } else if($scope.golsSofridosRestantes < 0) {
        return 'Foram informados ' + (golsOutroTime - $scope.golsSofridosRestantes) + 'gols sofridos pelos goleiros, mas o placar do jogo foi ' + $scope.jogo.placar.mandante + ' x ' + $scope.jogo.placar.visitante;
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
