angular
  .module('app.controllers')
  .controller('ligaTimesController', ['$scope', '$stateParams', 'DataService', 'AuthService', '$ionicPopup', '$attrs', function ($scope, $stateParams, DataService, AuthService, $ionicPopup, $attrs) {
    var QTD_POR_PAGINA = 10;
    $scope.times = [];
    $scope.page = 0;
    $scope.temMaisResultados = true; // Determina se existem mais times salvos no banco de dados que ainda não foram exibidos na tela
    $scope.dadosCarregados = false; // Flag utilizada para saber se já retornou o resultado do banco de dados
    $scope.nomeLiga = $stateParams.nomeLiga;
    

    var processatimes = function(times){
      if($scope.zerar){ // Quando o parâmetro zerar é passado, ao invés de trazer mais times, os times atuais irão sobrepor os atuais. É o refresh da tela
        $scope.times = times;
        $scope.page++;
      } else if( times.length > 0){
          $scope.times.push.apply($scope.times, times);
          $scope.page++;
      }
      $scope.temMaisResultados = (times.length == QTD_POR_PAGINA);
      $scope.dadosCarregados = true;
      $scope.$broadcast('scroll.refreshComplete');
      $scope.$broadcast('scroll.infiniteScrollComplete');
    }

    $scope.carregarTimes = function(zerar){
      $scope.zerar = zerar;
      var result;
      if($scope.dadosCarregados){//primeiro carregamento
        DataService.blockPopup();
      }


      result = DataService.ligaTimes($stateParams.id, $scope.page, QTD_POR_PAGINA);
      result.then(processatimes).catch(function(){
        $scope.temMaisResultados = false;
        $ionicPopup.alert({
          title: 'Erro de conexão',
          content: 'Não foi possível carrregar os times'
        });
        $scope.$broadcast('scroll.refreshComplete');
        $scope.$broadcast('scroll.infiniteScrollComplete');
      });
    };

    $scope.inicializar = function(){
      if($scope.page === 0){
        $scope.page = 1;
        $scope.atualizar();
      }
    }

    $scope.$on('$ionicView.enter', function(){
      $scope.inicializar();
    });

    $scope.atualizar = function(){
      $scope.page = 1;
      $scope.carregarTimes(true);
    }

    $scope.inicializar();

  }]);
