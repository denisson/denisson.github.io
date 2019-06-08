angular.module('app.directives', [])

.directive('jogPartidas', ['$ionicModal', function($ionicModal){
  return {
  	restrict: 'E',
  	scope: {partidas: '=?', informarPlacar: '@'},
    templateUrl: 'templates/directives/jog-partidas.html',
    controller: function($scope, $state){
    	$scope.irParaTime = function(time){
        if(time._id){
    		  $state.go('abasInicio.paginaDoTime-'+getNomeAbaAtual(), {id: time._id});
        } else {
          $scope.verTimeSemCadastro(time);
        }
    	};

      $scope.formatarData = function(jogo){
        var timezone = _.get(jogo, 'local.cidade.timezone', 'America/Fortaleza'); //caso não tenha no cadastro do jogo, utilizar o timezone compatível com Maceió
         return moment(jogo.dataHora).tz(timezone).format('DD/MM/YYYY');
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
          $state.go('abasInicio.jogo-'+getNomeAbaAtual(), {id: jogo._id});
        // }
      }

      function getNomeAbaAtual(){
        var currentViews = _.get($state, 'current.views');
        return currentViews ? Object.keys(currentViews)[0] : 'aba-time';
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
.directive('jogEscudo', ['config', function(config){
  return {
    restrict: 'A',
    link: function(scope, el, attr) {
      function getUrlImg(urlImg, size){
        var mapSize = {'small': '48x48', 'mid': '80x80', 'large': '300x300'};
        var dimensions = (mapSize[size]? mapSize[size] : '300x300');
        return config.URL_IMAGEBOSS + 'cover:center/' + dimensions + '/' + config.URL_S3 + urlImg;
        // return config.URL_S3 + urlImg;
      }

      scope.$watch(el.attr('jog-escudo'), function(urlImg) {
        if(/^(\w+\:\/\/)/.test(urlImg)){//caso a imagem seja com o protocolo e tudo completo
          el.attr('src', urlImg);
        } else if (urlImg) {
          if(el.attr('jog-size') != 'small'){
            el.attr('src', '');
           el.css({'background-image': 'url(' + getUrlImg(urlImg, 'small') +')'});
          }
          el.attr('src', getUrlImg(urlImg, el.attr('jog-size')));
        } else {
          el.css({'background-image': 'none'});
          el.attr('src', 'img/escudo.svg');
        }
      });
    }
  };
}])
.directive('jogJogador', ['config', function(config){
  return {
    restrict: 'A',
    link: function(scope, el, attr) {
      function getUrlImg(urlImg, size){
        var mapSize = {'small': '48x48', 'mid': '80x80', 'large': '300x300'};
        var dimensions = (mapSize[size]? mapSize[size] : '300x300');
        return config.URL_IMAGEBOSS + 'cover:face/' + dimensions + '/' + config.URL_S3 + urlImg;
      }

      scope.$watch(el.attr('jog-jogador'), function(urlImg) {
        if(/^(\w+\:\/\/)/.test(urlImg)){//caso a imagem seja com o protocolo e tudo completo
          el.attr('src', urlImg);
        } else if (urlImg) { 
          if(el.attr('jog-size') != 'small'){
            el.attr('src', '');
            el.css({'background-image': 'url(' + getUrlImg(urlImg, 'small') +')'});
          }
          el.attr('src', getUrlImg(urlImg, el.attr('jog-size')));
        } else {
          el.css({'background-image': 'none'});
          el.attr('src', 'img/jogador.svg');
        }
        el.addClass('foto-jogador');
      })
    }
  };
}])
.directive('jogEscolherRegiao', ['$ionicModal', 'DataService', '$rootScope', 'AuthService', function($ionicModal, DataService, $rootScope, AuthService){
  return {
    restrict: 'A',
    // scope: {mostrarBr: '=', temTime: '=', temJogos: '='},
    link: function(scope, el, attr) {

      scope.estados = [];
      scope.regiao = scope.ufTimeLogado = attr.regiao || AuthService.getRegiao();
      scope.modalRegiao;
      scope.mostrarBr = attr.mostrarBr == undefined ? true : scope.$eval(attr.mostrarBr);
      scope.temTime = attr.temTime == undefined ? false : scope.$eval(attr.temTime);
      scope.temJogos = attr.temJogos == undefined ? false : scope.$eval(attr.temJogos);
      scope.ocultarCancelar = attr.ocultarCancelar == undefined ? false : (scope.$eval(attr.ocultarCancelar) && !scope.regiao);


      scope.alterarRegiao = function(reg){
        scope.regiao = reg;
        $rootScope.$broadcast('alterarRegiao', reg);
      }

      scope.fuseEstados;
      DataService.estados().then(function(estados){
        scope.estados = estados;
        fuseEstados = new Fuse(estados, {
          keys: ['nomeSemAcento'],
          threshold: 0.3,
        });
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
        if(scope.$eval(attr.abrirModal) && !scope.regiao){
          modal.show();
        }
      });

      scope.regiaoSelecionada = function(regiao){
        scope.alterarRegiao(regiao);
        scope.modalRegiao.hide();
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
// .directive('jogStepper', [function(){
//   return {
//   	restrict: 'E',
//   	scope: {value: '='},
//     templateUrl: 'templates/directives/jog-stepper.html'
//   };
// }]);
