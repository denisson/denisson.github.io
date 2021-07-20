angular.module('app.directives')
.directive('jogoJogadores', ['$ionicModal', 'SumulaService', function($ionicModal, SumulaService){
  return {
  	restrict: 'E',
  	scope: {jogo: '=', tipoTime: '@', editavel: '=', informarSumulaCallback: '&'},
    templateUrl: 'templates/jogos/jogo.jogadores.html',
    controller: function($scope, $state){

        $scope.naoInformouGols = function(){
            //O jogo já foi encerrado (placar informado), mas o time não informou a súmula.
            return $scope.jogo.encerrado && $scope.jogo.jogadores[$scope.tipoTime].length == 0;
        }

        $scope.mensagemSobrePlacar = function(){
            // mostrando o lado do time cadastrante
            if ($scope.tipoTime === 'mandante') {
                if (!$scope.editavel) return 'sumulaVazia';
            } else {
                if (!$scope.editavel && $scope.jogo.verificado) return 'sumulaVazia';
                if (!$scope.editavel && $scope.jogo.situacao == 'confirmarPlacar') return 'aguardandoConfirmarPlacar';
                if ($scope.jogo.situacao == 'placarRejeitado') return 'placarRejeitado';
                if (!$scope.jogo.visitante._id) return 'timeNaoCadastrado';
            }
        
        }

        $scope.exibirBotaoSumula = function(){
            return $scope.editavel
                && (
                    $scope.tipoTime === 'mandante'
                    || $scope.jogo.situacao == 'placarConfirmado'
                );
        }

        $scope.jogadorModal = {};
        $ionicModal.fromTemplateUrl('templates/jogos/verScoutJogador.html', {
          scope: $scope,
          animation: 'fade-in'
        }).then(function(modal){
          $scope.modalJogador = modal;
        });
    
        $scope.verScoutJogador = function(jogador){
          $scope.jogadorModal = jogador;
          $scope.modalJogador.show();
        }

        $scope.verPerfilCompleto = function(jogador){
            $state.go('jogador', {id: jogador._id, jogador: jogador});
            $scope.modalJogador.hide();
        }
    
        $scope.temNumerosNoJogo = function(jogador) {
            return SumulaService.temInformacaoParaMostrar(jogador);
        }
    }
  }
}]);
