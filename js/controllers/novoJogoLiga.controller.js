angular
  .module('app.controllers')
  .controller('novoJogoLigaController', ['$scope', '$state', '$stateParams', 'DataService', '$ionicModal', 'AuthService', '$rootScope', 'CameraService', '$ionicHistory', '$ionicPopup', function ($scope, $state, $stateParams, DataService, $ionicModal, AuthService, $rootScope, CameraService, $ionicHistory,  $ionicPopup) {
    var modalTimeAberto;

    $scope.cadastradoPelaLiga = $stateParams.id;

    function configurarJogoVazio(){
      $scope.jogo = {
        mandante: {},
        tipoTimeSolicitante: 'mandante'
      };
    };
    configurarJogoVazio();

    $scope.podeSalvar = function(){
      try{
        return $scope.podeExibirSolicitante() && $scope.jogo.data && ($scope.jogo.hora != undefined) && $scope.jogo.local.nome;
      } catch (exception){
        return false;
      }
    }

    $scope.podeExibirSolicitante = function(){
      return _.get($scope, 'jogo.mandante._id') && _.get($scope, 'jogo.visitante._id');
    }

    $ionicModal.fromTemplateUrl('templates/jogos/selecionarTime.html', {
      scope: $scope,
      focusFirstInput: true,
    }).then(function(modal){
      $scope.modalTimeMandante = modal;
    });

    $ionicModal.fromTemplateUrl('templates/jogos/selecionarTime.html', {
      scope: $scope,
      focusFirstInput: true,
    }).then(function(modal){
      $scope.modalTimeVisitante = modal;
    });

    $ionicModal.fromTemplateUrl('templates/jogos/selecionarLocal.html', {
      scope: $scope,
      focusFirstInput: true,
    }).then(function(modal){
      $scope.modalLocal = modal;
    });

    $ionicModal.fromTemplateUrl('templates/jogos/cadastrarTimeAdversario.html', {
      scope: $scope,
    }).then(function(modal){
      $scope.modalCadastrarTimeMandante = modal;
    });

    $ionicModal.fromTemplateUrl('templates/jogos/cadastrarTimeAdversario.html', {
      scope: $scope,
    }).then(function(modal){
      $scope.modalCadastrarTimeVisitante = modal;
    });

    // $scope.jogo.mandante = {
    //   _id: AuthService.getTime()
    //   // nome: mandante.nome,
    //   // escudo: mandante.escudo
    // };

    $scope.exibirModalTime = function(tipoTime){
      modalTimeAberto = tipoTime;
      if(modalTimeAberto == 'mandante'){
        $scope.modalTime = $scope.modalTimeMandante;
        $scope.modalCadastrarTime = $scope.modalCadastrarTimeMandante;
      } else {
        $scope.modalTime = $scope.modalTimeVisitante;
        $scope.modalCadastrarTime = $scope.modalCadastrarTimeVisitante;
      }
      $scope.modalTime.show();
    }

    $scope.timeSelecionado = function(time){
      $scope.jogo[modalTimeAberto] = time;
      if(!$scope.jogo.timeQueSolicitouArbitragem && modalTimeAberto == 'mandante'){
        $scope.jogo.timeQueSolicitouArbitragem = time._id;
      } else if ($scope.jogo.timeQueSolicitouArbitragem) {

      }
      $scope.modalTime.hide();
    }

    $scope.enviar = function(){
      var time = $scope.jogo.timeAdversario;
      DataService.salvarTimeLiga(time, $stateParams.id).then(function(timeCadastrado){
        time._id = timeCadastrado.id;
        $scope.modalCadastrarTime.hide();
        $scope.timeSelecionado(time);
      });
    }

    $scope.cadastrarTime = function(nomeTime){
      $scope.jogo.timeAdversario = {nome: nomeTime};
      $scope.modalCadastrarTime.show();
      // $scope.timeSelecionado({nome:nomeTime});
    }

    $scope.localSelecionado = function(local){
      $scope.jogo.local = local;
      $scope.modalLocal.hide();
    }

    $scope.capturarFoto = function(){
      CameraService.getPicture().then(function(imagePath){
        $scope.jogo.timeAdversario.escudo = imagePath;
        $scope.$apply();
      });
    };

    $scope.cancelar = function(){
      if($ionicHistory.backView()){
        $ionicHistory.goBack();
      } else {
        $state.go('abasInicio.meuTime');
      }
    }

    $scope.salvarJogo = function(){
      var dataHora = moment($scope.jogo.data);
      dataHora.hour($scope.getHoraJogo()).minutes($scope.getMinutosJogo());

      var jogo = {
        local: $scope.jogo.local,
        dataHora: moment.tz(dataHora.format('YYYY-MM-DD HH:mm'), $scope.jogo.local.cidade.timezone),
        mandante: $scope.jogo.mandante,
        visitante: $scope.jogo.visitante,
        encerrado: false,
        timeQueSolicitouArbitragem: timeQueSolicitouArbitragem()
      }
      var agora = moment.tz($scope.jogo.local.cidade.timezone);
      DataService.salvarJogoLiga(jogo, $stateParams.id).then(function(retorno){
        jogo._id = retorno.id;
        $ionicHistory.nextViewOptions({
          // disableAnimate: true,
          disableBack: true
        });
        if(agora.isAfter(jogo.dataHora)){ //Se já passou a hora do jogo
          AuthService.redirectClean('informarPlacar', null, {id: jogo._id}).then(configurarJogoVazio);
        } else if (retorno.ligasDisponiveis && retorno.ligasDisponiveis.length) {
          AuthService.redirectClean('solicitarArbitragem', null, {id: jogo._id, ligas: retorno.ligasDisponiveis}).then(configurarJogoVazio);
        } else { //não tem liga para solicitar arbitragem
          AuthService.redirectClean('jogo', null, {id: jogo._id}).then(configurarJogoVazio);
        }
      });
    }

    function timeQueSolicitouArbitragem(){
      var tipoTime = $scope.jogo.tipoTimeSolicitante;
      return _.get($scope.jogo, [tipoTime, '_id']);
    }


    $scope.getHoraJogo = function(){
      if(typeof $scope.jogo.hora == "string") {
        return $scope.jogo.hora.split(':')[0];
      } else {
        return $scope.jogo.hora.getHours();
      }
    }

    $scope.getMinutosJogo = function(){
      if(typeof $scope.jogo.hora == "string") {
        return $scope.jogo.hora.split(':')[1];
      } else {
        return $scope.jogo.hora.getMinutes();
      }
    }
    
}])
