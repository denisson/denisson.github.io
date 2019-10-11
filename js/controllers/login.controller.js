angular
  .module('app.controllers')
  .controller('loginController', ['$scope', '$state', '$stateParams', '$auth', 'AuthService', 'config', function ($scope, $state, $stateParams, $auth, AuthService, config) {
  	$scope.appArbitragem = false;
  	// $scope.appArbitragem = (config.TIPO_APP == 'ARBITRAGEM');

  	$scope.trocarApp = function(){
  		$scope.appArbitragem = !$scope.appArbitragem;
  	}

  	$scope.textoTrocarApp = function(){
  		if($scope.appArbitragem){
			return "Você tem um time?"
  		} else {
			return "Você é árbitro?"
  		}
  	}

    $scope.authenticate = function(provider) {
      AuthService.login(provider, {loginTelaArbitro: $scope.appArbitragem});
    };
  }]);
