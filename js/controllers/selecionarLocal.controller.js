angular
  .module('app.controllers')
  .controller('selecionarLocalController', ['$scope', '$rootScope', '$ionicModal', 'DataService', 'AuthService', '$ionicPopup', 'ModalidadeService', 'TiposCampoService' ,'$q', function ($scope, $rootScope, $ionicModal, DataService, AuthService, $ionicPopup, ModalidadeService, TiposCampoService,  $q) {
    $scope.cidades = [];
    $scope.estados = [];
    var fuseLocais;

    $scope.tiposCampo = TiposCampoService.getTiposCampo();

    $scope.regiao = AuthService.getRegiao();
    $scope.searchTerm = {query: ''};

    $scope.buscarLocal = function(query){
      if(fuseLocais) {
        if(query.length){
          $scope.locais = _.slice(fuseLocais.search(_.deburr(query)), 0, 50);
        } else {
          $scope.locais = _.slice(fuseLocais.list, 0, 50);
        }
      } else {
        $scope.locais = [];
      }
    }

    if(_.get($scope, 'jogo.mandante._id')){
      DataService.locaisPreferidos($scope.jogo.mandante._id).then(function(locaisPreferidos){
        $scope.locaisSugeridos = locaisPreferidos;
      });      
    }


    function carregarLocais(){
      if(!$scope.regiao) {
        var promise = $q.defer();
        promise.reject('');
        return promise;
      }
      return DataService.locais($scope.regiao).then(function(locais){
        $scope.locais = _.slice(locais, 0, 50);
        fuseLocais = new Fuse(locais, {
          keys: ['nomeSemAcento'],
          threshold: 0.3,
        });
      });
    }

    carregarLocais();

    $rootScope.$on('alterarRegiao', function(event, filtro){
      $scope.regiao = filtro.regiao;
      carregarLocais().then(function(){
        $scope.buscarLocal($scope.searchTerm.query);
      });
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

    $scope.estadoSelecionado = function(estado){
      $scope.novoLocal.estado = estado;
      $scope.capital = estado.capital;
      $scope.cidades = [];
      DataService.cidadesDaUf(estado.uf).then(function(cidades){
        $scope.cidades = cidades;
      });
      $scope.modalEstado.hide();
      $scope.modalCidade.show();
    }

    $scope.cidadeSelecionada = function(cidade){
      $scope.novoLocal.cidade = cidade;
      $scope.modalCidade.hide();
    }

    $scope.cadastrarLocal = function(nomeLocal){
      $scope.novoLocal = {nome: nomeLocal, cidade: AuthService.getCidade(), numJogadores: 7};
      $scope.modalCadastrarLocal.show();
      // $scope.timeSelecionado({nome:nomeTime});
    }

    function localEstaCompleto(){
      var local = $scope.novoLocal;
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
        $scope.novoLocal.createdBy = AuthService.getUsuarioId();
        var localSalvar = _.clone($scope.novoLocal);
        localSalvar.tipo = localSalvar.tipo.chave;
        DataService.salvarLocalJogo(localSalvar).then(function(localSalvo){
            $scope.novoLocal._id = localSalvo.id;
            $scope.local = $scope.novoLocal;
            $scope.modalCadastrarLocal.hide();
            $scope.localSelecionado($scope.local);
            // $scope.modalLocal.hide();
        });
      }
    }

    $scope.selecionado = function(campo, valor) {
      if ($scope.novoLocal) $scope.novoLocal[campo] = valor;
    }

    $scope.detalhesLocal = function(local){
      var tipoCampo = TiposCampoService.nome(local.tipo);
      var textos = [];

      if(local.cidade) textos.push(local.cidade.nome);
      if(tipoCampo) textos.push(tipoCampo);
      if(local.numJogadores) textos.push(local.numJogadores + 'x' + local.numJogadores);
      
      return textos.join(' • ');
    }

  }])
