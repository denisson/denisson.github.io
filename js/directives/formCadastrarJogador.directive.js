angular.module('app.directives')
.directive('formCadastrarJogador', 
    ['DataService', 'CameraService', '$ionicPopup',  
    function (DataService, CameraService, $ionicPopup) {
        return {
        restrict: 'E',
        scope: {jogador: '=', timeId: '=', opcaoConvidado: '@', aoSalvar: '&'},
        templateUrl: 'templates/jogadores/form-cadastrar-jogador.html',
        controller: function($scope, $state){

            function zerarDadosJogador() {
                $scope.jogador = {};
                $scope.jogador.foto = '';
                $scope.jogador.nome = '';
                $scope.jogador.posicao = '';
                $scope.jogador.fotoAlterada = false;
                $scope.jogador.time = $scope.timeId;
                if($scope.opcaoConvidado){
                    $scope.opcaoConvidado = true;
                    $scope.jogador.convidado = false;
                }
            }

            if( !$scope.jogador ) {
                zerarDadosJogador();
            }

            $scope.posicoes = [];
            carregarPosicoes();
        
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
                    var dadosJogador = {id: registroSalvo.id, _id: registroSalvo.id, time: $scope.jogador.time, foto: $scope.jogador.foto, nome: $scope.jogador.nome, posicao: $scope.jogador.posicao, ehGoleiro: registroSalvo.ehGoleiro};
                    $scope.aoSalvar({jogador: dadosJogador});
                    zerarDadosJogador();
                });
            }
        
            function carregarPosicoes(){
                if(!$scope.posicoes.length){
                    DataService.jogadorPosicoes().then(function(posicoes){
                      $scope.posicoes = posicoes;
                    });        
                  }
            }
        }
      }
    }
])