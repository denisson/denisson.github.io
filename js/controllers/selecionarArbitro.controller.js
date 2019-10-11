angular
  .module('app.controllers')
  .controller('selecionarArbitroController', ['$scope', '$stateParams', 'DataService', 'AuthService', function ($scope, $stateParams, DataService, AuthService) {

      var QTD_POR_PAGINA = 20;
      var fuse;
      $scope.registros = [];
      $scope.page = 1;
      $scope.temMaisResultados = true; // Determina se existem mais jogos salvos no banco de dados que ainda não foram exibidos na tela
      $scope.dadosCarregados = false; // Flag utilizada para saber se já retornou o resultado do banco de dados
      $scope.todosRegistros = [];
      $scope.todosRegistrosInicio = [];
      $scope.search = {query: ''};
      var registrosTmp = [];

      $scope.liga = AuthService.getLiga();

      $scope.carregarResultados = function(){
          if( $scope.todosRegistros.length > 0){
              registrosTmp.push.apply(registrosTmp, $scope.todosRegistros[$scope.page - 1]);
              $scope.page++;
          }
          $scope.temMaisResultados = ($scope.page <= $scope.todosRegistros.length);
          $scope.registros = _.clone(registrosTmp);
          $scope.dadosCarregados = true;
          $scope.$broadcast('scroll.infiniteScrollComplete');
      }

      function carregarRegistros(){
        if($scope.liga){
          return DataService.arbitros($scope.liga).then(function(registros){
            var registrosDaLiga = [];
            for (var i = 0; i < registros.length; i++) {
              registros[i]['nomeSemAcento'] = _.deburr(registros[i]['nome']);
              registrosDaLiga.push(registros[i]);

            }
            $scope.todosRegistrosInicio = registrosDaLiga;
            $scope.todosRegistros = _.chunk(registrosDaLiga, QTD_POR_PAGINA);
            fuse = new Fuse(registrosDaLiga, {
              keys: ['nomeSemAcento'],
              threshold: 0.3,
            });
            
          });
        }
      }

      $scope.buscar = function(query){
        if (fuse) {
          if(query){
            var registros = fuse.search(_.deburr(query));
          }  else {
            var registros = $scope.todosRegistrosInicio;
          }
          $scope.todosRegistros = _.chunk(registros, QTD_POR_PAGINA);
          $scope.page = 1;
          registrosTmp = [];
          $scope.carregarResultados();
        }          
      }

      var retorno =  false;
      if(retorno = carregarRegistros()){
          retorno.then(function(){
            $scope.carregarResultados();
          });
      }

  }])
