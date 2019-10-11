// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('app', ['ionic', 'ngCordova', 'satellizer', 'app.controllers', 'app.routes', 'app.directives', 'app.components', 'app.services', 'ui.utils.masks'])
.constant('config', {
  // URL_S3:  'http://jogueiros-fc-uploads.s3-website-sa-east-1.amazonaws.com/',
  URL_IMAGEBOSS:  'https://img.imageboss.me/',
  URL_S3:  'https://s3-sa-east-1.amazonaws.com/jogueiros-fc-uploads/',
  URL_API: 'https://jogueiros-fc-api.herokuapp.com/',
  // URL_API: 'http://localhost:3000/',
  // URL_API: 'http://10.0.0.104:3000/',
  // TIPO_APP: 'ARBITRAGEM', //TIPO_APP: 'TIME'
  URL_SITE: 'https://jogueirosfc.com/'

})
.run(function($ionicPlatform, AuthService, LoadingService, $state, DataService, $location, $timeout, $ionicHistory) {

  window.dataService = DataService;


  $ionicPlatform.ready(function() {

    if (window.PushNotification){
      var push = PushNotification.init({
        android: {},
        ios: {
          // senderID: 526695492966,
          // gcmSandbox: true, //SERVER_KEYS.BUILD_ENVIRONMENT === 'development',
          alert: "true",
          badge: true,
          sound: 'false'
        },
        windows: {}
      });

      push.on('registration', function(data) {
        AuthService.setNotificationToken(data.registrationId, data.registrationType);
      });

      push.on('notification', function(data) {
        //Só efetua a ação se o aplicativo não estiver aberto.
        if(!data.additionalData.foreground){
            var params = data.additionalData.redirectParams;
            try{
              params = (typeof params === 'string') ? JSON.parse(params) : params;
            } catch (error) { //caso a string do json venha mal formatada...
              params = {};
            }

            if(data.additionalData.redirectState == 'abasInicio.jogo-aba-time'){
              data.additionalData.redirectState = 'jogo';
            }

            if(data.additionalData.perfilId){
              AuthService.atualizarPerfisUsuario().then(function(){
                AuthService.setPerfilbyId(data.additionalData.perfilId);
                $ionicHistory.nextViewOptions({
                  historyRoot: true
                });
                if(AuthService.getArbitro() || AuthService.getLiga()){
                  params.coringa = false;
                }
                $state.go(data.additionalData.redirectState, params);
              });
            } else {
              $state.go(data.additionalData.redirectState, params);
            }
            
        }
      });

      push.on('error', function(e) {
        window.dataService.logError(e);
      });
    }

    if(window.IonicDeeplink){
      IonicDeeplink.route(
        {
          // http://localhost:8100/#/liga/5d32350c862550caad95e5f0/convite/38f74083a9cfd81a1ecc50d036b329ad
          // '/#/liga/:ligaId/convite/:token': {
          '/': {
            target: 'qualquerUrl',
            // parent: 'products'
          }
        }
        ,function(match) {
          $timeout(function(){
            $location.url(match.$link.fragment);
          });
            // $state.go();
        }
        ,function(nomatch) {
          console.warn('No match', nomatch);
        }
      );
    } 

    AuthService.checarCidadeDoTimeLogado();
    AuthService.atualizarPerfisUsuario();

    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    if(window.cordova && cordova.InAppBrowser.open){
      window.open = cordova.InAppBrowser.open;    
    }

  });
})
.config(function($ionicConfigProvider, $httpProvider, $authProvider, config, $provide, $injector) {
  $ionicConfigProvider.backButton.text('').icon('ion-ios-arrow-back');
  $ionicConfigProvider.backButton.previousTitleText(false);
  $ionicConfigProvider.tabs.position('bottom');
  $ionicConfigProvider.navBar.alignTitle('left');
  $ionicConfigProvider.scrolling.jsScrolling(false);
  $authProvider.google({
    url: config.URL_API + 'auth/google',  
    // redirectUri: 'https://jogueiros-fc-api.herokuapp.com/ok',
    clientId: '526695492966-sk3hr67mov4mmfp1fb2nrbkdqienhhos.apps.googleusercontent.com',
    scope: ['profile', 'email'],
    popupOptions: {
      location: 'no',
      toolbar: 'yes',
      width: window.screen.width,
      height: window.screen.height
    }
  });

  $provide.decorator("$exceptionHandler", function($delegate) {
    return function(exception, cause) {
      $delegate(exception, cause);
      // window.dataService.logError(exception.stack);
    };
  });

});

angular.module('app.controllers', ['angular.filter']);
angular.module('app.services', ['angular-cache']);
