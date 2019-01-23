function JogStepperController($scope, $element, $attrs) {
  var controller = this;
  controller.valor = controller.valor || 0;

  controller.increment = function() {
    controller.valor++;
  };

  controller.decrement = function() {
	if (controller.valor > 0) controller.valor--;
  };
}


angular.module('app.components', [])

.directive('jogStepper', [function(){
  return {
  	controller: JogStepperController,
  	controllerAs: '$ctrl',
  	bindToController: true,
    templateUrl: 'templates/directives/jog-stepper.html',
    scope: {
    	valor: '&'
    }
  };
}]);

