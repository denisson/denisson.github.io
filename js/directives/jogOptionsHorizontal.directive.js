angular.module('app.directives')
.directive('jogOptionsHorizontal', [function(){
    return {
        restrict: 'E',
        templateUrl: 'templates/directives/jog-options-horizontal.html',
        scope: {options: '=', key: '@', value: '@', onSelecionado: '&', preSelecionado: '='},
        link: function($scope) {
            $scope.chaveSelecionada = $scope.preSelecionado;

            $scope.selecionar = function(option){
                $scope.chaveSelecionada = option[$scope.key];
                $scope.onSelecionado({item:option});
            }

            $scope.isSelected = function(option) {
                return option[$scope.key] === $scope.chaveSelecionada;
            }
        }
    };
}])