angular
  .module('app.controllers')
  .controller('inicioController', ['$scope', '$rootScope', '$stateParams', 'DataService', 'AuthService', '$ionicPopup', '$attrs', function ($scope, $rootScope, $stateParams, DataService, AuthService, $ionicPopup, $attrs) {
    var QTD_POR_PAGINA = 10;
    $scope.jogos = [];
    $scope.page = 0;
    $scope.temMaisResultados = true; // Determina se existem mais jogos salvos no banco de dados que ainda não foram exibidos na tela
    $scope.dadosCarregados = false; // Flag utilizada para saber se já retornou o resultado do banco de dados
    $scope.proximos = $attrs.proximosJogos;
    

    $rootScope.$on('alterarRegiao', function(event, uf){
      $scope.atualizar();
    });

    $scope.irParaUrl = function(url){
      window.open(url, '_system');
      return false;
    }

    // $scope.irParaAnuncio = function(url){
    //   $scope.irParaUrl('http://refpa.top/L?tag=d_363483m_5437c_&site=363483&ad=5437');
    // }

    var processaJogos = function(jogos){
      if($scope.zerar){ // Quando o parâmetro zerar é passado, ao invés de trazer mais jogos, os jogos atuais irão sobrepor os atuais. É o refresh da tela
        $scope.jogos = jogos;
        $scope.page++;
      } else if( jogos.length > 0){
          $scope.jogos.push.apply($scope.jogos, jogos);
          $scope.page++;
      }
      $scope.temMaisResultados = (jogos.length == QTD_POR_PAGINA);
      $scope.dadosCarregados = true;
      $scope.$broadcast('scroll.refreshComplete');
      $scope.$broadcast('scroll.infiniteScrollComplete');
    }

    $scope.carregarJogos = function(zerar){
      $scope.zerar = zerar;
      var result;
      if($scope.dadosCarregados){//primeiro carregamento
        DataService.blockPopup();
      }
      var esporte = _.get($scope, 'perfilFiltro.esporte.chave');
      var regiao = _.get($scope, 'perfilFiltro.regiao');
      var plataforma = _.get($scope, 'perfilFiltro.plataforma.chave');
      if($scope.proximos){
        result = DataService.jogosFuturos($scope.page, QTD_POR_PAGINA, esporte, regiao, plataforma);
      } else {
        result = DataService.jogosEncerrados($scope.page, QTD_POR_PAGINA, esporte, regiao, plataforma);
      }

      result.then(processaJogos).catch(function(){
        $scope.temMaisResultados = false;
        $ionicPopup.alert({
          title: 'Erro de conexão',
          content: 'Não foi possível carrregar os jogos'
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
      $scope.carregarJogos(true);
    }

    $scope.inicializar();

  }]);
