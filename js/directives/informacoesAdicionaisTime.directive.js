angular.module('app.directives')
.directive('informacoesAdicionaisTime', ['$ionicModal', 'DataService', '$ionicPopup', function($ionicModal, DataService, $ionicPopup){
    return {
        restrict: 'E',
        templateUrl: 'templates/times/informacoesAdicionaisTime.html',
        scope: {time: '='},
        link: function($scope) {
            $scope.telefone = {ddi: '55', whatsapp: true};

            if($scope.time.telefone) {
                $scope.time.telefone.numeroFormatado = formatarTelefone($scope.time.telefone.numero);
                $scope.telefone = $scope.time.telefone;
            }

            $ionicModal.fromTemplateUrl('templates/times/informarTelefone.html', {
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
                    $scope.time.telefone = $scope.telefone;
                    $scope.time.telefone.numeroFormatado = formatarTelefone($scope.time.telefone.numero);
                    DataService.editarTime(_.pick($scope.time, ['_id', 'telefone'])).then(function(){
                        $scope.modalTelefone.hide();
                    });
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
        
            function formatarTelefone(telefone){
                return telefone ? telefone.replace(/^(\d{2})?(\d{4,5})(\d{4})$/, "$1 $2-$3").trim() : '';
            }
        }
    };
}])