angular.module('app.directives')
.directive('jogEscolherRegiao', ['$ionicModal', 'DataService', 'PerfilFiltroService', function($ionicModal, DataService, PerfilFiltroService){
  return {
    restrict: 'A',
    scope: {aoAlterar: '&'},
    link: function(scope, el, attr) {
      var fuseEstados;
      scope.estados = [];      

      DataService.esportes().then(function(esportes){
        scope.esportes = esportes;
      });

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

      scope.perfilFiltro = PerfilFiltroService.getAtual();
      scope.efootball = _.get(scope.perfilFiltro, 'esporte.efootball');
      inicializar();

      scope.alterarPerfilFiltro = function(){
        // $rootScope.$broadcast('alterarRegiao', scope.perfilFiltro);
        scope.aoAlterar({ filtro: scope.perfilFiltro });
        scope.modalRegiao.hide();
      }

      
      DataService.estados().then(function(estados){
        scope.estados = estados;
        fuseEstados = new Fuse(estados, {
          keys: ['nomeSemAcento'],
          threshold: 0.3,
        });
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
        // scope.perfilFiltro.esporte = _.find(scope.esportes, {chave: 'FUT'});
        scope.perfilFiltro.plataforma = null;
        scope.perfilFiltro.regiao = estado.uf || estado;
        scope.perfilFiltro.cidade = null;
        scope.alterarPerfilFiltro();
      }

      scope.esporteSelecionado = function(esporte){
        scope.perfilFiltro.esporte = esporte;
        scope.perfilFiltro.plataforma = null;
        scope.perfilFiltro.chavePlataforma = null;
        scope.alterarPerfilFiltro();
      }

      scope.outroEsporteSelecionado = function(esporte){
        scope.perfilFiltro.esporte = esporte;
        scope.efootball = esporte.efootball;
        inicializar();
        if(esporte.efootball){
          scope.esporteSelecionado(esporte);
        } else {
          scope.modalRegiao.show();
        }
      }

      scope.plataformaSelecionada = function(plataforma){
        scope.perfilFiltro.plataforma = plataforma;
        scope.alterarPerfilFiltro();
      }

    //   scope.alternarEfootball = function(efootball){
    //     scope.efootball = efootball;
    //     inicializar();
    //   }

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