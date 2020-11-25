angular
  .module('app.controllers')
  .controller('timeController', 
  ['$rootScope', '$scope', '$state', '$stateParams', 'DataService', 'AuthService', '$ionicActionSheet', '$ionicHistory', '$ionicPopup', '$ionicModal' , 'config', '$jgModalAssinatura', 
  function ($rootScope, $scope, $state, $stateParams, DataService, AuthService, $ionicActionSheet,$ionicHistory, $ionicPopup, $ionicModal, config, $jgModalAssinatura) {
    var diasExtenso = ['','Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    $scope.jogadoresOrdem = 'ARTILHARIA';
    $rootScope.$emit('loading.init');
    $scope.temporada = $stateParams.temporada;

    $scope.usuarioPro = function(){
      return AuthService.isUsuarioPro();
    }

    $scope.timePro = function(){
      return AuthService.isUsuarioPro() && $scope.time.pro;
    }

    function mostrarAlerta(mensagem){
      $ionicPopup.alert({
        title: 'Ops!',
        content: mensagem
      }).then(function(){
        // $ionicHistory.goBack();
      });
    }

    $scope.carregarHistoricoConfrontos = function(){
      var idTimeA = AuthService.getTime();
      var idTimeB = $stateParams.id;
      if(idTimeA && idTimeB && idTimeA != idTimeB){
        DataService.jogoHistoricoConfrontos(idTimeA, idTimeB).then(function(result){
          $scope.historicoConfrontos = result;
        });
      }
    }

    $scope.carregarHistoricoConfrontos();

    $scope.verHistoricoConfrontos = function(){
      $jgModalAssinatura.confirmarAssinaturaTime('graficos', AuthService.getTime(), AuthService.isTimePro()).then(function(){
        var idTimeA = AuthService.getTime();
        var idTimeB = $stateParams.id;
        $state.go('times_confrontos', {idTimeA: idTimeA, idTimeB: idTimeB});
      });
    }

    $scope.irParaWhatsapp = function(numeroTelefone){
      window.open('https://api.whatsapp.com/send?phone=' + numeroTelefone, '_system'); 
      return false;
    }

    function checarCidade(){
      //não está cadastrada a cidade e não foi alertado ainda
      if(!AuthService.isPerfilEfootball() && !$scope.time.cidade && $scope.editavel() && !window.localStorage.getItem('alerta_cidade')){
        window.localStorage.setItem('alerta_cidade', true);
        $ionicPopup.confirm({
          title: 'Informar cidade',
          content: '<div style="text-align: center">Aperte OK para informar a cidade do seu time. É rápido e você poderá ter uma visão regionalizada do Jogueiros!<br> Além disso, ficará mais fácil para outros times te encontrarem.</div>'
        }).then(function(res) {
          if(res) {
            $scope.editarTime();
         }
       });
      }
    }

    $scope.temporadaAtiva = function(temporada){
      return temporada == $stateParams.temporada;
    }

    $scope.compartilharLink = function(time){
      var url = config.URL_SITE + '#/time/'+time._id + '/';
      if (window.plugins) {
        window.plugins.socialsharing.share(time.nome + ' está no Jogueiros FC! Você pode acompanhar tudo pelo site ou pelo aplicativo! \n' + url);
      } else {
        window.open(url);
      }
      return false;
    }

    $scope.irParaUrl = function(url){
      window.open(url, '_system');
      return false;
    }

    $scope.irParaInstagram = function(time){
      $scope.irParaUrl('https://www.instagram.com/' + time.instagram);
    }

    $scope.diaExtenso = function(num){
      return diasExtenso[num];
    }

    $scope.atualizar = function(){
      $scope.temporada = $stateParams.temporada = $stateParams.temporada || moment().year();
      $scope.timeId = $stateParams.id || AuthService.getTime();
      
      DataService.timeJogos($scope.timeId, $stateParams.temporada).then(function(time){
        if(!time){
            mostrarAlerta('Esse time não existe mais');
            AuthService.logout();
            return;
        }

        // if(time.jogos.encerrados && !$scope.exibindoJogosAnteriores){
        //   $scope.jogosAnteriores = time.jogos.encerradossplice(0, 3);
        //   var primeirosJogos = $scope.jogosAnteriores.splice(0, 3);
          time.jogos.encerrados = time.jogos.encerrados.splice(0, 3);
          time.jogos.proximos = time.jogos.proximos.splice(0, 3);
        // }

        $scope.time = time;

        $scope.paginacao = {
          QTD_POR_PAGINA: 10,
          proximos: {
            page: 1,
            maisJogos:  time.jogos.maisJogos.proximos
          },
          encerrados: {
            page: 1,
            maisJogos: time.jogos.maisJogos.encerrados
          }
        };

        // $scope.setTemporada();
        $scope.ordenarPor($scope.jogadoresOrdem);
        $scope.$broadcast('scroll.refreshComplete');
        $rootScope.$emit('loading.finish');
        checarCidade();
      }).catch(function(){
          //Checar quando falhar a consulta ao banco e exibir um erro
          mostrarAlerta('Não foi possível carregar as informações do time');
      });

    }

    $scope.$on('jogadorAdicionado', function(events, jogador){
      $scope.time.jogadores.push(jogador);
    });

    $scope.$on('$ionicView.enter', function(){
      DataService.blockPopup();
      $scope.atualizar();
    });
// $scope.atualizar();
    $scope.ordenarPor = function(ordem){
      var orderFunction;
      switch(ordem){
        case 'ARTILHARIA':
          orderFunction = function(a, b){
            return ($scope.golsJogadorNaTemporada(b) - $scope.golsJogadorNaTemporada(a)) || ($scope.assistJogadorNaTemporada(b) - $scope.assistJogadorNaTemporada(a)) || ($scope.jogosJogadorNaTemporada(b) - $scope.jogosJogadorNaTemporada(a)) ||  a.nome.localeCompare(b.nome);
          }
        break;
        case 'ASSISTENCIAS':
          orderFunction = function(a, b){
            return $scope.assistJogadorNaTemporada(b) - $scope.assistJogadorNaTemporada(a) || ($scope.golsJogadorNaTemporada(b) - $scope.golsJogadorNaTemporada(a)) || ($scope.jogosJogadorNaTemporada(b) - $scope.jogosJogadorNaTemporada(a)) || a.nome.localeCompare(b.nome);
          }
        break;
        case 'JOGOS':
          orderFunction = function(a, b){
            return $scope.jogosJogadorNaTemporada(b) - $scope.jogosJogadorNaTemporada(a) || ($scope.golsJogadorNaTemporada(b) - $scope.golsJogadorNaTemporada(a)) || ($scope.assistJogadorNaTemporada(b) - $scope.assistJogadorNaTemporada(a)) || a.nome.localeCompare(b.nome);
          }
        break;
        case 'POSICAO':
          orderFunction = function(a, b){
            return a.posicao.localeCompare(b.posicao) || ($scope.golsJogadorNaTemporada(b) - $scope.golsJogadorNaTemporada(a)) || ($scope.assistJogadorNaTemporada(b) - $scope.assistJogadorNaTemporada(a)) || ($scope.jogosJogadorNaTemporada(b) - $scope.jogosJogadorNaTemporada(a)) ||  a.nome.localeCompare(b.nome); //Se for a mesma posição, ordena pelo nome
          }
        break;
        case 'NOME':
          orderFunction = function(a, b){
            return a.nome.localeCompare(b.nome);
          }
        break;
      }
      $scope.jogadoresOrdem = ordem;
      $scope.time.jogadores.sort(orderFunction);
    }

    $scope.golsJogadorNaTemporada = function(jogador){
      return attrJogadorNaTemporada('gols', jogador);
    }

    $scope.assistJogadorNaTemporada = function(jogador){
      return attrJogadorNaTemporada('assistencias', jogador);
    }

    $scope.jogosJogadorNaTemporada = function(jogador){
      return attrJogadorNaTemporada('jogos', jogador);
    }

    function attrJogadorNaTemporada(attr, jogador) {
      if($stateParams.temporada != 'todas'){
        var temp = _.find(jogador.temporadas, {ano: _.parseInt($stateParams.temporada)});
        return _.get(temp, attr, 0);
      } else {
        return _.get(jogador, 'numeros.' + attr, 0);
      }
    }

    $scope.editavel = function(){
      return $scope.time && AuthService.getTime() && $scope.timeId === AuthService.getTime();
    }

    function temporadaAtual(){
      return !$stateParams.temporada || $stateParams.temporada == moment().year();
    }

    $scope.editarTime = function(){
      if($scope.editavel()){
        $state.go('abasInicio.editarTime', {id: $scope.time._id});
      } else {
        $scope.exibirModalTime($scope.time);
      }
    }

    $scope.reativarTime = function(){
      DataService.reativarTime($scope.time._id).then(function(){
        $scope.time.ativo = true;
      });
    }

    $scope.excluirTime = function(){
        $ionicPopup.confirm({
          title: 'Confirmar exclusão',
          content: 'Deseja realmente remover este time? Não será possível desfazer essa ação.'
        }).then(function(res) {
          if(res) {
            DataService.excluirTime($scope.time._id).then(function(resposta){
              AuthService.atualizarPerfil(null, resposta.token);
              $rootScope.$broadcast('alterarRegiao', AuthService.getPerfilFiltro());
              $state.go('abasInicio.inicio');
            });
         }
       });
    }

    $scope.exibirModalTime = function(time){
      $scope.timeDoModal = time;
      $scope.modalTime.show();
    }

    $ionicModal.fromTemplateUrl('templates/times/verTime.html', {
      scope: $scope,
      animation: 'fade-in'
    }).then(function(modal){
      $scope.modalTime = modal;
    });

    $scope.temMaisJogosEncerrados = function(){
      return $scope.jogosAnteriores.length;
    }

    $scope.verJogosAnteriores = function(){

      result = DataService.jogosEncerradosTime($scope.time._id, $scope.temporada, $scope.paginacao.encerrados.page, $scope.paginacao.QTD_POR_PAGINA).then(function(jogos){
        $scope.time.jogos.encerrados.push.apply($scope.time.jogos.encerrados, jogos);
        $scope.paginacao.encerrados.page++;
        $scope.paginacao.encerrados.maisJogos = (jogos.length == $scope.paginacao.QTD_POR_PAGINA);
      });
    }

    $scope.verJogosAgendados = function(){

      result = DataService.jogosAgendadosTime($scope.time._id, $scope.temporada, $scope.paginacao.proximos.page, $scope.paginacao.QTD_POR_PAGINA).then(function(jogos){
        $scope.time.jogos.proximos.push.apply($scope.time.jogos.proximos, jogos);
        $scope.paginacao.proximos.page++;
        $scope.paginacao.proximos.maisJogos = (jogos.length == $scope.paginacao.QTD_POR_PAGINA);
      });
    }
    

    $scope.exibirMenuTime = function(){
      var i=0;
      var buttons = [];
      var indicesBotoes = {};

      indicesBotoes['compartilhar'] = i;
      buttons[i++] = { text: 'Compartilhar' };
      indicesBotoes['jogador'] = i;
      buttons[i++] = { text: 'Adicionar Jogador' };

      if($scope.podeSelecionarPerfil()){
        indicesBotoes['perfis'] = i;
        buttons[i++] = { text: 'Gerenciar perfis' };
      }

      if(AuthService.adminJogueiros()){
        indicesBotoes['admin'] = i;
        buttons[i++] = { text: 'Admin Jogueiros' };
      }

      var params = {
         buttons: buttons,
         destructiveText: 'Sair',
         cancelText: 'Cancelar',
         destructiveButtonClicked: function(){
            AuthService.logout();
            return true;
         },
         buttonClicked: function(index) {
            switch(index){
              case indicesBotoes['compartilhar']: 
                $scope.compartilharLink($scope.time);
                break;
              case indicesBotoes['jogador']:
                $scope.$broadcast('adicionarJogador', $scope.time.id);
                break;
              case indicesBotoes['perfis']:
                $scope.selecionarPerfil();
                break;
              case indicesBotoes['admin']:
                $state.go('adminGraficos');
                break;
            }
           return true;
         }
       }

       $ionicActionSheet.show(params);
    }


    $scope.selecionarPerfil = function(){
      if($scope.podeSelecionarPerfil()){
        $state.go('selecionarPerfil');
      }
    }

    $scope.setTemporada = function (temporada) {

      if(!temporada) {
        var temp = _.maxBy($scope.time.temporadas, 'ano');
        temporada = temp.ano;
      }
      AuthService.redirectClean('time', null, {id: $scope.timeId, temporada: temporada});
    }

    $scope.mostrarTemporadas = function(){
      return $scope.time.temporadas.length > 1;
    }

    $scope.formatarTelefone = function(telefone){
      return telefone.replace(/^(\d{2})?(\d{4,5})(\d{4})$/, "$1 $2-$3").trim();
    }

    $scope.verRanking = function(ranking){
      $state.go('liga_ranking', {id: ranking._id});
    }

    $scope.temMaisRankings = function(){
      return _.find($scope.time.rankings, {atual: false}) && !$scope.mostrarTodosRankings;
    }

    $scope.podeSelecionarPerfil = function(){
      return $scope.editavel();
    }

    $scope.verRankingsAnteriores = function(){
      $scope.mostrarTodosRankings = true;
    }


    $ionicModal.fromTemplateUrl('templates/ligaAmistosos/adicionarAdmin.html', {
      scope: $scope,
      animation: 'fade-in'
    }).then(function(modal){
      $scope.modalAddAdmin = modal;
    });

    $scope.adicionarAdmin = function(){
      $jgModalAssinatura.confirmarAssinatura('admins').then(function(){
        $scope.administrador = {};
        $scope.modalAddAdmin.show();
      });
    }

    $scope.enviarConviteAdmin = function(){
      DataService.timeEnviarConviteAdmin($scope.time._id, {email: $scope.administrador.email}).then(function(resposta){
        if(resposta.convite){
          $scope.time.convitesAdmin.push(resposta.convite); 
        } else if(resposta.administrador){
          $scope.time.administradores.push(resposta.administrador); 
        }
        
        $scope.modalAddAdmin.hide();
      });
    }

    $scope.excluirAdmin = function(administradorId){

        var confirmPopup = $ionicPopup.confirm({
          title: 'Confirmar exclusão',
          content: 'Deseja realmente remover este administrador?'
        });
       confirmPopup.then(function(res) {
         if(res) {
           DataService.timeExcluirAdmin($scope.time._id, administradorId).then(function(){
              _.remove($scope.time.administradores, {_id: administradorId});
           }, function(err){
              $ionicPopup.alert({
                title: 'Erro',
                content: err.data.erro
              });
           });
         }
       });

    }

    $scope.excluirConviteAdmin = function(conviteId){

        var confirmPopup = $ionicPopup.confirm({
          title: 'Confirmar exclusão',
          content: 'Deseja realmente remover este administrador?'
        });
       confirmPopup.then(function(res) {
         if(res) {
           DataService.timeExcluirConviteEmail(conviteId).then(function(){
              _.remove($scope.time.convitesAdmin, {_id: conviteId});
           }, function(err){
              $ionicPopup.alert({
                title: 'Erro',
                content: err.data.erro
              });
           });
         }
       });

    }

    $scope.numerosGraficoDesempenho = function(){
      var numeros = $scope.time.numeros;
      if (numeros.vitorias + numeros.empates + numeros.derrotas) {
        return numeros;
      } else {
        return {
          vitorias: 10,
          empates: 2,
          derrotas: 4
        }
      }
    }

    $scope.verEstatisticas = function(){
      $jgModalAssinatura.confirmarAssinaturaTime('graficos', $scope.time._id, $scope.time.pro).then(function(){
        $state.go('time_estatisticas', {id: $scope.time._id, temporada: $scope.temporada});
      });
    }

    $scope.modosFormatados = function(){
      var modos = _.get($scope.time, 'efootball.modos', []);
      var texto = '';

      if(modos.length) {
        texto = modos.length > 1 ? 'Modos ' : 'Modo ';
        texto += (modos[0] == 'CLUBS') ? 'Pro Clubs' : modos[0];
        for (var i = 1; i < modos.length; i++) {
          var modo = (modos[i] == 'CLUBS') ? 'Pro Clubs' : modos[i];
          if(i == modos.length - 1){ //ultimo modo
            texto += ' e '
          } else {
            texto += ', '
          }
          texto += modo;
        }
      }

      return texto;
    }

}])
