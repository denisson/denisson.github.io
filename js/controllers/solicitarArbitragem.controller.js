angular
  .module('app.controllers')
  .controller('solicitarArbitragemController', ['$scope', '$stateParams', '$state', 'DataService', '$ionicPopup', function ($scope, $stateParams, $state, DataService, $ionicPopup) {
    
    $scope.ligaSelecionada = null;

    DataService.jogo($stateParams.id).then(function(jogo){
      if(jogo){
        $scope.jogo = jogo;
        inicializar();        
      }
    });

    $scope.$on('jogadorAdicionado', function(events, jogador){
      var novoJogador = {jogador: jogador, gols: 0, assistencias: 0, elenco: true};
      $scope.jogadores.push(novoJogador);
      $scope.checkJogador(novoJogador);
    });
    
    function inicializar(){
      if(!$stateParams.ligas){
        DataService.ligasDisponiveis($scope.jogo).then(function(ligas){
          if(!ligas || ligas.length == 0){
            $state.go('abasInicio.jogo-aba-time', {id: $stateParams.id});
            return;
          }
          $scope.ligas = ligas;
        });
      } else {
        $scope.ligas = $stateParams.ligas;
      }
    }

    $scope.selecionarLiga = function(liga){
      $scope.ligaSelecionada = liga;
    }

    $scope.solicitarArbitragem = function(){
      if(temLigaSelecionada()){
        DataService.solicitarArbitragem($scope.jogo._id, $scope.ligaSelecionada._id).then(function(retorno){
          $state.go('abasInicio.jogo-aba-time', {id: $scope.jogo._id}, {location:'replace'});
        });        
      }
    };

    function temLigaSelecionada(){
      if ($scope.ligas.length == 1){
        $scope.selecionarLiga($scope.ligas[0]);
        return true;
      } else if($scope.ligaSelecionada){
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
