angular.module('app.directives')
.directive('selecionarCategoria', ['$ionicModal', 'CategoriaService', function($ionicModal, CategoriaService){
    return {
        restrict: 'A',
        scope: {onSelecionado: '&', preSelecionado: '=', labelBotao: '@', modalMinimo: '@'},
        link: function(scope, el, attr) {
            scope.categorias = CategoriaService.getCategorias();
            scope.categoriaSelecionada = scope.preSelecionado || {};
            scope.idade = {
                minima: null,
                maxima: null
            };

            $ionicModal.fromTemplateUrl('templates/times/selecionarCategoria.html', {
                scope: scope
            }).then(function(modal){
                scope.modal = modal; 
            });

            scope.concluir = function(){
                scope.idade.descricao = CategoriaService.descricaoIdade(scope.idade);
                scope.onSelecionado({categoria: scope.categoriaSelecionada, idade: scope.idade});
                scope.modal.hide();
            }

            scope.selecionar = function(categoria) {
                scope.categoriaSelecionada = categoria;
                scope.idade.minima = categoria.idadeMinima;
                scope.idade.maxima = categoria.chave === 'BASE'? categoria.idadeMaxima : null;

                if( categoria.chave === 'LIVRE') {
                    scope.concluir();
                }
            }

            scope.descricao = function(categoria) {
                return CategoriaService.descricao(categoria);
            }

            scope.setIdade = function (minima, maxima) {
                scope.idade.minima = minima;
                scope.idade.maxima = maxima;
            }

            function exibirModal(){
                scope.modal.show();
            }

            el.bind('click', function() {
                exibirModal()
            });

            el.bind('focus', function() {
                exibirModal()
            });
        }
    };
}])