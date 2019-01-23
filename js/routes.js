angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

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

    .state('abasInicio.paginaDoTime-aba-busca', {
      url: '/time/:id/:temporada',
      views: {
        'aba-busca': {
          templateUrl: 'templates/times/time.html'
        }
      }
    })

    .state('abasInicio.paginaDoTime-aba-home', {
      url: '/time/:id/:temporada',
      views: {
        'aba-home': {
          templateUrl: 'templates/times/time.html'
        }
      }
    })

    .state('abasInicio.paginaDoTime-aba-time', {
      url: '/time/:id/:temporada',
      views: {
        'aba-time': {
          templateUrl: 'templates/times/time.html'
        }
      }
    })

    .state('abasInicio.jogo-aba-home', {
      url: '/jogo/:id',
      views: {
        'aba-home': {
          templateUrl: 'templates/jogos/jogo.html'
        }
      }
    })

    .state('abasInicio.jogo-aba-time', {
      url: '/jogo/:id',
      views: {
        'aba-time': {
          templateUrl: 'templates/jogos/jogo.html'
        }
      }
    })

    .state('abasInicio.jogo-aba-busca', {
      url: '/jogo/:id',
      views: {
        'aba-busca': {
          templateUrl: 'templates/jogos/jogo.html'
        }
      }
    })

    .state('abasInicio.busca', {
      url: '/busca',
      views: {
        'aba-busca': {
          templateUrl: 'templates/times/buscaPorTimes.html'
        }
      }
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
    ;

  // if none of the above states are matched, use this as the fallback
  // $urlRouterProvider.otherwise('/meuTime');
  $urlRouterProvider.otherwise(function($injector, $location){
      var $state = $injector.get("$state");
      $state.go('abasInicio.meuTime');
  });

});
