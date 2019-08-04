angular
  .module('app.controllers')
  .controller('solicitarArbitragemController', ['$scope', '$stateParams', '$state', 'DataService', '$ionicPopup', function ($scope, $stateParams, $state, DataService, $ionicPopup) {
    $scope.jogo = $stateParams.jogo;
    $scope.ligaSelecionada = null;

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
      DataService.ligasDisponiveis().then(function(ligas){
        $scope.ligas = ligas;
      });
    }

    $scope.selecionarLiga = function(liga){
      $scope.ligaSelecionada = liga;
    }

    $scope.solicitarArbitragem = function(){
      if(temLigaSelecionada()){
        DataService.solicitarArbitragem($scope.jogo._id, $scope.ligaSelecionada._id).then(function(retorno){
          $state.go('abasInicio.jogo-aba-time', {id: $scope.jogo._id});
        });        
      }
    };

    function temLigaSelecionada(){
      if ($scope.ligaSelecionada){
        return true;
      } else {
        $ionicPopup.alert({
          title: 'Escolha uma opção',
          content: 'Você precisa escolher uma das opcões listadas'
        });
      }
    } 
    
    $scope.naoSolicitar = function(){
      $state.go('abasInicio.jogo-aba-time', {id: $scope.jogo._id});
    }
  }])
