angular.module('app.directives')
.directive('jogOptionsModal', ['$ionicModal', function($ionicModal){
    return {
        restrict: 'A',
        scope: {jogOptions: '=', jogKey: '@', jogValue: '@', jogTitle: '@', jogDescription: '@', onSelecionado: '&', preSelecionado: '='},
        link: function(scope, el, attr) {
            scope.chaveSelecionada = scope.preSelecionado;

            scope.selecionar = function(option){
                scope.chaveSelecionada = option[scope.jogKey];
                scope.onSelecionado({option:option});
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
            });
        }
    };
}])