angular
  .module('app.controllers')
  .controller('ligaController', ['$rootScope', '$scope', '$state', '$stateParams', 'DataService', 'AuthService', '$ionicActionSheet', '$ionicHistory', '$ionicPopup', '$ionicModal', 'config', function ($rootScope, $scope, $state, $stateParams, DataService, AuthService, $ionicActionSheet,$ionicHistory, $ionicPopup, $ionicModal, config) {

    $scope.arbitrosOrdem = 'NOME';
    $scope.jogosAnteriores = [];
    $scope.exibindoJogosAnteriores = false;
    $scope.arbitro = {};
    $scope.administrador = {};
    $rootScope.$emit('loading.init');

    function mostrarAlerta(mensagem){
      $ionicPopup.alert({
        title: 'Ops!',
        content: mensagem
      }).then(function(){
        $ionicHistory.goBack();
      });
    }

    $scope.compartilharLink = function(liga){
      var url = config.URL_SITE + '#/liga/'+liga._id + '/';
      if (window.plugins) {
        window.plugins.socialsharing.share(liga.nome + ' está no Jogueiros FC! Você pode acompanhar tudo pelo site ou pelo aplicativo! \n' + url);
      } else {
        window.open(url);
      }
      return false;
    }

    $scope.irParaWhatsapp = function(telefone){
      window.open('https://api.whatsapp.com/send?phone=' + telefone.ddi + '' + telefone.numero, '_system'); 
      return false;
    }

    $scope.irParaUrl = function(url){
      window.open(url, '_system');
      return false;
    }

    $scope.irParaInstagram = function(time){
      $scope.irParaUrl('https://www.instagram.com/' + time.instagram);
    }

    $scope.cadastrarJogoAvulso = function(){
      $state.go('liga_novoJogo', {id: $scope.ligaId});
    }

    $scope.atualizar = function(){
      $scope.ligaId = $stateParams.id || AuthService.getLiga();
      
      DataService.ligaCompleto($scope.ligaId).then(function(liga){
        if(!liga){
            mostrarAlerta('Essa liga não existe mais');
            return;
        }

        $scope.liga = liga;

        $scope.ordenarArbitrosPor($scope.arbitrosOrdem);
        $scope.$broadcast('scroll.refreshComplete');
        $rootScope.$emit('loading.finish');
      }).catch(function(){
          mostrarAlerta('Não foi possível carregar as informações desta liga');
      });
      //Todo: checar quando falhar a consulta ao banco e exibir um erro
    }

    $scope.$on('jogadorAdicionado', function(events, jogador){
      $scope.time.jogadores.push(jogador);
    });

    $scope.$on('$ionicView.enter', function(){
      DataService.blockPopup();
      $scope.atualizar();
    });
// $scope.atualizar();
    $scope.ordenarArbitrosPor = function(ordem){
      var orderFunction;
      switch(ordem){
        case 'JOGOS':
          orderFunction = function(a, b){
            return a.numeros.jogos - b.numeros.jogos;
          }
        break;
        case 'NOME':
          orderFunction = function(a, b){
            return a.nome.localeCompare(b.nome);
          }
        break;
      }
      $scope.arbitrosOrdem = ordem;
      // $scope.liga.arbitros.sort(orderFunction);
    }


    $scope.editavel = function(){
      return $scope.liga && AuthService.getLiga() && $scope.ligaId === AuthService.getLiga();
    }

    $scope.editarPerfil = function(){
      if($scope.editavel()){
        $state.go('liga_editar', {id: $scope.liga._id});
      } else {
        $scope.exibirModalTime($scope.liga);
      }
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
      $scope.time.jogos.encerrados = $scope.time.jogos.encerrados.concat($scope.jogosAnteriores);
      $scope.jogosAnteriores = [];
      $scope.exibindoJogosAnteriores = true;
    }

    $scope.exibirMenu = function(){
       $ionicActionSheet.show({
         buttons: [ 
           // { text: 'Editar Perfil' },
           // { text: 'Adicionar Árbitro' },
           { text: 'Configurações' },
           { text: 'Gerenciar perfis' },
         ],
         destructiveText: 'Sair',
         cancelText: 'Cancelar',
         destructiveButtonClicked: function(){
            AuthService.logout();
            return true;
         },
         buttonClicked: function(index) {
            switch(index){
              case 0:
                $scope.editarConfiguracoes();
                break;
              case 1:
                $scope.selecionarPerfil();
                break;
            }
           return true;
         }
       });
    }

    $scope.editarConfiguracoes = function(){
      $state.go('liga_configurar', {id: $scope.liga._id});
    }

    $scope.selecionarPerfil = function(){
      if($scope.editavel())
        $state.go('selecionarPerfil');
    }

    $scope.formatarTelefone = function(telefone){
      return telefone.replace(/^(\d{2})?(\d{4,5})(\d{4})$/, "$1 $2-$3").trim();
    }

    $ionicModal.fromTemplateUrl('templates/ligaAmistosos/adicionarArbitro.html', {
      scope: $scope,
      animation: 'fade-in'
    }).then(function(modal){
      $scope.modalAddArbitro = modal;
    });

    $scope.adicionarArbitro = function(){
      $scope.modalAddArbitro.show();
    }

    $scope.enviarConviteArbitro = function(){ 
      DataService.enviarConviteArbitroLiga($scope.liga._id, {email: $scope.arbitro.email}).then(function(arbitro){
        $scope.liga.arbitros.push(arbitro);
        $scope.modalAddArbitro.hide();
      });
    }

    $scope.criarLinkConviteArbitro = function(){
      $scope.carregandoToken = true;
      DataService.gerarTokenArbitroLiga($scope.liga._id).then(function(result){
        $scope.liga.token = result.token;
        $scope.carregandoToken = false;
      });
    }

    $scope.compartilharLinkConvite = function(token){
      if (window.plugins) 
        window.plugins.socialsharing.share($scope.liga.nome + ' te convida para fazer parte do seu quadro de árbitros no Jogueiros FC! \n' + $scope.linkConviteArbitro(token));
    }

    $scope.desativarLinkConvite = function(){
      $scope.liga.token = null;
      DataService.desativarTokenArbitroLiga($scope.liga._id);
    }

    $scope.linkConviteArbitro = function(token){
      if(token){
        return config.URL_SITE + "#/liga/" + $scope.liga._id + "/convite/" + token;
      } else {
        return "Carregando..."
      }
    }

    $scope.verArbitro = function(arbitro){
      $state.go('arbitro', {id: arbitro._id});
    }


    $scope.verRanking = function(ranking){
      $state.go('liga_ranking', {id: ranking._id});
    }    

    $scope.cadastrarRanking = function(){
      $state.go('ranking_cadastrar');
    }

    $scope.verJogos = function(proximos, filtro){
      $state.go('liga_jogos', {id: $scope.ligaId, nomeLiga: $scope.liga.nome, proximos: proximos, filtro: filtro, editavel: $scope.editavel()});
    }

    $scope.verTimes = function(){
      $state.go('liga_times', {id: $scope.ligaId, nomeLiga: $scope.liga.nome});
    }

    $ionicModal.fromTemplateUrl('templates/ligaAmistosos/adicionarAdmin.html', {
      scope: $scope,
      animation: 'fade-in'
    }).then(function(modal){
      $scope.modalAddAdmin = modal;
    });

    $scope.adicionarAdmin = function(){
    $scope.administrador = {};
      $scope.modalAddAdmin.show();
    }

    $scope.enviarConviteAdmin = function(){ 
      DataService.enviarConviteAdminLiga($scope.liga._id, {email: $scope.administrador.email}).then(function(resposta){
        if(resposta.convite){
          $scope.liga.convitesAdmin.push(resposta.convite); 
        } else if(resposta.administrador){
          $scope.liga.administradores.push(resposta.administrador); 
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
           DataService.excluirAdminLiga($scope.liga._id, administradorId).then(function(){
              _.remove($scope.liga.administradores, {_id: administradorId});
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
           DataService.excluirConviteEmail(conviteId).then(function(){
              _.remove($scope.liga.convitesAdmin, {_id: conviteId});
           }, function(err){
              $ionicPopup.alert({
                title: 'Erro',
                content: err.data.erro
              });
           });
         }
       });

    }

}])
