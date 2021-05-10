angular
  .module('app.controllers')
  .controller('cadastrarTimeController', 
    ['$scope', 'PerfilFiltroService', '$state', '$stateParams', 'DataService', 'CameraService', 'AuthService','$ionicModal', '$ionicPopup', 'GeneroService', 'ModalidadeService', 'CategoriaService',
    function ($scope, PerfilFiltroService,  $state, $stateParams, DataService, CameraService, AuthService, $ionicModal, $ionicPopup, GeneroService, ModalidadeService, CategoriaService) {
      $scope.modalidades;
      $scope.modalidade = {};
      $scope.modo = {};

      DataService.estados().then(function(estados){
        $scope.estados = estados;
      });

      DataService.esportes().then(function(esportes){
        $scope.esportes = esportes;
      });

      DataService.plataformas().then(function(plataformas){
        $scope.plataformas = plataformas;
      });

      if(editando()){
        DataService.time(AuthService.getTime()).then(function(time){
          $scope.time = time;
          tratarModoParaMostrar();
          // tratarTelefone();
          // carregarModalidades();
        });

        $scope.titulo = 'Editar perfil do time';
        $scope.labelBotao = 'Salvar';
      } else if (AuthService.getTime()) {
        AuthService.redirectClean('abasInicio.time-aba-time', null, {id: AuthService.getTime()});
      } else {
        $scope.time = {nome: '', escudo: '', efootball: {}, idade: { minima: null, maxima: null}, genero: 'MISTO'};
        $scope.titulo = 'Cadastrar time';
        $scope.labelBotao = 'Cadastrar time';
      }

      function editando(){
        return AuthService.getTime() && ($stateParams.id == AuthService.getTime());
      }

      // document.getElementById('input-file-foto').addEventListener('change', function(){
      // 	if (this.files && this.files[0]) {
      //         var reader = new FileReader();
      //         reader.readAsDataURL(this.files[0]);
      //         reader.onload = function (e) {
      //             $scope.time.escudo = e.target.result;
      //         }
      //     }
      // });

        $scope.buscarEstado = function(query){
          if(query.length){
            $scope.estados = fuseEstados.search(_.deburr(query));
          } else {
            $scope.estados = fuseEstados.list;
          }
        }

        
        $ionicModal.fromTemplateUrl('templates/times/selecionarEsporte.html', {
          scope: $scope
        }).then(function(modal){
          $scope.modalEsporte = modal;
        });

        $ionicModal.fromTemplateUrl('templates/times/selecionarPlataforma.html', {
          scope: $scope
        }).then(function(modal){
          $scope.modalPlataforma = modal;
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
        $scope.time.estado = estado;
        $scope.capital = estado.capital;
        $scope.cidades = [];
        DataService.cidadesDaUf(estado.uf).then(function(cidades){
          $scope.cidades = cidades;
          fuseCidades = new Fuse(cidades, {
            keys: ['nomeSemAcento'],
            threshold: 0.3,
          });
        });
        $scope.modalEstado.hide();
        $scope.modalCidade.show();
      }

      $scope.cidadeSelecionada = function(cidade){
        $scope.time.cidade = cidade;
        $scope.modalCidade.hide();
      }

      $scope.esporteSelecionado = function(esporte){
        $scope.time.esporte = esporte;
        $scope.modalidades = ModalidadeService.getModalidades(esporte.chave);
        $scope.modalEsporte.hide();
      }

      $scope.plataformaSelecionada = function(plataforma){
        $scope.time.efootball.plataforma = plataforma;
        $scope.modalPlataforma.hide();
      }

      $scope.capturarFoto = function(){
        CameraService.getPicture().then(function(imagePath){
          $scope.time.escudo = imagePath;
          $scope.fotoAlterada = true;
          $scope.$apply();
        });
      };

      $scope.enviar = function(){
        tratarModoParaEnvio();
        if(editando()){
          var timeSalvar = _.omit(angular.copy($scope.time), ['administradores', 'ativo', 'jogadores', 'jogos', 'numeros', 'temporadas']);
          if(!$scope.fotoAlterada) {
            timeSalvar.escudo = '';
          }
          
          DataService.editarTime(timeSalvar).then(function(time){
            AuthService.atualizarPerfilTime(time);
            // $rootScope.$broadcast('alterarRegiao', AuthService.getPerfilFiltro());
            PerfilFiltroService.setAtual(AuthService.getPerfilFiltro());
            AuthService.redirectClean('abasInicio.time-aba-time', null, {id: time._id});
          });
        } else {
          $scope.time.dono = AuthService.getUsuarioId();
          $scope.time.esporte = _.find($scope.esportes, {chave: _.get($scope.time, 'esporteChave')});
          DataService.salvarTime($scope.time).then(function(resposta){
            // if (window.FirebasePlugin) { window.FirebasePlugin.logEvent('time_cadastro'); }
            AuthService.atualizarPerfil(resposta.perfil, resposta.token);
            // $rootScope.$broadcast('alterarRegiao', AuthService.getPerfilFiltro());
            PerfilFiltroService.setAtual(AuthService.getPerfilFiltro());
            AuthService.redirectClean('onboarding_completar', null, {id: resposta.perfil.perfil});
          });
        }
      }

      function tratarModoParaEnvio(){
        $scope.time.efootball.modos = [];
        if($scope.modo.x11){
          $scope.time.efootball.modos.push('X11');
        }
        if($scope.modo.clubs){
          $scope.time.efootball.modos.push('CLUBS');
        }
        if($scope.modo.coop){
          $scope.time.efootball.modos.push('COOP');
        }
        if($scope.modo.x1){
          $scope.time.efootball.modos.push('1x1');
        }
      }

      function tratarModoParaMostrar(){
        $scope.modo.x11 = _.includes($scope.time.efootball.modos, 'X11');
        $scope.modo.clubs = _.includes($scope.time.efootball.modos, 'CLUBS');
        $scope.modo.coop = _.includes($scope.time.efootball.modos, 'COOP');
        $scope.modo.x1 = _.includes($scope.time.efootball.modos, '1x1');
      }

      $scope.fifa = function(){
        return _.get($scope.time, 'esporte.chave') == 'FIFA';
      }

      $scope.sair = function(){
        AuthService.logout();
      }

      $scope.efootball = function(){
        var esporte = _.find($scope.esportes, {chave: _.get($scope.time, 'esporteChave')})
        return esporte && esporte.efootball;
      }

      $scope.cadastroCompleto = function(){
        if($scope.efootball()){
          return $scope.time.nome && _.get($scope.time, 'efootball.plataforma');
        } else if ($scope.time.esporteChave == 'FUT') {
          return $scope.time.nome && _.get($scope.time, 'cidade.nomeCompleto') && _.get($scope.time, 'modalidade') && _.get($scope.time, 'idade') && _.get($scope.time, 'genero');
        } else {
          return $scope.time.nome && _.get($scope.time, 'cidade.nomeCompleto');
        }
      }

      $scope.primeiroTime = function(){
        return !AuthService.temMaisPerfis();
      }

      $scope.selecionarPerfil = function(){
        $state.go('selecionarPerfil');
      }
  
}])
