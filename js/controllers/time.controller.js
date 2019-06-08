angular
  .module('app.controllers')
  .controller('timeController', ['$rootScope', '$scope', '$state', '$stateParams', 'DataService', 'AuthService', '$ionicActionSheet', '$ionicHistory', '$ionicPopup', '$ionicModal' , function ($rootScope, $scope, $state, $stateParams, DataService, AuthService, $ionicActionSheet,$ionicHistory, $ionicPopup, $ionicModal) {
    var diasExtenso = ['','Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    $scope.jogadoresOrdem = 'ARTILHARIA';
    $scope.jogosAnteriores = [];
    $scope.exibindoJogosAnteriores = false;
    $rootScope.$emit('loading.init');
    $scope.temporada = $stateParams.temporada;

    function mostrarAlerta(mensagem){
      $ionicPopup.alert({
        title: 'Ops!',
        content: mensagem
      }).then(function(){
        $ionicHistory.goBack();
      });
    }

    function checarCidade(){
      //não está cadastrada a cidade e não foi alertado ainda
      if(!$scope.time.cidade && $scope.editavel() && !window.localStorage.getItem('alerta_cidade')){
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

    $scope.irParaSite = function(timeId){
      window.open('http://jogueirosfc.com/#/time/'+timeId + '/', '_system');
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

    $scope.diaExtenso = function(num){
      return diasExtenso[num];
    }

    $scope.atualizar = function(){
      $scope.temporada = $stateParams.temporada = $stateParams.temporada || moment().year();
      if(!$stateParams.id && AuthService.getTime()){
          // $scope.timeId = AuthService.getTime()._id;
        $ionicHistory.nextViewOptions({
          disableAnimate: true,
          disableBack: true
        });
        $state.go('abasInicio.paginaDoTime-aba-time', {id: AuthService.getTime()._id, location: 'replace'});
        return;
      } else {
        $scope.timeId = $stateParams.id;
      }
      
      DataService.timeJogos($scope.timeId, $stateParams.temporada).then(function(time){
        if(!time){
            mostrarAlerta('Esse time não existe mais');
            return;
        }
        
        if(time.jogos.encerrados && !$scope.exibindoJogosAnteriores){
          $scope.jogosAnteriores = time.jogos.encerrados.slice(0); //clona o array
          var primeirosJogos = $scope.jogosAnteriores.splice(0, 3);
          time.jogos.encerrados = primeirosJogos;
        }

        $scope.time = time;

        // $scope.setTemporada();
        $scope.ordenarPor($scope.jogadoresOrdem);
        $scope.$broadcast('scroll.refreshComplete');
        $rootScope.$emit('loading.finish');
        checarCidade();
      }).catch(function(){
          mostrarAlerta('Não foi possível carregar as informações do time');
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
            var posicoes = ['Técnico', 'Auxiliar técnico', 'Goleiro', 'Zagueiro', 'Volante', 'Lateral', 'Meia', 'Atacante'];
            return (posicoes.indexOf(a.posicao) - posicoes.indexOf(b.posicao)) || ($scope.golsJogadorNaTemporada(b) - $scope.golsJogadorNaTemporada(a)) || ($scope.assistJogadorNaTemporada(b) - $scope.assistJogadorNaTemporada(a)) || ($scope.jogosJogadorNaTemporada(b) - $scope.jogosJogadorNaTemporada(a)) ||  a.nome.localeCompare(b.nome); //Se for a mesma posição, ordena pelo nome
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
      return $scope.time && AuthService.getTime() && $scope.timeId === AuthService.getTime()._id && temporadaAtual();
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
              AuthService.atualizarTime(null, resposta.token);
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
      $scope.time.jogos.encerrados = $scope.time.jogos.encerrados.concat($scope.jogosAnteriores);
      $scope.jogosAnteriores = [];
      $scope.exibindoJogosAnteriores = true;
    }

    $scope.exibirMenuTime = function(){
       $ionicActionSheet.show({
         buttons: [ 
           { text: 'Editar Time' },
           { text: 'Adicionar Jogador' }
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
                $scope.editarTime();
                break;
              case 1:
                $scope.$broadcast('adicionarJogador', $scope.time.id);
                break;
            }
           return true;
         }
       });
    }

    $scope.setTemporada = function (temporada) {

      if(!temporada) {
        var temp = _.maxBy($scope.time.temporadas, 'ano');
        temporada = temp.ano;
      }
      $ionicHistory.nextViewOptions({
        disableAnimate: true,
        // disableBack: true
      });
      $state.go('abasInicio.paginaDoTime-'+Object.keys($state.current.views)[0], {id: $scope.timeId, temporada: temporada, location: 'replace'});
    }

    $scope.mostrarTemporadas = function(){
      return $scope.time.temporadas.length > 1;
    }

    $scope.formatarTelefone = function(telefone){
      return telefone.replace(/^(\d{2})?(\d{4,5})(\d{4})$/, "$1 $2-$3").trim();
    }
}])
