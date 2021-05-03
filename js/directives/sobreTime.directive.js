angular.module('app.directives')
.directive('sobreTime', ['CategoriaService', 'ModalidadeService', 'GeneroService',  function(CategoriaService, ModalidadeService, GeneroService){
    return {
        restrict: 'E',
        templateUrl: 'templates/times/sobreTime.html',
        scope: {time: '='},
        link: function($scope) {
            $scope.generos = GeneroService.generos;

            $scope.descricaoIdade = function (idade) {
                return CategoriaService.descricaoIdade(idade);
            }
        
            $scope.descricaoModalidade = function (modalidade) {
                return ModalidadeService.descricao(modalidade);
            }

            $scope.selecionado = function(field, value){
                $scope.time[field] = value;
            }
        
        }
    };
}])