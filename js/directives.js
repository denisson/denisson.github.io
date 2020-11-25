angular.module('app.directives', [])

.directive('jogPartida', ['$ionicModal','AuthService', function($ionicModal, AuthService){
  return {
  	restrict: 'E',
  	scope: {jogo: '=', informarPlacar: '@', mostrarDetalhes: '@'},
    templateUrl: 'templates/directives/jog-partida.html',
    controller: function($scope, $state){
    	$scope.irParaTime = function(time){
        if(time._id){
    		  $state.go('time', {id: time._id});
        } else {
          $scope.verTimeSemCadastro(time);
        }
    	};

      $scope.formatarData = function(jogo){
        var timezone = _.get(jogo, 'local.cidade.timezone', 'America/Fortaleza'); //caso não tenha no cadastro do jogo, utilizar o timezone compatível com Maceió
         return moment(jogo.dataHora).tz(timezone).format('ddd DD/MM/YYYY');
      }

      $scope.formatarHora = function(jogo){
        var timezone = _.get(jogo, 'local.cidade.timezone', 'America/Fortaleza'); //caso não tenha no cadastro do jogo, utilizar o timezone compatível com Maceió
        return moment(jogo.dataHora).tz(timezone).format('HH:mm');
      }      

      $scope.jogoValido = function(jogo){
        return jogo && (jogo.situacao == 'jogoConfirmado' || jogo.situacao == 'placarConfirmado') && jogo.visitante._id && jogo.mandante.situacaoJogo == 'ativo' && jogo.visitante.situacaoJogo == 'ativo';
      }

    	$scope.acaoJogo = function(jogo){
        // ui-sref="abasInicio.jogo({id: })"
        // if ($scope.informarPlacar) {
        //   $state.go('informarPlacar', {id: jogo._id, jogo: jogo});
        // } else {
          $state.go('jogo', {id: jogo._id});
        // }
      }

      $scope.verTimeSemCadastro = function(time){
        $scope.timeDoModal = time;
        $scope.modalTime.show();
      }

      $ionicModal.fromTemplateUrl('templates/times/verTime.html', {
        scope: $scope,
        animation: 'fade-in'
      }).then(function(modal){
        $scope.modalTime = modal;
      });


    }
  };
}])
.directive('jogPartidas', ['$ionicModal', function($ionicModal){
  return {
    restrict: 'E',
    scope: {partidas: '='},
    templateUrl: 'templates/directives/jog-partidas.html',
    controller: function($scope, $state){}
  };
}])
.directive('jogEscolherRegiao', ['$ionicModal', 'DataService', '$rootScope', 'AuthService', function($ionicModal, DataService, $rootScope, AuthService){
  return {
    restrict: 'A',
    // scope: {mostrarBr: '=', temTime: '=', temJogos: '='},
    link: function(scope, el, attr) {
      var fuseEstados;
      scope.estados = [];

      function inicializar(){
      
        if(scope.efootball){
          scope.titulo = 'Selecionar plataforma'
          scope.perfilFiltro.chaveEsporte = _.get(scope.perfilFiltro, 'esporte.chave');
          scope.perfilFiltro.chavePlataforma = _.get(scope.perfilFiltro, 'plataforma.chave');
        } else {
          scope.regiao = scope.ufTimeLogado = attr.regiao || scope.perfilFiltro.regiao;
          scope.titulo = 'Selecionar região'
        }
        
        scope.modalRegiao;
        scope.mostrarBr = attr.mostrarBr == undefined ? true : scope.$eval(attr.mostrarBr);
        scope.mostrarOutrosEsportes = attr.mostrarOutrosEsportes == undefined ? true : scope.$eval(attr.mostrarOutrosEsportes);
        // scope.filtro = attr.filtro == undefined ? null : scope.$eval(attr.filtro);
        scope.temTime = attr.temTime == undefined ? false : scope.$eval(attr.temTime);
        scope.temJogos = attr.temJogos == undefined ? false : scope.$eval(attr.temJogos);
        scope.ocultarCancelar = attr.ocultarCancelar == undefined ? false : (scope.$eval(attr.ocultarCancelar) && !scope.regiao);
      }

      scope.perfilFiltro = scope.perfilFiltro || AuthService.getPerfilFiltro();
      scope.efootball = _.get(scope.perfilFiltro, 'esporte.efootball');
      inicializar();

      scope.alterarPerfilFiltro = function(estado){
        $rootScope.$broadcast('alterarRegiao', scope.perfilFiltro);
        scope.modalRegiao.hide();
      }

      
      DataService.estados().then(function(estados){
        scope.estados = estados;
        fuseEstados = new Fuse(estados, {
          keys: ['nomeSemAcento'],
          threshold: 0.3,
        });
      });

      DataService.esportes().then(function(esportes){
        scope.esportes = esportes;
      });
    
      DataService.plataformas().then(function(plataformas){
        scope.plataformas = plataformas;
      });

      scope.buscarEstado = function(query){
        if(fuseEstados) {
          if(query.length){
            scope.estados = fuseEstados.search(_.deburr(query));
          } else {
            scope.estados = fuseEstados.list;
          }  
        }
      }

      $ionicModal.fromTemplateUrl('templates/directives/selecionarRegiao.html', {
        scope: scope,
      }).then(function(modal){
        scope.modalRegiao = modal;
        if(scope.$eval(attr.abrirModal) && !scope.regiao && !scope.efootball){
          modal.show();
        }
      });

      scope.regiaoSelecionada = function(estado){
        scope.perfilFiltro.esporte = _.find(scope.esportes, {chave: 'FUT'});
        scope.perfilFiltro.plataforma = null;
        scope.perfilFiltro.regiao = estado.uf || estado;
        scope.alterarPerfilFiltro();
      }

      scope.esporteSelecionado = function(esporte){
        scope.perfilFiltro.esporte = esporte;
        scope.perfilFiltro.plataforma = null;
        scope.perfilFiltro.chavePlataforma = null;
        scope.alterarPerfilFiltro();
      }

      scope.plataformaSelecionada = function(plataforma){
        scope.perfilFiltro.plataforma = plataforma;
        scope.alterarPerfilFiltro();
      }

      scope.alternarEfootball = function(efootball){
        scope.efootball = efootball;
        inicializar();
      }

      scope.mostrarEstado = function(estado){
        return (
          (!scope.temTime || estado.temTime) //ou não precisa ter time, ou o estado tem que ter o time
          &&
          (!scope.temJogos || estado.temJogos)  // ou não precisa ter jogos, ou o estado tem que ter jogos
        ) 
        || scope.ufTimeLogado == estado.uf;
        ;
      }

      el.bind('click', function() {
        scope.modalRegiao.show();
      });
    }
  };
}])
.directive('jogJogadorGols', [function(){
  return {
    restrict: 'E',
    scope: {jogador: '=', mostrarSeJogou: '@'},
    templateUrl: 'templates/directives/jog-jogador-gols.html',
    controller: function($scope, $state){

    }
  };
}])
.directive('jogTextarea', ['$ionicModal', '$ionicPopup',  function($ionicModal, $ionicPopup){
  return {
    restrict: 'E',
    scope: {objeto:'=', label: '@', campoTexto: "@", descricao: '@', limite: '@'},
    templateUrl: 'templates/directives/jog-textarea.html',
    controller: function($scope, $state){

      $ionicModal.fromTemplateUrl('templates/directives/jog-textarea-modal.html', {
        scope: $scope,
        animation: 'no-animation',
        focusFirstInput: true,
      }).then(function(modal){
        $scope.modal = modal;
      });

      $scope.cancelar = function(){
        $scope.objeto[$scope.campoTexto] = $scope.textoInicial;
        $scope.modal.hide();
      }

      $scope.exibirModal = function(){
        if($scope.objeto) {
          $scope.textoInicial = $scope.objeto[$scope.campoTexto];
        } else {
          $scope.textoInicial = '';
        }
        $scope.modal.show();
      }

      $scope.confirmar = function(){
        // if(editando()){
          // DataService.editarLiga(_.pick($scope.liga, ['_id', 'biografia'])).then(function(){
            // $scope.objeto[$scope.campoTexto] = $scope.texto;
            $scope.modal.hide();
          // });
        // } else {
        //   $scope.modalBiografia.hide();
        // }
      }

    }
  }
}])
.directive('inputTimeCompativel', [function(){
  return {
    restrict: 'A',
    link: function(scope, el, attr) {

      function compativel(){
        if (window.device && (window.device.platform == "Android") && _.startsWith(window.device.version, '5.0')){
          return false;
        }
        return true;
      }

      if(compativel()){
        attr.$set('type', 'time');
      } else {
        attr.$set('placeholder', "HH:MM");
      }
    }
  };
}])
.directive('jogRangeHorario', [function(){
    return {
      restrict: 'E',
    scope: {horario: '='},
    templateUrl: 'templates/directives/jog-range-horario.html',
    link: function(scope, element, attrs){
        var range =  $(element[0].querySelector('.js-range-slider'));
      range.ionRangeSlider({
            skin: "round",
          type: "double",
          min: 0,
          max: 24,
          from: scope.horario.inicio,
          to: scope.horario.fim,
          postfix: "h",
          hide_min_max: true,
          force_edges: true,
          onFinish: function(data){
              scope.horario.inicio = data.from;
            scope.horario.fim = data.to;
            scope.$apply();
          }
      });

    }
  };
}])
.directive('jogOptions', [function(){
    return {
      restrict: 'E',
    scope: {lista: '=', listaPreenchida: '='},
    templateUrl: 'templates/directives/jog-options.html',
    controller: function($scope, $state){

      $scope.itemSelecionado = function(item){
          return _.find($scope.listaPreenchida, function(i){
            return item.key == i.key;
        });
      }

      $scope.toggle = function(item){
          if($scope.itemSelecionado(item)){
            _.pullAllBy($scope.listaPreenchida, [item], 'key');
        } else {
            $scope.listaPreenchida.push(item);
        }
      }
    } 
  };
}])
// .directive('jogSelecionarCidade', ['$ionicModal', 'DataService', '$rootScope', 'AuthService', function($ionicModal, DataService, $rootScope, AuthService){
//     return {
//       restrict: 'A',
//     scope: {onSelecionado: '&'},
//     // require: 'ngModel',
//     link: function(scope, el, attr) {

