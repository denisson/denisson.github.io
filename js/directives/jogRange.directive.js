angular.module('app.directives')
.directive('jogRange', [function(){
    return {
      restrict: 'A',
        scope: {onSelecionado: '&', min: '=', max: '=', from: '=', to: '='},
        link: function(scope, element, attrs){
            var range =  $(element[0]);
            range.ionRangeSlider({
                skin: "round",
                type: scope.to ? "double" : "single",
                min: scope.min,
                max: scope.max,
                from: scope.from,
                to: scope.to,
                hide_min_max: true,
                force_edges: true,
                onFinish: function(data){
                    if (scope.to) {
                        scope.onSelecionado(data);    
                    } else {
                        scope.onSelecionado({value: data.from});
                    }
                }
            });
        }
  };
}])