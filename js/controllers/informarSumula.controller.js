angular
  .module('app.controllers')
  .controller('informarSumulaController', ['$scope', '$stateParams', '$state', 'DataService', function ($scope, $stateParams, $state, DataService) {
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
      var novoJogador = {jogador: jogador, gols: 0, assistencias: 0, elenco: true};
      $scope.jogadores.push(novoJogador);
      $scope.checkJogador(novoJogador);
    });
    
    function inicializar(){
      var jogadoresGolsSalvos = $scope.jogo.jogadores ? $scope.jogo.jogadores[time] : [];
      $scope.golsTime = $scope.jogo.placar[time];

      $scope.golsRestantes = $scope.golsTime;
      $scope.assistenciasRestantes = $scope.golsTime

      for (var i = jogadoresGolsSalvos.length - 1; i >= 0; i--) {
        jogadoresGolsSalvos[i].assistencias = jogadoresGolsSalvos[i].assistencias || 0;
        $scope.golsRestantes -= jogadoresGolsSalvos[i].gols;
        $scope.assistenciasRestantes -= jogadoresGolsSalvos[i].assistencias;
      }

      var jogadores = jogadoresGolsSalvos.slice(0);

      jogadores.forEach(function(el){el.elenco = true;});
      
      DataService.blockPopup();
      DataService.timeJogadores($scope.jogo[time]._id).then(function(time){
        // $scope.jogo[time] = time;
        for (var i = time.jogadores.length - 1; i >= 0; i--) {
          var jogador = time.jogadores[i];
          var encontrado = _.find(jogadoresGolsSalvos, function(jogadorGol){
            return jogadorGol.jogador.id === jogador.id;
          });
          if(!encontrado){
            jogadores.push({jogador: jogador, gols: 0, assistencias: 0});
          }
        }
        jogadores = _.orderBy(jogadores, ['elenco', 'gols', 'assistencias', 'cartoes.vermelho', 'cartoes.amarelo', 'cartoes.azul', 'jogador.nome'], ['asc', 'desc', 'desc', 'asc', 'asc', 'asc', 'asc']);
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
      }
    };

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
      let valorAnterior = _.get(jogador, ['cartoes', cartao], 0);
      _.set(jogador, ['cartoes', cartao], !valorAnterior)
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
            assistencias: jogadorGol.assistencias,
            cartoes: jogadorGol.cartoes
          });
        }
      }
      return jogadoresGols;
    }

    $scope.salvarGols = function(){
      DataService.salvarSumula($scope.jogo._id, getJogadoresElenco(), time).then(function(retorno){
        $state.go('abasInicio.jogo-aba-time', {id: $scope.jogo._id});
      });
    };
    
    $scope.informarDepois = function(){
      $state.go('abasInicio.meuTime');
    }
  }])