//       scope.estados = [];

//       DataService.estados().then(function(estados){
//           scope.estados = estados;
//       });


//       $ionicModal.fromTemplateUrl('templates/jogos/selecionarEstado.html', {
//           scope: scope,
//         focusFirstInput: true,
//       }).then(function(modal){
//           scope.modalEstado = modal;
//       });

//       $ionicModal.fromTemplateUrl('templates/jogos/selecionarCidade.html', {
//           scope: scope,
//         focusFirstInput: true,
//       }).then(function(modal){
//           scope.modalCidade = modal;
//       });

//       scope.estadoSelecionado = function(estado){
//           // scope.jogo.novoLocal.estado = estado;
//         scope.capital = estado.capital;
//         scope.cidades = [];
//         DataService.cidadesDaUf(estado.uf).then(function(cidades){
//             scope.cidades = cidades;
//         });
//         scope.modalEstado.hide();
//         scope.modalCidade.show();
//       }

//       scope.cidadeSelecionada = function(cidade){
//         scope.onSelecionado({cidade:cidade});
//         scope.modalCidade.hide();
//       }

//       scope.alterarRegiao = function(reg){
//           scope.regiao = reg;
//         $rootScope.$broadcast('alterarRegiao', reg);
//       }

//       scope.fuseEstados;
//       DataService.estados().then(function(estados){
//           scope.estados = estados;
//         fuseEstados = new Fuse(estados, {
//             keys: ['nomeSemAcento'],
//           threshold: 0.3,
//         });
//       });


