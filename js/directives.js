angular.module('app.directives', [])

.directive('jogPartida', ['$ionicModal','AuthService', function($ionicModal, AuthService){
  return {
  	restrict: 'E',
  	scope: {jogo: '=', informarPlacar: '@', mostrarDetalhes: '@', readOnly: '=', aoClicarJogo: '&', aoClicarTime: '&'},
    templateUrl: 'templates/directives/jog-partida.html',
    controller: function($scope, $state){
      // $scope.jogo.timeEsquerda = $scope.jogo.mandanteNaEsquerda ? $scope.jogo.mandante : $scope.jogo.visitante;
      // $scope.jogo.timeDireita = $scope.jogo.mandanteNaEsquerda ? $scope.jogo.visitante : $scope.jogo.mandante;

      $scope.timeEsqueda = function(){
        return $scope.jogo.mandanteNaEsquerda ? $scope.jogo.mandante : $scope.jogo.visitante;
      }
      $scope.timeDireita = function(){
        return $scope.jogo.mandanteNaEsquerda ? $scope.jogo.visitante : $scope.jogo.mandante;
      }

      $scope.placarEsquerda = function(){
        return $scope.jogo.mandanteNaEsquerda ? _.get($scope.jogo, 'placar.mandante') : _.get($scope.jogo, 'placar.visitante');
      }

      $scope.placarDireita = function(){
        return $scope.jogo.mandanteNaEsquerda ? _.get($scope.jogo, 'placar.visitante') : _.get($scope.jogo, 'placar.mandante');
      }

      $scope.tipoTime = function(lado){
        return (lado === 'esquerda' && $scope.jogo.mandanteNaEsquerda) || (lado === 'direita' && !$scope.jogo.mandanteNaEsquerda)
          ? 'mandante'
          : 'visitante'
        ;
      }

    	$scope.irParaTime = function(time, tipoTime){
        if($scope.readOnly){
          $scope.aoClicarTime({time: time, tipo: tipoTime });
        } else {
          if(time._id){
            $state.go('time', {id: time._id});
          } else {
            $scope.verTimeSemCadastro(time);
          }
        }
    	};

      $scope.formatarData = function(jogo){
        if(!jogo.dataHora) return '';
        var timezone = _.get(jogo, 'local.cidade.timezone', 'America/Fortaleza'); //caso não tenha no cadastro do jogo, utilizar o timezone compatível com Maceió
         return moment(jogo.dataHora).tz(timezone).format('ddd DD/MM/YYYY');
      }

      $scope.formatarHora = function(jogo){
        if(!jogo.dataHora) return '';
        var timezone = _.get(jogo, 'local.cidade.timezone', 'America/Fortaleza'); //caso não tenha no cadastro do jogo, utilizar o timezone compatível com Maceió
        return moment(jogo.dataHora).tz(timezone).format('HH:mm');
      }      

      $scope.jogoValido = function(jogo){
        return jogo && (jogo.situacao == 'jogoConfirmado' || jogo.situacao == 'placarConfirmado') && jogo.visitante._id && jogo.mandante.situacaoJogo == 'ativo' && jogo.visitante.situacaoJogo == 'ativo';
      }

    	$scope.acaoJogo = function(jogo){
          if(!$scope.readOnly){
            $state.go('jogo', {id: jogo._id});
          }
          $scope.aoClicarJogo();
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
.directive('jogJogadorGols', ['SumulaService', function(SumulaService){
  return {
    restrict: 'E',
    scope: {jogador: '=', mostrarSeJogou: '@'},
    templateUrl: 'templates/directives/jog-jogador-gols.html',
    controller: function($scope, $state){
      $scope.jogouNaPartida = function(){
        return  $scope.mostrarSeJogou && 
                $scope.jogador && 
                !SumulaService.temNumeros($scope.jogador);
      }

      $scope.temScout = function(){
        return  $scope.jogador && 
                (
                  $scope.jogador.desarmes ||
                  $scope.jogador.defesasDificeis
                )
      }
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
    templateUrl: 'templates/directives/jog-range.html',
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
          DataService.estados().then(function(estados){
            var estado = _.find(estados, function(e) {
              return e.uf == scope.estado;
            });
            scope.capital = estado.capital;
            exibirModalCidades(scope.estado);
          });
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

.directive('jogClickVoltar', ['$ionicHistory', '$state', function($ionicHistory, $state){
  return {
    restrict: 'A',
    link: function(scope, el, attr) {
      el.bind('click', function() {
        if($ionicHistory.backView()){
          $ionicHistory.goBack();
        } else {
          $state.go(el.attr('jog-click-voltar') || 'abasInicio.meuPerfil');
        }
        return false;
      });
    }
  };
}])
.directive('jogBlur', [function(){
  return {
    restrict: 'A',
    link: function(scope, el, attr) {
      el.bind('focus', function() {
        el[0].blur();
      });
    }
  };
}])
.directive('focusOn', function() {
  return function(scope, elem, attr) {
     scope.$on(attr.focusOn, function(e) {
         elem[0].focus();
     });
  };
});

// .directive('jogStepper', [function(){
//   return {
//   	restrict: 'E',
//   	scope: {value: '='},
//     templateUrl: 'templates/directives/jog-stepper.html'
//   };
// }]);
