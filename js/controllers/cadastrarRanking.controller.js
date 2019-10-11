angular
  .module('app.controllers')
  .controller('cadastrarRankingController', ['$scope', '$state', '$stateParams', 'DataService', 'AuthService','$ionicModal', '$ionicPopup', 'CameraService',  function ($scope, $state, $stateParams, DataService, AuthService, $ionicModal, $ionicPopup, CameraService) {
    var imagePath = '';
    $scope.ranking = null;


  if(editando()){
    $scope.rankingId = $stateParams.id;

    DataService.ranking($scope.rankingId).then(function(ranking){
      ranking.dataInicio = new Date(ranking.dataInicio);
      ranking.dataFim = new Date(ranking.dataFim);
      $scope.ranking = ranking;
    });

    $scope.titulo = 'Editar ranking';
    $scope.labelBotao = 'Salvar';
  } else {
    $scope.ranking = {nome: '', foto: '', numJogosPorSemana: 1};
    $scope.titulo = 'Cadastrar Ranking';
    $scope.labelBotao = 'Confirmar cadastro';

    DataService.criteriosClassificacao().then(function(criterios){
      $scope.ranking.criterios = criterios;
    });
  }

  function editando(){
    return ($stateParams.id);
  }

  $scope.capturarFoto = function(){
    CameraService.getPicture().then(function(imagePath){
      $scope.ranking.foto = imagePath;
      $scope.fotoAlterada = true;
      $scope.$apply();
    });
  };

  $scope.moveItem = function(item, fromIndex, toIndex) {
    $scope.ranking.criterios.splice(fromIndex, 1);
    $scope.ranking.criterios.splice(toIndex, 0, item);
  };

  $scope.enviar = function(){
    if(editando()){
      var rankingSalvar = angular.copy($scope.ranking);
      rankingSalvar.dataInicio = moment(rankingSalvar.dataInicio).startOf('day');
      rankingSalvar.dataFim = moment(rankingSalvar.dataFim).endOf('day');
    
      if(!$scope.fotoAlterada) {
        rankingSalvar.foto = '';
      }
      
      DataService.editarRanking($scope.rankingId, rankingSalvar).then(function(resposta){
        AuthService.redirectClean('liga_ranking', null, {id: resposta.id});
      });
    } else {
      DataService.cadastrarRanking($scope.ranking).then(function(resposta){
        AuthService.redirectClean('liga_ranking', null, {id: resposta.id});
      });
    }
  }

}])