//       el.bind('click', function() {
//           scope.modalEstado.show();
//       });
//     }
//   };
// }])
.directive('jogSelecionarCidade', ['$ionicModal', 'DataService', '$rootScope', 'AuthService', function($ionicModal, DataService, $rootScope, AuthService){
    return {
      restrict: 'A',
      scope: {onSelecionado: '&', multi: '@', preSelecionados: '=', estado: '=', labelBotao: '@'},
    // require: 'ngModel',
    link: function(scope, el, attr) {
      scope.selecionados = {};
      scope.estados = [];

      $ionicModal.fromTemplateUrl('templates/jogos/selecionarEstado.html', {
          scope: scope,
        focusFirstInput: true,
      }).then(function(modal){
          scope.modalEstado = modal;
      });

      $ionicModal.fromTemplateUrl('templates/jogos/selecionarCidade.html', {
        scope: scope,
        focusFirstInput: true,
      }).then(function(modal){
        scope.modalCidade = modal;
      });

      function carregarCidades(uf){
        DataService.cidadesDaUf(uf).then(function(cidades){
            scope.cidades = cidades;
            checkSelecionados();
        });
      }

      function checkSelecionados(){
        for (var i = 0; i < _.get(scope, 'preSelecionados.length', 0); i++) {
          var cidade = scope.preSelecionados[i];
          scope.selecionados[cidade._id] = cidade;
        }
      }

      scope.cidadeSelecionada = function(cidade){
        if(!scope.multi){
          scope.onSelecionado({cidade:cidade});
          scope.modalCidade.hide();
        } else {
          if (scope.selecionados[cidade._id]) {
            delete scope.selecionados[cidade._id];
            cidade.selecionado = false;
          } else {
            scope.selecionados[cidade._id] = cidade;
            cidade.selecionado = true;
          }
        }
      }

      scope.cidadeChecked = function(cidade){
        if(scope.selecionados[cidade._id]){
          cidade.selecionado = true;
        };
      }

      scope.concluir = function(){
        scope.onSelecionado({cidades:Object.values(scope.selecionados)});
        scope.modalCidade.hide();
      }

      function exibirModalEstados(){
        DataService.estados().then(function(estados){
          scope.estados = estados;
          scope.modalEstado.show();
        });
      }

      scope.estadoSelecionado = function(estado){
        scope.capital = estado.capital;
        scope.modalEstado.hide();
        exibirModalCidades(estado.uf);
      }

      function exibirModalCidades(uf){
        if(scope.uf != uf) { //A região é diferente da uf que já tinha sido carregada antes?
          scope.uf = uf;
          carregarCidades(scope.uf);
        }
        scope.modalCidade.show();
      }

      el.bind('click', function() {
        if(!scope.estado) { //não tem região definida
          //abrir opções de estado
          exibirModalEstados();
        } else {
          exibirModalCidades(scope.estado);
        }
      });
    }
  };
}])
.directive('jogSelecionarLocal', ['$ionicModal', 'DataService', '$rootScope', 'AuthService', function($ionicModal, DataService, $rootScope, AuthService){
    return {
      restrict: 'A',
    scope: {onSelecionado: '&', multi: '@', locaisPreSelecionados: '='},
    // require: 'ngModel',
    link: function(scope, el, attr) {

      var fuseLocais;
      scope.regiao = AuthService.getRegiao();
      scope.search = {query: ''};
      scope.locaisSelecionados = {};

      $ionicModal.fromTemplateUrl('templates/jogos/selecionarLocal.html', {
          scope: scope,
        focusFirstInput: true,
      }).then(function(modal){
          scope.modalLocal = modal;
      });

      scope.buscarLocal = function(query){
          if(query.length){
            scope.locais = _.slice(fuseLocais.search(_.deburr(query)), 0, 50);
        } else {
            scope.locais = _.slice(fuseLocais.list, 0, 50);
        }
      }

      if(AuthService.getTime()){
        DataService.locaisPreferidos(AuthService.getTime()).then(function(locaisPreferidos){
            scope.locaisSugeridos = locaisPreferidos;
        });        
      }

      function carregarLocais(){
          return DataService.locais(scope.regiao).then(function(locais){
            scope.locais = _.slice(locais, 0, 50);
          checkLocaisSelecionados();
          fuseLocais = new Fuse(locais, {
              keys: ['nomeSemAcento'],
            threshold: 0.3,
          });
        });
      }

      carregarLocais();

      scope.$on('alterarRegiao', function(event, uf){
        scope.regiao = uf;
        carregarLocais().then(function(){
          scope.buscarLocal(scope.search.query);
        });
      });

      function checkLocaisSelecionados(){
          for (var i = 0; i < _.get(scope, 'locaisPreSelecionados.length', 0); i++) {
            var local = scope.locaisPreSelecionados[i];
          scope.locaisSelecionados[local._id] = local;
        }
      }

      scope.localSelecionado = function(local){
          if(!scope.multi){
            scope.onSelecionado({local:local});
          scope.modalLocal.hide();
        } else {
            if (scope.locaisSelecionados[local._id]) {
              delete scope.locaisSelecionados[local._id];
            local.selecionado = false;
          } else {
              scope.locaisSelecionados[local._id] = local;
            local.selecionado = true;
          }
        }
      }

      scope.localChecked = function(local){
          if(scope.locaisSelecionados[local._id]){
            local.selecionado = true;
        };
      }

      scope.concluir = function(){
          scope.onSelecionado({locais:Object.values(scope.locaisSelecionados)});
        scope.modalLocal.hide();
      }

      el.bind('click', function() {
          scope.modalLocal.show();
      });
    }
  };
}])
.directive('jogBanner', ['BannerService', function(BannerService){
  return {
    restrict: 'A',
    link: function(scope, el, attr) {

      BannerService.getBanners().then(function(banners){
        var banner = banners[attr.jogBanner];
        if(!banner){
          el.remove();
          return;
        }
        if(el[0].tagName == 'LINK'){
          el.attr('href', banner.imagem);
        } else {
          el.attr('src', banner.imagem);
        }    
      })
  
    }
  };
}])
.directive('jogBannerLink', ['BannerService', function(BannerService){
  return {
    restrict: 'A',
    link: function(scope, el, attr) {

      BannerService.getBanners().then(function(banners){
        var banner = banners[attr.jogBannerLink];
        if(!banner){
          el.remove();
          return;
        }
        el.bind('click', function() {
          window.open(banner.url, '_system');
          return false;
        });

      });

    }
  };
}])
// .directive('jogStepper', [function(){
//   return {
//   	restrict: 'E',
//   	scope: {value: '='},
//     templateUrl: 'templates/directives/jog-stepper.html'
//   };
// }]);
