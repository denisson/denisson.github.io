angular.module('app.directives')
.directive('jogRange', [function(){
    return {
      restrict: 'A',
        scope: {onSelecionado: '&', min: '=', max: '=', from: '=', to: '='},
        link: function(scope, element, attrs){
            var range =  $(element[0]);
            
            function selecionar(data) {
                if (scope.to) {
                    scope.onSelecionado(data);    
                } else if (data.from){
                    scope.onSelecionado({value: data.from});
                }
            }
            selecionar(scope);
            range.ionRangeSlider({
                skin: "round",
                type: scope.to ? "double" : "single",
                min: scope.min,
                max: scope.max,
                from: scope.from,
                to: scope.to,
                hide_min_max: true,
                force_edges: true,
                onFinish: selecionar
            });
            var slider = range.data("ionRangeSlider");

            scope.$watch('from', function() {
                if (slider) {
                    slider.update({from: scope.from});
                    selecionar(scope);
                }
            });

            scope.$watch('to', function() {
                if (slider) {
                    slider.update({to: scope.to});
                    selecionar(scope);
                }
            });
        }
  };
}])