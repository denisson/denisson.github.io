angular.module('app.directives')
.directive('jogArbitragem', ['$ionicPopup', 'AuthService', 'DataService', function($ionicPopup, AuthService, DataService){
  return {
  	restrict: 'E',
  	scope: {jogo: '=', designacao: '='},
    templateUrl: 'templates/directives/jog-arbitragem.html',
    controller: function($scope, $state){

      // $scope.arbitragem = $scope.jogo.arbitragem;
      $scope.designacao = _.get($scope, 'jogo.arbitragem.designacao');


      $scope.editavel = function(perfil){
        if(perfil == 'arbitro'){
          return $scope.jogo 
            && AuthService.getArbitro() 
            && _.get($scope.jogo, 'arbitragem.designacao.arbitro._id') === AuthService.getArbitro()
            ;        
        } else if(perfil == 'liga'){
          return $scope.jogo 
            && AuthService.getLiga() 
            && _.get($scope.jogo, 'arbitragem.solicitacao.liga.id') === AuthService.getLiga();
        }
      }

      $scope.verLiga = function(){
        $state.go('liga', {id: $scope.jogo.arbitragem.solicitacao.liga._id});
      }

      $scope.verRanking = function(){
        $state.go('liga_ranking', {id: $scope.jogo.ranking._id});
      }

      $scope.permissaoArbitragem = function(){
        return $scope.editavel('liga') || $scope.editavel('arbitro');
      }

      $scope.temArbitragem = function(){
        return $scope.jogo.temSolicitacaoArbitragem;
      }

      $scope.confirmarArbitragem = function(){
        DataService.confirmarArbitragem($scope.jogo._id).then(function(resposta){
          $scope.designacao.dataHoraResposta = resposta.dataHoraResposta;
          $scope.designacao.resposta = true;
          $scope.jogo.arbitragem.arbitro = $scope.designacao.arbitro;
        });
      }

      $scope.rejeitarArbitragem = function(){
        DataService.rejeitarArbitragem($scope.jogo._id).then(function(){
          $scope.designacao.resposta = false;
          $state.go('abasInicio.meuPerfil');
        });
      }

      $scope.faltaConfirmarArbitragem = function(){
        return $scope.editavel('arbitro') && !$scope.designacao.dataHoraResposta;
      }

      $scope.arbitragemConfirmada = function(){
        return $scope.editavel('arbitro') && $scope.designacao.resposta;
      }

      $scope.faltaDesignarArbitro = function(){
        return $scope.editavel('liga') && !$scope.designacao; 
      }

      $scope.mensagemAoSolicitarArbitragem = function(){
        if($scope.jogo.aguardandoPlacar){
          return 'Aguardando árbitro informar o placar do jogo';
        } else if ($scope.designacao && $scope.designacao.arbitro) {
          return 'Um árbitro já foi escalado. Aguardando confirmação.';
        } else {
          return `Um árbitro será escalado ${$scope.diasAntesJogo()} antes da partida.`;
        }
      }

      $scope.diasAntesJogo = function(){
        var diasAntes = $scope.jogo.arbitragem.solicitacao.liga.arbitragem.timeline.designacaoDiasAntes;
        if(moment($scope.jogo.dataHora).diff(moment(), 'd') < diasAntes) {
          return '';
        }
        return diasAntes + (diasAntes==1 ? ' dia' : ' dias');
      }

      $scope.formatarData = function(jogo, campo){
        var timezone = _.get(jogo, 'local.cidade.timezone', 'America/Fortaleza'); //caso não tenha no cadastro do jogo, utilizar o timezone compatível com Maceió
         return moment(_.get(jogo, campo)).tz(timezone).format('DD/MM/YYYY');
      }

      $scope.formatarHora = function(jogo, campo){
        var timezone = _.get(jogo, 'local.cidade.timezone', 'America/Fortaleza'); //caso não tenha no cadastro do jogo, utilizar o timezone compatível com Maceió
        return moment(_.get(jogo, campo)).tz(timezone).format('HH:mm');
      }

      $scope.alterarDesignacao = function(){
        $scope.alterandoDesignacao = true;
      }

      $scope.cancelarAlteracaoDesignacao = function(){
        $scope.alterandoDesignacao = false;
      }

      $scope.aposDesignarArbitro = function(arbitroDesignado){
        $scope.designacao = {arbitro: arbitroDesignado};
        $scope.alterandoDesignacao = false;
      }

      $scope.cancelarArbitragem = function(){
        $scope.cancelandoArbitragem = true;
      }

      $scope.naoCancelarArbitragem = function(){
        $scope.cancelandoArbitragem = false;
      }
      
      $scope.salvarCancelarArbitragem = function(){
        DataService.cancelarArbitroJogo($scope.jogo._id, $scope.designacao.motivoCancelamento).then(function(resposta){
          $scope.designacao.dataHoraCancelamento = resposta.dataHoraCancelamento;
          $scope.cancelandoArbitragem = false;
        });
      }

      $scope.podeCancelarArbitragem = function(){
        return $scope.editavel('arbitro') && $scope.jogo.temSolicitacaoArbitragem && !$scope.cancelandoArbitragem && !$scope.designacao.dataHoraCancelamento && !$scope.jogo.aguardandoPlacar && !$scope.jogo.encerrado;
      }


      $scope.podeCancelarSolicitacaoArbitragem = function(){
        return $scope.jogo.temSolicitacaoArbitragem && ($scope.jogo.arbitragem.solicitacao.time._id == AuthService.getTime()) && !$scope.permissaoArbitragem() && !$scope.jogo.encerrado && !$scope.jogo.aguardandoPlacar;
      }

      $scope.cancelarSolicitacaoArbitragem = function(){

        var confirmPopup = $ionicPopup.confirm({
          title: 'Cancelar arbitragem',
          content: 'Deseja realmente cancelar a arbitragem solicitada?',
          cancelText: 'Não',
          okText: 'Confirmar'
        });
       confirmPopup.then(function(res) {
         if(res) {
            DataService.cancelarSolicitacaoArbitragem($scope.jogo._id).then(function(retorno){
              $scope.jogo.temSolicitacaoArbitragem = false;
              $scope.jogo.arbitragem.solicitacao.dataHoraCancelamento = retorno.dataHoraCancelamento;
              $scope.jogo.arbitragem.arbitro = null;
              $scope.jogo.ranking = null;
            });
         }
       });

      }

    }
  }
}])
.directive('jogAgendaSemana', ['DataService', function(DataService){
  return {
    restrict: 'E',
    scope: {arbitro: '='},
    templateUrl: 'templates/directives/jog-agenda-semana.html',
    controller: function($scope, $state){
      $scope.numSemana = 0;

      $scope.atualizarAgenda = function(incNumSemana){
        $scope.numSemana += incNumSemana;

        var diaReferencia = moment().add(7 * $scope.numSemana, 'd');
        var inicioSemana = diaReferencia.clone().startOf('week');
        var fimSemana = diaReferencia.clone().endOf('week');

        $scope.datasSemana = montarSemana(inicioSemana);
        $scope.periodo = {
          inicio: inicioSemana,
          fim: fimSemana,
        }
        DataService.arbitroAgenda($scope.arbitro._id, inicioSemana.format('YYYY-MM-DD'), fimSemana.format('YYYY-MM-DD')).then(montarAgendaSemana);
      }

      $scope.atualizarAgenda(0);

      function montarAgendaSemana(jogos){
        
        $scope.jogosPorHorario = null;
        if(jogos.length){
          var jogosPorHorario = _.groupBy(jogos, function(jogo){
            var timezone = _.get(jogo, 'local.cidade.timezone', 'America/Fortaleza'); //caso não tenha no cadastro do jogo, utilizar o timezone compatível com Maceió
            return moment(jogo.dataHora).tz(timezone).format('HH:mm');
          });
          _.forEach(jogosPorHorario, function(jogos, horario) {
            jogosPorHorario[horario] = _.groupBy(jogos, function(jogo) {
              var timezone = _.get(jogo, 'local.cidade.timezone', 'America/Fortaleza'); //caso não tenha no cadastro do jogo, utilizar o timezone compatível com Maceió
              return moment(jogo.dataHora).tz(timezone).format('d');
            });
          });
          jogosPorHorario = _(jogosPorHorario).toPairs().sortBy(0).fromPairs().value();
          $scope.jogosPorHorario = jogosPorHorario;
        }
      }

      $scope.diaSemanaHoje = function(numDia){
        return ($scope.numSemana == 0) && (moment().format('d') == numDia);
      }

      $scope.verJogo = function(jogo){
        $state.go('jogo', {id: jogo._id});
      }

      $scope.mesAnoDaSemana = function(data){
        if($scope.numSemana == 0) { //Caso seja a semana corrente, pegar o mês corrente. Se pegar pela data início, pode acabar retornando o mês anterior
          return moment().format('MMMM/YYYY');
        } else {
          return $scope.periodo.inicio.format('MMMM/YYYY');  
        }
      }

      function montarSemana(dataInicio){
        var datasSemana = [dataInicio.date()];
        for (var i = 1; i < 7; i++) {
          datasSemana.push(dataInicio.clone().add(i, 'd').date());
        }
        return datasSemana;
      }

    }
  };
}])
.directive('informarArbitro', ['DataService', '$ionicModal', function(DataService, $ionicModal){
  return {
    restrict: 'E',
    scope: {jogo: '=', podeCancelar: '@', aoCancelar: '&', aoSalvar: '&'},
    templateUrl: 'templates/directives/informar-arbitro.html',
    controller: function($scope, $state){
    
      $scope.designarArbitro = function(){
        DataService.designarArbitro($scope.jogo._id, $scope.arbitroDesignado._id).then(function(){
          $scope.jogo.arbitragem.designacao = {arbitro: $scope.arbitroDesignado};
          $scope.jogo.precisaInformarArbitro = false;
          // $scope.alterandoDesignacao = false;
          $scope.aoSalvar({arbitro: $scope.arbitroDesignado});
        });
      }

      $ionicModal.fromTemplateUrl('templates/arbitros/selecionarArbitro.html', {
        scope: $scope,
        focusFirstInput: true,
      }).then(function(modal){
        $scope.modalArbitro = modal;
      });

      $scope.arbitroSelecionado = function(arbitro){
        $scope.arbitroDesignado = arbitro;
        $scope.modalArbitro.hide();
      }

      $scope.cancelar = function(){
        $scope.aoCancelar();
      }

    }
  };
}])
.directive('verArbitro', ['$ionicModal', 'DataService', '$state', function($ionicModal, DataService, $state){
  return {
    restrict: 'A',
    // scope: {mostrarBr: '=', temTime: '=', temJogos: '='},
    link: function(scope, el, attr) {

      $ionicModal.fromTemplateUrl('templates/directives/arbitroModal.html', {
        scope: scope,
      }).then(function(modal){
        scope.modal = modal;
      });

      scope.verLiga = function(liga){
        scope.modal.hide();
        $state.go("liga", {id:liga._id});
      }

      el.bind('click', function() {
        scope.arbitro = scope.$eval(attr.verArbitro);
        scope.liga = scope.$eval(attr.liga);
        scope.mostrarTelefone = scope.$eval(attr.mostrarTelefone);
        scope.modal.show();
      });
    }
  };
}])
.directive('jogArbitroHorarios', ['DataService', '$ionicModal', function(DataService, $ionicModal){
  return {
    restrict: 'E',
    scope: {arbitro: '=', editavel: '@', somenteLeitura: '@', onChange: '&'},
    templateUrl: 'templates/directives/jog-arbitro-horarios.html',
    controller: function($scope, $state){
      // $scope.editavel = scope.$eval($scope.editavel);

      $ionicModal.fromTemplateUrl('templates/arbitros/adicionarHorario.html', {
        scope: $scope,
        animation: 'no-animation',
        focusFirstInput: true,
      }).then(function(modal){
        $scope.modalHorario = modal;
      });


      $scope.horariosDesteDia = function(dia, turno){
        return _.filter($scope.arbitro.horariosDisponiveis, {diaSemana: dia});
      }

      $scope.abrirModalHorario = function(dia){
        $scope.horarioNovo = {diaSemana: dia, horaInicio: '00:00', horaFim: '23:59'};
        $scope.horarioEditando = null;
        $scope.modalHorario.show();
      }

      $scope.editarHorario = function(horario){
        if($scope.editavel){
          $scope.horarioEditando = horario;
          $scope.horarioNovo = horario;
          $scope.modalHorario.show();
        } else if(!$scope.somenteLeitura) {
          $state.go('editarHorariosArbitro', {arbitro: $scope.arbitro});
        }
      }

      $scope.excluirHorario = function(){
        $scope.arbitro.horariosDisponiveis = _.reject($scope.arbitro.horariosDisponiveis, $scope.horarioEditando);
        $scope.onChange({horariosDisponiveis: $scope.arbitro.horariosDisponiveis});
        $scope.modalHorario.hide();
      }

      $scope.adicionarHorario = function(horario){
        if($scope.horarioEditando){
          $scope.arbitro.horariosDisponiveis = _.reject($scope.arbitro.horariosDisponiveis, $scope.horarioEditando);  
        }
        $scope.modalHorario.hide();
        $scope.arbitro.horariosDisponiveis.push(horario);
        $scope.onChange({horariosDisponiveis: $scope.arbitro.horariosDisponiveis});
      }

      var diasExtenso = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

      $scope.diaExtenso = function(num){
        return diasExtenso[num];
      }

    }
  };
}])
