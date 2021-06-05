angular.module('app.directives')
.directive('jogCropper', [function(){
    return {
      restrict: 'A',
      scope: {aoInicializar: '&'},
      link: function(scope, el, attr) {

        scope.$watch(el.attr('src'), function(){
            var cropper = new Cropper(el[0], {
                aspectRatio: 1,
                background: false,
                viewMode: 1,
                dragMode: 'move',
              });
              scope.aoInicializar({cropper: cropper});
        });
      }
    };
  }])