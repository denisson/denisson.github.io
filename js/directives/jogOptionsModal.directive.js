angular.module('app.directives')
.directive('jogOptionsModal', ['$ionicModal', function($ionicModal){
    return {
        restrict: 'A',
        scope: {jogOptions: '=', jogKey: '@', jogValue: '@', jogType: '@', jogTitle: '@', jogDescription: '@', onSelecionado: '&', onShowModal: '&', preSelecionado: '=', podeLimpar: '=', podeBuscar: '='},
        link: function(scope, el, attr) {
            scope.search = '';
            scope.chaveSelecionada = scope.preSelecionado;

            scope.mudou = function(){
                scope.search = this.search;
            }

            scope.selecionar = function(option){
                scope.chaveSelecionada = option[scope.jogKey];
                scope.onSelecionado({option:option});
                scope.modal.hide();
            }

            scope.limpar = function(){
                scope.onSelecionado({option:null});
                scope.modal.hide();
            }

            scope.isSelected = function(option) {
                return option[scope.jogKey] === scope.chaveSelecionada;
            }

            $ionicModal.fromTemplateUrl('templates/directives/jog-options-modal.html', {
                scope: scope
            }).then(function(modal){
                scope.modal = modal; 
            });

            el.bind('click', function() {
                scope.modal.show();
                scope.onShowModal();
            });
        }
    };
}])