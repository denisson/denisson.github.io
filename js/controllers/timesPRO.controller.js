angular
  .module('app.controllers')
  .controller('timesPROController', 
  ['$scope', 'DataService', 'TimeService',
  function ($scope, DataService, TimeService) {
    $scope.usuarios = [];
       
    function carregarTimes(){
        return DataService.timesPRO().then(function(usuarios){
            $scope.usuarios =  usuarios;
        });
    }
    carregarTimes();

    $scope.descricaoTime = function(time){
      var descricao = TimeService.descricao(time);
      var cidade = _.get(time, 'cidade.nome', '');
      return [cidade, descricao].filter(Boolean).join(' • ');
    }

    $scope.enviarZap = function(time) {      
      var texto = 'Boa tarde, amigo. Tudo bem? \nMeu nome é Denisson. Sou o fundador do aplicativo Jogueiros FC. \nVocê é o representante do ' + time.nome + '?';
      window.open('https://api.whatsapp.com/send?phone=' + time.telefone.ddi + time.telefone.numero + '&text=' + texto, '_system');
    }

  }])
