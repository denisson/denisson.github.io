angular
  .module('app.controllers')
  .controller('selecionarLocalController', ['$scope', '$rootScope', '$stateParams', 'DataService', 'AuthService', function ($scope, $rootScope, $stateParams, DataService, AuthService) {
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

    if($scope.jogo.mandante._id){
      DataService.locaisPreferidos($scope.jogo.mandante._id).then(function(locaisPreferidos){
        $scope.locaisSugeridos = locaisPreferidos;
      });      
    }


    function carregarLocais(){
      if(!$scope.regiao) return false;
      return DataService.locais($scope.regiao).then(function(locais){
        $scope.locais = _.slice(locais, 0, 50);
        fuseLocais = new Fuse(locais, {
          keys: ['nomeSemAcento'],
          threshold: 0.3,
        });
      });
    }

    carregarLocais();

    $rootScope.$on('alterarRegiao', function(event, uf){
      $scope.regiao = uf;
      carregarLocais().then(function(){
        $scope.buscarLocal($scope.search.query);
      });
    });

  }])
