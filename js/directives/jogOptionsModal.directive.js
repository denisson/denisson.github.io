angular.module('app.directives')
.directive('jogOptionsModal', ['$ionicModal', function($ionicModal){
    return {
        restrict: 'A',
        scope: {options: '=', key: '@', value: '@', title: '@', description: '@', onSelecionado: '&', preSelecionado: '='},
        link: function(scope, el, attr) {
            scope.chaveSelecionada = scope.preSelecionado;

            scope.selecionar = function(option){
                scope.chaveSelecionada = option[scope.key];
                scope.onSelecionado({option:option});
                scope.modal.hide();
            }

            scope.isSelected = function(option) {
                return option[scope.key] === scope.chaveSelecionada;
            }

            $ionicModal.fromTemplateUrl('templates/directives/jog-options-modal.html', {
                scope: scope
            }).then(function(modal){
                scope.modal = modal; 
            });

            el.bind('click', function() {
                scope.modal.show();
            });
        }
    };
}])