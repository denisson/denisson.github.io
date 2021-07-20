angular.module('app.directives')
.directive('scrollIntoView', [function(){
    return {
        restrict: 'A',
        scope: {scrollIntoView: '='},
        link: function(scope, el, attr) {
            if (scope.scrollIntoView) el[0].scrollIntoView({inline: 'center'});
        }
    };
}])