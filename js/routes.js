angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider, $injector) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

    .state('abasInicio', {
      url: '',
      abstract:true,
      templateUrl: 'templates/abasInicio.html'
    })

    .state('abasInicio.inicio', {
      url: '/inicio',
      views: {
        'aba-home': {
          templateUrl: 'templates/inicio.html'
        }
      }
    })

    .state('abasInicio.login-time', {
      url: '/login/:returnTo',
      cache: false,
      views: {
        'aba-time': {
          templateUrl: 'templates/login.html'
        }
      }
    })

    .state('interstitial', {
      url: '/interstitial',
      cache: true,
      templateUrl: 'templates/interstitial.html',
      params: {rota: null, parametros: null}
    })

    .state('selecionarPerfil', {
      url: '/selecionarPerfil',
      cache: false,
      templateUrl: 'templates/selecionarPerfil.html',
      params: {perfis: null, requerLogin: true, requerTime: false}
    })

    .state('signup', {
      url: '/signup',
      templateUrl: 'templates/signup.html'
    })

    .state('abasInicio.cadastrarTime', {
      url: '/cadastrarTime',
      cache: false,
      views: {
        'aba-time': {
          templateUrl: 'templates/times/cadastrarTime.html',
          controller: 'cadastrarTimeController'
        }
      },
      params: {requerLogin: true, requerTime: false}
    })

    .state('abasInicio.editarTime', {
      url: '/editarTime/:id',
      cache: false,
      views: {
        'aba-time': {
          templateUrl: 'templates/times/editarTime.html',
          controller: 'cadastrarTimeController'
        }
      }
    })

    .state('cadastrarArbitro', {
      url: '/cadastrarArbitro',
      cache: false,
      templateUrl: 'templates/arbitros/cadastrarArbitro.html',
      // params: {requerLogin: true, requerArbitro: false}
    })

    .state('editarArbitro', {
      url: '/editarArbitro/:id',
      cache: false,
      templateUrl: 'templates/arbitros/editarArbitro.html',
      controller: 'cadastrarArbitroController'
    })

    .state('editarHorariosArbitro', {
      url: '/editarHorariosArbitro',
      cache: false,
      templateUrl: 'templates/arbitros/editarHorarios.html',
      controller: 'editarHorariosArbitroController',
      params: {arbitro: null}
    })



    // .state('abasInicio.paginaDoArbitro-aba-time', {
    //   url: '/arbitro/:id',
    //   views: {
    //     'aba-time': {
    //       templateUrl: 'templates/arbitros/arbitro.html'
    //     }
    //   }
    // })
    .state('abasInicio.busca', {
      url: '/busca',
      views: {
        'aba-busca': {
          templateUrl: 'templates/times/buscaPorTimes.html'
        }
      }
    })
    .state('rankingTimes', {
      url: '/times/ranking',
      templateUrl: 'templates/times/rankingTimes.html'
    })


    .state('abasInicio.meuPerfil', {
      url: '/meuPerfil',
      // cache: false,
      views: {
        'aba-time': {
          templateUrl: 'templates/inicio.html'
        }
      },
      params: {requerLogin: true, requerArbitro: false}
    })


  .state('abasInicio.amistosos', {
    url: '/amistosos',
    views: {
      'aba-time': {
        templateUrl: 'templates/times/buscarAmistosos.html'
      }
    }
  })

  .state('abasInicio.propostaJogo', {
    url: '/propostaJogo/:id',
    views: {
      'aba-time': {
        templateUrl: 'templates/propostaJogo/verPropostaJogo.html'
      }
    }
  })

    .state('arbitro', {
      url: '/arbitro/:id',
      cache: false,
      templateUrl: 'templates/arbitros/arbitro.html',
      params: {requerLogin: true, requerArbitro: false}
    })

    .state('arbitroJogos', {
      url: '/arbitro/:id/jogos',
      templateUrl: 'templates/arbitros/jogos.html',
      params: {nomeArbitro: '', proximos: false,  requerLogin: true, requerArbitro: false},
      controller: function($stateParams, $scope, $ionicTabsDelegate){
        $scope.nomeArbitro = $stateParams.nomeArbitro;
        $scope.tipo = 'Arbitro';
        if($stateParams.proximos){
          $scope.$on('$ionicView.enter', function(){
            $ionicTabsDelegate.$getByHandle('abas-jogos-arbitro').select(1)
          });
          
        }
      }
    })    

    .state('arbitroSemConvite', {
      url: '/arbitroSemConvite',
      templateUrl: 'templates/arbitros/arbitroSemConvite.html',
      params: {requerLogin: true}
    })

    .state('abasInicio.meuTime', {
      url: '/meuTime',
      // cache: false,
      views: {
        'aba-time': {
          templateUrl: 'templates/times/time.html'
        }
      },
      params: {requerLogin: true, requerTime: true}
    })

    .state('novoJogo', {
      url: '/novoJogo',
      cache: false,
      templateUrl: 'templates/jogos/novoJogo.html',
      params: {requerLogin: true, requerTime: true}
    })

    .state('abasInicio.novoJogoSemTime', {
      url: '/novoJogoSemTime',
      cache: false,
      views: {
        'aba-novo-jogo': {
          templateUrl: 'templates/jogos/novoJogoSemTime.html'
        }
      }
    })

    .state('informarPlacar', {
      url: '/jogo/placar/:id',
      cache: false,
      params: {jogo: null},
      templateUrl: 'templates/jogos/informarPlacar.html'
    })

    .state('informarSumula', {
      url: '/jogo/:id/sumula/:time',
      cache: false,
      params: {jogo: null},
      templateUrl: 'templates/jogos/informarSumula.html'
    })

    .state('solicitarArbitragem', {
      url: '/jogo/:id/solicitarArbitragem',
      cache: false,
      params: {jogo: null, ligas: null},
      templateUrl: 'templates/ligaAmistosos/solicitarArbitragem.html'
    })

    .state('aceitarConviteArbitro', {
      url: '/liga/:ligaId/convite/:token',
      cache: false,
      templateUrl: 'templates/ligaAmistosos/convite.html'
    })



    .state('liga_editar', {
      url: '/liga/:id/editar',
      cache: false,
      templateUrl: 'templates/ligaAmistosos/editarLiga.html',
      controller: 'cadastrarLigaController'
    })

    .state('liga_configurar', {
      url: '/liga/:id/configurar',
      cache: false,
      templateUrl: 'templates/ligaAmistosos/configuracao.html',
      controller: 'ligaConfiguracaoController'
    })

    .state('liga_novoJogo', {
      url: '/liga/:id/novoJogo',
      cache: false,
      templateUrl: 'templates/jogos/novoJogoLiga.html'
    })    
    

    .state('ranking_cadastrar', { //cadastrarRanking
      url: '/liga/:id/cadastrarRanking',
      templateUrl: 'templates/ranking/cadastrarRanking.html',
      cache: false
    })

    .state('ranking_editar', { //editarRanking
      url: '/ranking/:id/editar',
      templateUrl: 'templates/ranking/cadastrarRanking.html',
      cache: false
    })

  //   .state('buscarAmistosos', {
  //     url: '/amistosos',
  //     cache: false,
  //     templateUrl: 'templates/times/buscarAmistosos.html'
  //   })
  // ;

  var statesCoringa = {
    'time': {
      url: '/time/:id/:temporada',
      templateUrl: 'templates/times/time.html'
    },
    'time_estatisticas': {
      url: '/time/:id/:temporada/estatisticas',
      templateUrl: 'templates/times/estatisticas.html'
    },
    'jogo': {
      url: '/jogo/:id',
      templateUrl: 'templates/jogos/jogo.html'
    },
    'liga': {
      url: '/liga/:id',
      templateUrl: 'templates/ligaAmistosos/liga.html',
      // params: {requerLogin: false, requerArbitro: false}
    },
    'liga_jogos': {
      url: '/liga/:id/jogos',
      templateUrl: 'templates/ligaAmistosos/jogosLiga.html',
      cache: false,
      params: {nomeLiga: '', proximos: false, filtro: '', editavel: false},
      controller: function($stateParams, $scope, $ionicTabsDelegate){
        $scope.nomeLiga = $stateParams.nomeLiga;
        $scope.editavel = $stateParams.editavel;
        $scope.tipo = 'Liga';
        $scope.proximos = $stateParams.proximos;

        $scope.mostrarEncerrados = function(){
          $scope.proximos = false;          
        }

        $scope.mostrarProximos = function(){
          $scope.proximos = true;
        }
      }
    },
    'liga_times': {
      url: '/liga/:id/times',
      templateUrl: 'templates/ligaAmistosos/times.html',
      params: {nomeLiga: ''}
    },
    'liga_ranking': {
      url: '/ranking/:id',
      templateUrl: 'templates/ranking/ranking.html',
      cache: false
    },
    'ranking_jogos': {
      url: '/ranking/:id/jogos',
      templateUrl: 'templates/ranking/jogosRanking.html',
      params: {nomeRanking: '', proximos: false},
      controller: function($stateParams, $scope, $ionicTabsDelegate){
        $scope.nomeRanking = $stateParams.nomeRanking;
        $scope.tipo = 'Ranking';
        $scope.proximos = $stateParams.proximos;

        $scope.mostrarEncerrados = function(){
          $scope.proximos = false;          
        }

        $scope.mostrarProximos = function(){
          $scope.proximos = true;
        }
      }
    },
    'ranking_time': {
      url: '/ranking/:rankingId/time/:id',
      templateUrl: 'templates/ranking/timeRanking.html',
      params: {timeRanking: null},
      cache: false
    },
  };

  _.each(statesCoringa, function(params, state){
    var novoParams = _.cloneDeep(params);
    _.set(novoParams, 'params.coringa', true);
    $stateProvider.state(state, novoParams);

    var abas = ['aba-home', 'aba-busca', 'aba-time'];
    for (var i = 0; i < abas.length; i++) {
      var aba = abas[i];
      var novoState = 'abasInicio.' + state + '-' + aba;
      var novoParams = _.clone(params);
      _.set(novoParams, ['views', aba], {
          templateUrl: novoParams.templateUrl,
          controller: novoParams.controller
      });
      $stateProvider.state(novoState, novoParams);
    }
  });


  // if none of the above states are matched, use this as the fallback
  // $urlRouterProvider.otherwise('/meuTime');
  $urlRouterProvider.otherwise(function($injector, $location){
      var $state = $injector.get("$state");
      // $state.go('abasInicio.meuTime');
      $state.go('abasInicio.meuPerfil');
  });

});
