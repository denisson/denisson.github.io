angular
  .module('app.controllers')
  .controller('selecionarCompeticaoController', ['$scope', '$rootScope', '$stateParams', 'DataService', 'AuthService', function ($scope, $rootScope, $stateParams, DataService, AuthService) {
    var fuse;
    $scope.perfilFiltro = AuthService.getPerfilFiltro();
    $scope.search = {query: ''};

    $scope.buscarCompeticoes = function(query){
      if(fuse) {
        if(query.length){
          $scope.competicoes = _.slice(fuse.search(_.deburr(query)), 0, 50);
        } else {
          $scope.competicoes = _.slice(fuse.list, 0, 50);
        }
      } else {
        $scope.competicoes = [];
      }
    }

    if($scope.jogo.mandante._id){
      DataService.competicoesSugeridas($scope.jogo.mandante._id).then(function(competicoesSugeridas){
        $scope.competicoesSugeridas = competicoesSugeridas;
      });      

    }


    function carregarCompeticoes(){
        var esporte = _.get($scope.perfilFiltro, 'esporte.chave');
        var regiao = $scope.perfilFiltro.regiao;
        var plataforma = _.get($scope.perfilFiltro, 'plataforma.chave');
        if(!regiao && !_.get($scope.perfilFiltro, 'esporte.efootball')) return false;

        return DataService.competicoes(esporte, regiao, plataforma).then(function(competicoes){
            $scope.temMaisCompeticoes = (competicoes.length > 50);
            $scope.competicoes = _.slice(competicoes, 0, 50);

            fuse = new Fuse(competicoes, {
            keys: ['nomeSemAcento'],
            threshold: 0.3,
            });
        });
    }

    carregarCompeticoes();

    $rootScope.$on('alterarRegiao', function(event, filtro){
      $scope.perfilFiltro = filtro;
      carregarCompeticoes().then(function(){
        $scope.buscarCompeticoes($scope.search.query);
      });
    });

  }])
