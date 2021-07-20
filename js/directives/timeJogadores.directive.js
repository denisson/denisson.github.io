angular.module('app.directives')
.directive('timeJogadores', [ '$state', 'DataService', function($state, DataService){
    return {
        restrict: 'E',
        templateUrl: 'templates/jogadores/timeJogadores.html',
        scope: {jogadores: '=', podeAdicionar: '=', timeId: '=', temporada: '=', ex: '='},
        link: function($scope) {
            $scope.jogadoresOrdem = 'ARTILHARIA';
            $scope.exJogadores = [];

            $scope.verJogador = function(jogador, temporada){
                $state.go('jogador', {id: jogador._id, jogador: jogador, temporada: temporada});
            }
          
            $scope.adicionarJogador = function(timeId){
                $state.go('jogador_cadastrar', {timeId: timeId, opcaoConvidado: false});
            }

            $scope.ordenarPor = function(ordem){
                var orderFunction;
                switch(ordem){
                  case 'ARTILHARIA':
                    orderFunction = function(a, b){
                      return ($scope.golsJogadorNaTemporada(b) - $scope.golsJogadorNaTemporada(a)) || ($scope.assistJogadorNaTemporada(b) - $scope.assistJogadorNaTemporada(a)) || ($scope.jogosJogadorNaTemporada(b) - $scope.jogosJogadorNaTemporada(a)) ||  a.nome.localeCompare(b.nome);
                    }
                  break;
                  case 'ASSISTENCIAS':
                    orderFunction = function(a, b){
                      return $scope.assistJogadorNaTemporada(b) - $scope.assistJogadorNaTemporada(a) || ($scope.golsJogadorNaTemporada(b) - $scope.golsJogadorNaTemporada(a)) || ($scope.jogosJogadorNaTemporada(b) - $scope.jogosJogadorNaTemporada(a)) || a.nome.localeCompare(b.nome);
                    }
                  break;
                  case 'JOGOS':
                    orderFunction = function(a, b){
                      return $scope.jogosJogadorNaTemporada(b) - $scope.jogosJogadorNaTemporada(a) || ($scope.golsJogadorNaTemporada(b) - $scope.golsJogadorNaTemporada(a)) || ($scope.assistJogadorNaTemporada(b) - $scope.assistJogadorNaTemporada(a)) || a.nome.localeCompare(b.nome);
                    }
                  break;
                  case 'POSICAO':
                    orderFunction = function(a, b){
                      return a.posicao.localeCompare(b.posicao) || ($scope.golsJogadorNaTemporada(b) - $scope.golsJogadorNaTemporada(a)) || ($scope.assistJogadorNaTemporada(b) - $scope.assistJogadorNaTemporada(a)) || ($scope.jogosJogadorNaTemporada(b) - $scope.jogosJogadorNaTemporada(a)) ||  a.nome.localeCompare(b.nome); //Se for a mesma posição, ordena pelo nome
                    }
                  break;
                  case 'NOME':
                    orderFunction = function(a, b){
                      return a.nome.localeCompare(b.nome);
                    }
                  break;
                }
                $scope.jogadoresOrdem = ordem;
                $scope.jogadores.sort(orderFunction);
              }

              $scope.golsJogadorNaTemporada = function(jogador){
                return attrJogadorNaTemporada('gols', jogador);
              }
          
              $scope.assistJogadorNaTemporada = function(jogador){
                return attrJogadorNaTemporada('assistencias', jogador);
              }
          
              $scope.jogosJogadorNaTemporada = function(jogador){
                return attrJogadorNaTemporada('jogos', jogador);
              }
          
              function attrJogadorNaTemporada(attr, jogador) {
                if($scope.temporada != 'todas'){
                  var temp = _.find(jogador.temporadas, {ano: _.parseInt($scope.temporada)});
                  return _.get(temp, attr, 0);
                } else {
                  return _.get(jogador, 'numeros.' + attr, 0);
                }
              }

              $scope.ordenarPor($scope.jogadoresOrdem);

              $scope.$watch('jogadores', function(dados){
                $scope.ordenarPor($scope.jogadoresOrdem);
            });

              $scope.verExJogadores = function(){
                DataService.timeExJogadores($scope.timeId).then(function(exJogadores){
                    $scope.exJogadores = exJogadores;
                });
              }
        }
    };
}])