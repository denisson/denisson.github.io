angular.module('app.directives')
.directive('selecionarCategoria', ['$ionicModal', 'CategoriaService', function($ionicModal, CategoriaService){
    return {
        restrict: 'A',
        scope: {onSelecionado: '&', preSelecionado: '=', labelBotao: '@', modalMinimo: '@', podeLimpar: '='},
        link: function(scope, el, attr) {
            scope.categorias = CategoriaService.getCategorias();
            // scope.categoriaSelecionada = scope.preSelecionado || {};
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
                scope.idade.descricao = scope.categoriaSelecionada.chave ? CategoriaService.descricaoIdade(scope.idade) : null;
                scope.onSelecionado({categoria: scope.categoriaSelecionada, idade: scope.idade});
                scope.modal.hide();
            }

            scope.selecionar = function(categoria) {
                scope.titulo = categoria.nome;
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

            scope.limpar = function() {
                scope.selecionar({});
                scope.concluir();
            }

            function exibirModal(){
                scope.selecionar({});
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