angular.module('app.directives')
.directive('telefoneBotao', [function(){
  return {
  	restrict: 'E',
  	scope: {telefone: '='},
    templateUrl: 'templates/directives/telefone-botao.html',
    controller: function($scope, $state){
	    $scope.formatarTelefone = formatarTelefone;

	    $scope.irParaWhatsapp = function(telefone){
	      window.open('https://api.whatsapp.com/send?phone=' + telefone.ddi + '' + telefone.numero, '_system'); 
	      return false;
	    }
    }
  }
}])
.directive('telefoneLink', [function(){
  return {
  	restrict: 'E',
  	scope: {telefone: '=', editavel: '@'},
    templateUrl: 'templates/directives/telefone-link.html',
    controller: function($scope, $state){
	    $scope.formatarTelefone = formatarTelefone;

	    $scope.irParaWhatsapp = function(telefone){
	      window.open('https://api.whatsapp.com/send?phone=' + telefone.ddi + '' + telefone.numero, '_system'); 
	      return false;
	    }
    }
  }
}])
.directive('telefoneInput', ['$ionicModal', '$ionicPopup',  function($ionicModal, $ionicPopup){
  return {
  	restrict: 'E',
  	scope: {telefone: '='},
    templateUrl: 'templates/directives/telefone-input.html',
    controller: function($scope, $state){

		
	    if($scope.telefone) {
			$scope.telefone.numeroFormatado = formatarTelefone($scope.telefone.numero);
			$scope.telefone = $scope.telefone;
	    } else {
			$scope.telefone = {ddi: '55', whatsapp: true};    	
	    }

		$ionicModal.fromTemplateUrl('templates/directives/telefone-modal.html', {
			scope: $scope,
			animation: 'no-animation',
			focusFirstInput: true,
		}).then(function(modal){
			$scope.modalTelefone = modal;
		});

		$scope.confirmarTelefone = function(){
		//todo:checar se telefone é válido
		if($scope.telefone.numero != undefined){
		  // Informou o ddd?
		  	if($scope.telefone.numero.length >= 10 || $scope.telefone.numero.length == 0){ 
		      	$scope.telefone = $scope.telefone;
		      	$scope.telefone.numeroFormatado = formatarTelefone($scope.telefone.numero);
		        // if(editando()){
		          // DataService.editarArbitro(_.pick($scope.arbitro, ['_id', 'telefone'])).then(function(){
		          //   $scope.modalTelefone.hide();
		          // });
		        // } else {
		        	$scope.modalTelefone.hide();
		        // }
			    } else {
			    	$ionicPopup.alert({
			    		title: 'Informe o DDD',
			    		content: 'Informe o telefone completo com DDD'
			    	});        
			    }
			} else {
				$ionicPopup.alert({
					title: 'Telefone inválido',
					content: 'Informe um telefone válido'
				});
			}
		}

    }
  }
}]);

function formatarTelefone(telefone){
	return telefone ? telefone.replace(/^(\d{2})?(\d{4,5})(\d{4})$/, "$1 $2-$3").trim() : '';
}