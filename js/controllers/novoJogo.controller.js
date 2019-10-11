angular
  .module('app.controllers')
  .controller('novoJogoController', ['$scope', '$state', 'DataService', '$ionicModal', 'AuthService', '$rootScope', 'CameraService', '$ionicHistory', '$ionicPopup', function ($scope, $state, DataService, $ionicModal, AuthService, $rootScope, CameraService, $ionicHistory,  $ionicPopup) {
    var fuseCidades, fuseEstados;

    DataService.estados().then(function(estados){
      $scope.estados = estados;
    });

    $scope.cidades = [];

    function configurarJogoVazio(){
      $scope.jogo = {
        mandante: {}
      };
    };
    configurarJogoVazio();

    $scope.podeSalvar = function(){
      try{
        return $scope.jogo.timeAdversario.nome && $scope.jogo.data && ($scope.jogo.hora != undefined) && $scope.jogo.local.nome;
      } catch (exception){
        return false;
      }
    }

    $ionicModal.fromTemplateUrl('templates/jogos/selecionarTime.html', {
      scope: $scope,
      focusFirstInput: true,
    }).then(function(modal){
      $scope.modalTime = modal;
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
      $scope.modalCadastrarTime = modal;
    });

    $ionicModal.fromTemplateUrl('templates/jogos/cadastrarLocal.html', {
      scope: $scope,
    }).then(function(modal){
      $scope.modalCadastrarLocal = modal;
    });
    $ionicModal.fromTemplateUrl('templates/jogos/selecionarEstado.html', {
      scope: $scope,
      focusFirstInput: true,
    }).then(function(modal){
      $scope.modalEstado = modal;
    });

    $ionicModal.fromTemplateUrl('templates/jogos/selecionarCidade.html', {
      scope: $scope,
      focusFirstInput: true,
    }).then(function(modal){
      $scope.modalCidade = modal;
    });

    $scope.jogo.mandante = {
      _id: AuthService.getTime()
      // nome: mandante.nome,
      // escudo: mandante.escudo
    };

    $scope.timeSelecionado = function(time){
      $scope.jogo.timeAdversario = time;
      $scope.modalTime.hide();
    }

    $scope.cadastrarTime = function(nomeTime){
      $scope.jogo.timeAdversario = {nome: nomeTime};
      $scope.modalCadastrarTime.show();
      // $scope.timeSelecionado({nome:nomeTime});
    }

    $scope.cadastrarLocal = function(nomeLocal){
      $scope.jogo.novoLocal = {nome: nomeLocal, cidade: AuthService.getCidade()};
      $scope.modalCadastrarLocal.show();
      // $scope.timeSelecionado({nome:nomeTime});
    }

    $scope.localSelecionado = function(local){
      $scope.jogo.local = local;
      $scope.modalLocal.hide();
    }

    $scope.estadoSelecionado = function(estado){
      $scope.jogo.novoLocal.estado = estado;
      $scope.capital = estado.capital;
      $scope.cidades = [];
      DataService.cidadesDaUf(estado.uf).then(function(cidades){
        $scope.cidades = cidades;
      });
      $scope.modalEstado.hide();
      $scope.modalCidade.show();
    }

    $scope.cidadeSelecionada = function(cidade){
      $scope.jogo.novoLocal.cidade = cidade;
      $scope.modalCidade.hide();
    }


    $scope.capturarFoto = function(){
      CameraService.getPicture().then(function(imagePath){
        $scope.jogo.timeAdversario.escudo = imagePath;
        $scope.$apply();
      });
    };

    $scope.enviar = function(){
      $scope.modalCadastrarTime.hide();
      $scope.modalTime.hide();
    }

    function localEstaCompleto(){
      var local = $scope.jogo.novoLocal;
      if(!_.get(local, 'nome') || !_.get(local, 'cidade._id') || !_.get(local, 'tipo') || !_.get(local, 'numJogadores')){
        $ionicPopup.alert({
          title: 'Cadastro incompleto',
          content: 'Preencha todos os campos para concluir o cadastro!'
        });
        return false;
      } else {
        return true;
      }
    }

    $scope.salvarLocal = function(){
      if(localEstaCompleto()){
        $scope.jogo.novoLocal.createdBy = AuthService.getUsuarioId();
        DataService.salvarLocalJogo($scope.jogo.novoLocal).then(function(localSalvo){
            $scope.jogo.novoLocal._id = localSalvo.id;
            $scope.jogo.local = $scope.jogo.novoLocal;
            $scope.modalCadastrarLocal.hide();
            $scope.modalLocal.hide();
        });
      }
    }

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
        visitante: $scope.jogo.timeAdversario,
        mandante: $scope.jogo.mandante,
        encerrado: false
      }
      var agora = moment.tz($scope.jogo.local.cidade.timezone);
      DataService.salvarJogo(jogo).then(function(retorno){
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
          AuthService.redirectClean('abasInicio.meuTime').then(configurarJogoVazio);
        }
      });
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
