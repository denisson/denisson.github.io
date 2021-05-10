angular.module('app.directives')
.directive('telefoneBotao', [function(){
  return {
  	restrict: 'E',
  	scope: {telefone: '='},
    templateUrl: 'templates/directives/telefone-botao.html',
    controller: function($scope){
	    $scope.formatarTelefone = formatarTelefone;
	    $scope.irParaWhatsapp = irParaWhatsapp;
    }
  }
}])
.directive('telefoneLink', [function(){
  return {
  	restrict: 'E',
  	scope: {telefone: '=', editavel: '@', aoClicarCadastrarTelefone: '&'},
    templateUrl: 'templates/directives/telefone-link.html',
    controller: function($scope){
	    $scope.formatarTelefone = formatarTelefone;
	    $scope.irParaWhatsapp = irParaWhatsapp;
		
	    $scope.cadastrarTelefone = function(){
			$scope.aoClicarCadastrarTelefone();
			return false;
		}
    }
  }
}])
.directive('telefoneInput', ['$ionicModal', '$ionicPopup', 'DataService', function($ionicModal, $ionicPopup, DataService){
  return {
  	restrict: 'E',
  	scope: {telefone: '=', aoInformar: '&'},
    templateUrl: 'templates/directives/telefone-input.html',
    controller: function($scope, $state){

		DataService.ddis().then(function(ddis){
			$scope.ddis = ddis;
		})

		$scope.ddiSelecionado = function(ddi) {
			$scope.telefone.ddi = ddi.code;
		}

	    if($scope.telefone) {
			$scope.telefone.numeroFormatado = formatarTelefone($scope.telefone);
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
				if($scope.telefone.ddi != 55 || $scope.telefone.numero.length >= 10 || $scope.telefone.numero.length == 0){ 
					$scope.telefone = $scope.telefone;
					$scope.telefone.numeroFormatado = formatarTelefone($scope.telefone);
					$scope.modalTelefone.hide();
					$scope.aoInformar({telefone: $scope.telefone});
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
	if (!telefone.numero) return '';
	return telefone.ddi == 55 ? telefone.numero.replace(/^(\d{2})?(\d{4,5})(\d{4})$/, "$1 $2-$3").trim() : '+' + telefone.ddi + ' ' +  telefone.numero;
}

function irParaWhatsapp(telefone) {
	var numero = (telefone.ddi + '' + telefone.numero).replace(/\s*/g, '');
	window.open('https://api.whatsapp.com/send?phone=' + numero, '_system'); 
	return false;
}