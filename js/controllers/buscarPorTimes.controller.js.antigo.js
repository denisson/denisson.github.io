angular
  .module('app.controllers')
  .controller('buscaPorTimesController', ['$scope', '$stateParams', 'DataService', function ($scope, $stateParams, DataService) {

      var QTD_POR_PAGINA = 10;
      $scope.regiao = 'BR';
      $scope.times = [];
      $scope.page = 1;
      $scope.temMaisResultados = true; // Determina se existem mais jogos salvos no banco de dados que ainda não foram exibidos na tela
      $scope.dadosCarregados = false; // Flag utilizada para saber se já retornou o resultado do banco de dados
      $scope.query = '';

      $scope.carregarResultados = function(zerar){
        DataService.blockPopup();
        DataService.times($scope.query, $scope.page, QTD_POR_PAGINA, $scope.regiao).then(function(times){
          if(zerar){
            $scope.times = [];
          }
          if( times.length > 0){
              $scope.times.push.apply($scope.times, times);
              $scope.page++;
          }
          $scope.temMaisResultados = (times.length == QTD_POR_PAGINA);
          $scope.dadosCarregados = true;
          $scope.$broadcast('scroll.infiniteScrollComplete');
        });

      }
      $scope.carregarResultados();

      $scope.buscarTime = function(query){
        $scope.query = query;
        $scope.page = 1;
        $scope.carregarResultados(true);
      }

  }])
