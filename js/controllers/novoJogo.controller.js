angular
  .module('app.controllers')
  .controller('novoJogoController', ['$scope', '$state', 'DataService', '$ionicModal', 'AuthService', '$stateParams', 'CameraService', '$ionicHistory', '$ionicPopup', function ($scope, $state, DataService, $ionicModal, AuthService, $stateParams, CameraService, $ionicHistory,  $ionicPopup) {

    $scope.$on('$ionicView.enter', function(){
      $scope.inicializar();
    });

    $scope.selecionarCompeticaoAmistoso = function(){
      $scope.jogo.competicao = {nome: 'Amistoso', amistoso: true};
    }

    function configurarJogoVazio(){
      var perfil = AuthService.getPerfilFiltro();
      var modos = _.get(perfil, 'modos', []);
      var modo = modos.length == 1 ? modos[0] : undefined;
      $scope.jogo = {
        mandante: {
          _id: AuthService.getTime(),
          nome: AuthService.getPerfilAtivo().nome,
          escudo: AuthService.getPerfilAtivo().escudo,
        },
        mandanteNaEsquerda: true,
        esporte: perfil.esporte,
        efootball: {plataforma: perfil.plataforma, modo: modo}
      };
      $scope.selecionarCompeticaoAmistoso();
    };

    function exibirDadosJogo(jogo){
      // jogo.visitante.escudo = ''; //limpa o escudo para, na hora de salvar, não mandar o escudo novamente.
      $scope.jogo = jogo;
      // $scope.jogo.timeAdversario = _.clone(jogo.visitante);
      $scope.jogo.data = moment(jogo.dataHora).toDate();
      $scope.jogo.hora = moment(jogo.dataHora).format('HH:mm');
      $scope.jogo.efootball = jogo.efootball || {};
      if(!jogo.competicao) $scope.selecionarCompeticaoAmistoso();
    };

    $scope.inicializar = function(){
      if(editando()){
        if($stateParams.jogo) {
          exibirDadosJogo($stateParams.jogo);
          inicializarModais();
        } else {
          DataService.jogo($stateParams.id).then(function(jogo){
            exibirDadosJogo(jogo);
            inicializarModais();
          });
        }
        $scope.titulo = 'Alterar Jogo';
        $scope.labelBotao = 'Salvar';
      } else {
        configurarJogoVazio();
        inicializarModais();
        $scope.titulo = 'Cadastrar Jogo';
        $scope.labelBotao = 'Salvar';
      }
    }
  
    function editando(){
      return $stateParams.id;
    }
    
    $scope.podeSalvar = function(){
        return  _.get($scope.jogo, 'visitante.nome') &&
                _.get($scope.jogo, 'data') &&
                (_.get($scope.jogo, 'hora') != undefined) && 
                (_.get($scope.jogo, 'local.nome') || _.get($scope.jogo, 'efootball.modo'));
    }

    function inicializarModais(){

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

      $ionicModal.fromTemplateUrl('templates/jogos/cadastrarCompeticao.html', {
        scope: $scope,
      }).then(function(modal){
        $scope.modalCadastrarCompeticao = modal;
      });

      $ionicModal.fromTemplateUrl('templates/jogos/selecionarCompeticao.html', {
        scope: $scope,
        focusFirstInput: true,
      }).then(function(modal){
        $scope.modalCompeticao = modal;
      });

      $ionicModal.fromTemplateUrl('templates/jogos/selecionarModo.html', {
        scope: $scope,
      }).then(function(modal){
        $scope.modalModo = modal;
      });
    }


    $scope.timeSelecionado = function(time){
      $scope.jogo.visitante = time;
      $scope.jogo = _.clone($scope.jogo);
      $scope.modalTime.hide();
    }

    $scope.cadastrarTime = function(nomeTime){
      $scope.jogo.visitante = {nome: nomeTime};
      $scope.modalCadastrarTime.show();
      // $scope.timeSelecionado({nome:nomeTime});
    }

    $scope.cadastrarCompeticao = function(nome){
      var regiao = _.get(AuthService.getPerfilFiltro(), 'regiao');
      $scope.jogo.novaCompeticao = {nome: nome, modo: $scope.jogo.efootball.modo, esporte: $scope.jogo.esporte, plataforma: $scope.jogo.efootball.plataforma, regiao: regiao};
      $scope.modalCadastrarCompeticao.show();
      // $scope.timeSelecionado({nome:nomeTime});
    }
    
    $scope.localSelecionado = function(local){
      $scope.jogo.local = local;
      $scope.modalLocal.hide();
    }

    $scope.competicaoSelecionada = function(competicao){
      $scope.jogo.competicao = competicao;
      $scope.jogo.efootball.modo = competicao.modo;
      $scope.modalCompeticao.hide();
    }

    $scope.capturarFoto = function(){
      CameraService.getPicture().then(function(imagePath){
        $scope.jogo.visitante.escudo = imagePath;
        $scope.escudoAlterado = true;
        $scope.$apply();
      });
    };

    $scope.enviar = function(){
      $scope.modalCadastrarTime.hide();
      $scope.modalTime.hide();
    }

    function competicaoEstaCompleta(){
      var competicao = $scope.jogo.novaCompeticao;
      if(!_.get(competicao, 'nome')){
        $ionicPopup.alert({
          title: 'Cadastro incompleto',
          content: 'Preencha todos os campos para concluir o cadastro!'
        });
        return false;
      } else {
        return true;
      }
    }

    $scope.salvarCompeticao = function(){
      if(competicaoEstaCompleta()){
        DataService.salvarCompeticao($scope.jogo.novaCompeticao).then(function(competicaoSalva){
            $scope.jogo.novaCompeticao._id = competicaoSalva.id;
            $scope.jogo.competicao = $scope.jogo.novaCompeticao;
            $scope.modalCadastrarCompeticao.hide();
            $scope.modalCompeticao.hide();
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

    $scope.atualizarDatahora = function(){
      if (!$scope.jogo.data || !$scope.jogo.hora) return;
      var dataHora = moment($scope.jogo.data);
      dataHora.hour($scope.getHoraJogo()).minutes($scope.getMinutosJogo());
      
      var timezone = _.get($scope.jogo, 'local.cidade.timezone', 'America/Fortaleza');
      $scope.jogo.dataHora =  moment.tz(dataHora.format('YYYY-MM-DD HH:mm'), timezone);
    }

    $scope.salvarJogo = function(){
      var dataHora = moment($scope.jogo.data);
      dataHora.hour($scope.getHoraJogo()).minutes($scope.getMinutosJogo());
      
      var timezone = _.get($scope.jogo, 'local.cidade.timezone', 'America/Fortaleza');
      var jogo = {
        _id: $scope.jogo._id,
        efootball: $scope.jogo.efootball,
        local: $scope.jogo.local,
        competicao: $scope.jogo.competicao,
        dataHora: moment.tz(dataHora.format('YYYY-MM-DD HH:mm'), timezone),
        visitante: $scope.jogo.visitante,
        mandante: $scope.jogo.mandante,
        mandanteNaEsquerda: $scope.jogo.mandanteNaEsquerda,
        encerrado: $scope.jogo.encerrado ? true : false
      }
      var agora = moment.tz(timezone);
      if(!validarDataHora(jogo, agora)) return;
      var escudoVisitante = jogo.visitante.id || !$scope.escudoAlterado ? null : jogo.visitante.escudo; //só envia o escudo se for de um visitante sem cadastro e não estiver editando. Para não enviar novamente o mesmo escudo
      DataService.salvarJogo(jogo, escudoVisitante).then(function(retorno){
        jogo._id = retorno.id;
        $ionicHistory.nextViewOptions({
          // disableAnimate: true,
          disableBack: true
        });
        if(agora.isAfter(jogo.dataHora) && !jogo.encerrado){ //Se já passou a hora do jogo
          AuthService.redirectClean('informarPlacar', null, {id: jogo._id}).then(configurarJogoVazio);
        } else if (retorno.ligasDisponiveis && retorno.ligasDisponiveis.length) {
          AuthService.redirectClean('solicitarArbitragem', null, {id: jogo._id, ligas: retorno.ligasDisponiveis}).then(configurarJogoVazio);
        } else { //não tem liga para solicitar arbitragem
          if(AuthService.isUsuarioPro()){
            AuthService.redirectClean('abasInicio.meuTime', null, {}).then(configurarJogoVazio);
          } else {
            AuthService.redirectClean('interstitial', null, {rota: 'abasInicio.meuTime'}).then(configurarJogoVazio);  
          }          
        }
      });
    }

    function validarDataHora(jogo, agora){
      if(jogo.dataHora.isAfter(agora) && jogo.encerrado){ //Se já passou a hora do jogo e ele já está encerrado
        $ionicPopup.alert({
          title: 'Jogo já foi encerrado!',
          content: 'Não é possível informar uma data futura para o jogo que já tem placar informado.'
        });
        return false;
      } 
      return true;
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

    $scope.fifa = function(){
      return _.get($scope.jogo, 'esporte.chave') == 'FIFA';
    }

    $scope.clicouEscudoTime =function(tipoTime) {
      if (tipoTime === 'visitante') {
        $scope.modalTime.show();
      }
    }
    
}])
