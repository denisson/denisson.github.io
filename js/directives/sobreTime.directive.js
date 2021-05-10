angular.module('app.directives')
.directive('sobreTime', ['CategoriaService', 'ModalidadeService', 'GeneroService',  function(CategoriaService, ModalidadeService, GeneroService){
    return {
        restrict: 'E',
        templateUrl: 'templates/times/sobreTime.html',
        scope: {time: '='},
        link: function($scope) {            
            function initDescricao(){
                $scope.descricao = {
                    modalidade: ModalidadeService.descricao($scope.time.modalidade),
                    categoria: CategoriaService.descricaoIdade($scope.time.idade),
                }
            };
            initDescricao();
            $scope.generos = GeneroService.generos;

            $scope.selecionado = function(field, value){
                $scope.time[field] = value;
                initDescricao();
            }
        
        }
    };
}])