angular
  .module('app.controllers')
  .controller('rankingController', ['$rootScope', '$scope', '$state', '$stateParams', 'DataService', 'AuthService', '$ionicActionSheet', '$ionicHistory', '$ionicPopup', '$ionicModal', 'config', function ($rootScope, $scope, $state, $stateParams, DataService, AuthService, $ionicActionSheet,$ionicHistory, $ionicPopup, $ionicModal, config) {

    $scope.jogosAnteriores = [];
    $scope.exibindoJogosAnteriores = false;
    $rootScope.$emit('loading.init');
    $scope.paginaTimes = 1;

    function mostrarAlerta(mensagem){
      $ionicPopup.alert({
        title: 'Ops!',
        content: mensagem
      }).then(function(){
        $ionicHistory.goBack();
      });
    }

    $scope.compartilharLink = function(ranking){
      var url = config.URL_SITE + '#/ranking/'+ranking._id + '/';
      if (window.plugins) {
        window.plugins.socialsharing.share('Ranking de amistosos é no Jogueiros FC! Você pode acompanhar tudo pelo site ou pelo aplicativo! \n' + url);
      } else {
        window.open(url);
      }
      return false;
    }

    $scope.atualizar = function(){
      $scope.rankingId = $stateParams.id;
      
      DataService.ranking($scope.rankingId).then(function(ranking){
        if(!ranking){
            mostrarAlerta('Essa ranking não existe mais');
            return;
        }

        $scope.ranking = ranking;
        $scope.$broadcast('scroll.refreshComplete');
        $rootScope.$emit('loading.finish');
      }).catch(function(){
          mostrarAlerta('Não foi possível carregar as informações deste ranking');
      });
      //Todo: checar quando falhar a consulta ao banco e exibir um erro
    }

    $scope.$on('$ionicView.enter', function(){
      DataService.blockPopup();
      $scope.atualizar();
    });

    $scope.editavel = function(){
      return $scope.ranking && AuthService.getLiga() && $scope.ranking.liga._id === AuthService.getLiga();
    }

    $scope.editarRanking = function(){
      // if($scope.editavel()){
        $state.go('ranking_editar', {id: $scope.ranking._id});
      // } else {
        // $scope.exibirModalTime($scope.ranking);
      // }
    }

    $scope.exibirMenu = function(){
       $ionicActionSheet.show({
         buttons: [ 
           { text: 'Editar ranking' },
         ],
         destructiveText: 'Excluir ranking',
         cancelText: 'Cancelar',
         destructiveButtonClicked: function(){
            DataService.excluirRanking($scope.rankingId).then(function(){
              AuthService.redirectClean('liga');
            });
            return true;
         },
         buttonClicked: function(index) {
            switch(index){
              case 0: 
                $scope.editarRanking();
                break;
            }
           return true;
         }
       });
    }

    $scope.verMaisTimes = function(){
      $scope.paginaTimes++;
      DataService.rankingTimes($scope.rankingId, $scope.paginaTimes).then(function(result){
        $scope.ranking.temMaisTimes = result.temMaisTimes;
        $scope.ranking.times = $scope.ranking.times.concat(result.times);
      });
    }

    $scope.verJogos = function(proximos){
      $state.go('ranking_jogos', {id: $scope.rankingId, nomeRanking: $scope.ranking.nome, proximos: proximos});
    }

    $scope.verTimeRanking = function(timeRanking){
      timeRanking.ranking = _.pick($scope.ranking, ['nome', 'liga']);
      $state.go('ranking_time', {id: timeRanking._id, timeRanking: timeRanking});
    }

    $scope.verLiga = function(ligaId){
      $state.go('liga', {id: ligaId});
    }

    $scope.criterioPrincipal = function(criterio){
      return _.get($scope.ranking, 'criterios.0.key') == criterio;
    }

    $scope.pluralize = function(quantidade, palavra){
      if(quantidade == 1) {
        return palavra;
      } else {
        return palavra + 's';
      }
    }


}])
