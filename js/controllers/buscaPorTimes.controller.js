angular
  .module('app.controllers')
  .controller('buscaPorTimesController', ['$scope', '$stateParams', 'DataService', 'AuthService', function ($scope, $stateParams, DataService, AuthService) {

      var QTD_POR_PAGINA = 10;
      var fuse;
      $scope.times = [];
      $scope.page = 1;
      $scope.temMaisResultados = true; // Determina se existem mais jogos salvos no banco de dados que ainda não foram exibidos na tela
      $scope.dadosCarregados = false; // Flag utilizada para saber se já retornou o resultado do banco de dados
      $scope.todosTimes = [];
      $scope.todosTimesInicio = [];
      $scope.regiao = AuthService.getRegiao();
      $scope.search = {query: ''};
      var timesTmp = [];

      var fuseSemCidade;
      $scope.timesSemCidade = [];
      $scope.pageSemCidade = 1;
      $scope.temMaisResultadosSemCidade = true;
      $scope.todosTimesSemCidade = [];
      var timesSemCidadeTmp= [];

	    // DataService.times().then(function(times){
	    //   $scope.times = times;
     //    $scope.$broadcast('scroll.infiniteScrollComplete');
	    // });

      // $scope.$on('$ionicView.enter', function(){
        // if($scope.times){ //Se já fez a consulta alguma vez, não coloca mais a popup de processando
        //  DataService.blockPopup();
        // }        
      // });

    $scope.$on('alterarRegiao', function(event, regiao){
      $scope.regiao = regiao;
      carregarTimes().then(function(){
        $scope.buscarTime($scope.search.query);
      });
    });


      $scope.carregarResultados = function(){
          if( $scope.todosTimes.length > 0){
              timesTmp.push.apply(timesTmp, $scope.todosTimes[$scope.page - 1]);
              $scope.page++;
          }
          $scope.temMaisResultados = ($scope.page <= $scope.todosTimes.length);
          $scope.times = _.clone(timesTmp);
          $scope.dadosCarregados = true;
          $scope.$broadcast('scroll.infiniteScrollComplete');
      }

      $scope.carregarResultadosSemCidade = function(){
        if( $scope.todosTimesSemCidade.length > 0){
            timesSemCidadeTmp.push.apply(timesSemCidadeTmp, $scope.todosTimesSemCidade[$scope.pageSemCidade - 1]);
            $scope.pageSemCidade++;
        }
        $scope.temMaisResultadosSemCidade = ($scope.pageSemCidade <= $scope.todosTimesSemCidade.length);
        $scope.timesSemCidade = _.clone(timesSemCidadeTmp);
        $scope.dadosCarregados = true;
        $scope.$broadcast('scroll.infiniteScrollComplete');
      }
      

      function carregarTimes(){
        if($scope.regiao){
          return DataService.times($scope.regiao).then(function(times){
            var timesDaRegiao = [];
            var timesSemCidade = [];
            // DataService.blockPopup();
            for (var i = 0; i < times.length; i++) {
              times[i]['nomeSemAcento'] = _.deburr(times[i]['nome']);
              if(_.get(times[i], 'cidade._id')){
                timesDaRegiao.push(times[i]);
              } else {
                timesSemCidade.push(times[i]);
              }
            }
            $scope.todosTimesInicio = timesDaRegiao;
            $scope.todosTimes = _.chunk(timesDaRegiao, QTD_POR_PAGINA);
            $scope.todosTimesSemCidade = _.chunk(timesSemCidade, QTD_POR_PAGINA);
            // $scope.todosTimesSemCidade = timesSemCidade;
            fuse = new Fuse(timesDaRegiao, {
              keys: ['nomeSemAcento'],
              threshold: 0.3,
            });

            fuseSemCidade = new Fuse(timesSemCidade, {
              keys: ['nomeSemAcento'],
              threshold: 0.3,
            });

            
          });
        }
      }

      $scope.buscarTime = function(query){
        if (fuse && fuseSemCidade) {
          if(query){
            var times = fuse.search(_.deburr(query));
            var timesSemCidade = fuseSemCidade.search(_.deburr(query));
          }  else {
            var times = $scope.todosTimesInicio;
            var timesSemCidade = fuseSemCidade.list;
          }
          $scope.todosTimes = _.chunk(times, QTD_POR_PAGINA);
          $scope.todosTimesSemCidade = _.chunk(timesSemCidade, QTD_POR_PAGINA);
          $scope.page = 1;
          $scope.pageSemCidade = 1;
          timesTmp = [];
          timesSemCidadeTmp = [];
          $scope.carregarResultados();
          $scope.carregarResultadosSemCidade();
        }          
      }

      var retornoTimes =  false;
      if(retornoTimes = carregarTimes()){
          retornoTimes.then(function(){
            $scope.carregarResultados();
            $scope.carregarResultadosSemCidade();
          });
      }

  }])
