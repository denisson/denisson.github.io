angular.module('app.directives')
.directive('jogJogadorNumero', [function(){
    return {
      restrict: 'E',
      scope: {titulo: '@', value: '=', min: '=', restante: '=', aoAlterarValor: '&'},
      templateUrl: 'templates/directives/jog-jogador-numero.html',
      controller: function($scope, $state){
        $scope.value = $scope.value || 0;
        $scope.min = $scope.min || 0;

        $scope.decrement = function() {
          $scope.value--;
          // $scope.contadorGeral++;
          $scope.aoAlterarValor({inc: 1});
        };

        $scope.increment = function() {
          $scope.value++;
          // $scope.contadorGeral--;
          $scope.aoAlterarValor({inc: -1});
        };
      
        $scope.allowDecrement = function(){
          return $scope.value > $scope.min;
        }

        $scope.allowIncrement = function(){
          return ($scope.restante === undefined) ||  ($scope.restante > 0);
        }

      }
    };
  }])