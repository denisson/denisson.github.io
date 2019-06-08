angular
  .module('app.controllers')
  .controller('selecionarLocalController', ['$scope', '$stateParams', 'DataService', 'AuthService', function ($scope, $stateParams, DataService, AuthService) {
    var fuseLocais;
    $scope.regiao = AuthService.getRegiao();
    $scope.search = {query: ''};

    $scope.buscarLocal = function(query){
      if(fuseLocais) {
        if(query.length){
          $scope.locais = _.slice(fuseLocais.search(_.deburr(query)), 0, 50);
        } else {
          $scope.locais = _.slice(fuseLocais.list, 0, 50);
        }
      } else {
        $scope.locais = [];
      }
    }

    DataService.locaisPreferidos($scope.jogo.mandante._id).then(function(locaisPreferidos){
      $scope.locaisSugeridos = locaisPreferidos;
    });

    function carregarLocais(){
      return DataService.locais($scope.regiao).then(function(locais){
        $scope.locais = _.slice(locais, 0, 50);
        fuseLocais = new Fuse(locais, {
          keys: ['nomeSemAcento'],
          threshold: 0.3,
        });
      });
    }

    carregarLocais();

    $scope.$on('alterarRegiao', function(event, regiao){
      $scope.regiao = regiao;
      carregarLocais().then(function(){
        $scope.buscarLocal($scope.search.query);
      });
    });

  }])
