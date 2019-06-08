angular
  .module('app.services')
  .service('AuthService', function($q, $http, DataService, $ionicModal, $rootScope, $state, $ionicHistory, $auth, $ionicPopup, $ionicPlatform) {
    // var stateAfterLogin;
    var usuarioLogado = null;
    var notificationTokenAntesLogin = null;
    var notificationTokenTypeAntesLogin = null;

    $rootScope.$on('token.expired', function(){
      // refazerLogin();
      $ionicPopup.alert({
        title: 'Erro',
        content: 'Para garantir que somente você esteja acessando sua conta, será necessário logar novamente.'
      }).then(function(){
        logout();
      });
    });

    $rootScope.$on('$stateChangeStart', function (event, nextState, currentState) {
      if(nextState.name == 'novoJogo' && !temTime()){
        redirectClean('abasInicio.novoJogoSemTime', event);
      } else if(nextState.name == 'abasInicio.novoJogoSemTime' && temTime()){
        event.preventDefault();
        $state.go('novoJogo');
        // redirectClean('novoJogo', event);
      } else if(nextState.name == 'abasInicio.login-time' && isAuthenticated()){
        redirectClean('abasInicio.meuTime', event);
      }  else if( (stateRequerLogin(nextState) && !isAuthenticated() ) || (stateRequerTime(nextState) && !temTime())){
        // stateAfterLogin = nextState.name;
        if(!isAuthenticated()){
          redirectClean('abasInicio.login-time', event);
        } else {
          redirectClean('abasInicio.cadastrarTime', event);
        }
      }
    });

    function redirectClean(state, event){
      $rootScope.$broadcast('$stateChangeError');
      if(event) {event.preventDefault();}
      $ionicHistory.nextViewOptions({
        disableAnimate: true,
        disableBack: true
      });
      $state.go(state, {location: 'replace'}, {reload: true});
    }

    function getUsuarioLogado(){
      if(!usuarioLogado){
        usuarioLogado = JSON.parse(window.localStorage.getItem('user_data'));
      }
      return usuarioLogado;
    }

    function stateRequerTime(state){
      return state.params && state.params.requerTime;
    }

    function stateRequerLogin(state){
      return state.params && state.params.requerLogin;
    }

    function redirectAfterLogin(){
      redirectClean('abasInicio.meuTime')
    }

    function isAuthenticated() {
      var usuarioLogado = getUsuarioLogado();
      return usuarioLogado && usuarioLogado._id;
    }

    var login = function(provider){
      $ionicPlatform.ready(function() {
        if(window.plugins && window.plugins.googleplus){
          window.plugins.googleplus.login(
            {'webClientId': '526695492966-sk3hr67mov4mmfp1fb2nrbkdqienhhos.apps.googleusercontent.com'}, // optional clientId of your Web application from Credentials settings of your project - On Android, this MUST be included to get an idToken. On iOS, it is not required.
            function (user_data) {
              DataService.login({idToken: user_data.idToken}).then(function(usuario){
                usuarioLogado = usuario;
                window.localStorage.setItem('user_data', JSON.stringify(usuario));
                if(notificationTokenAntesLogin){
                  setNotificationToken(notificationTokenAntesLogin, notificationTokenTypeAntesLogin);
                }
                redirectAfterLogin();
              });
            },
            function (msg) {
              $ionicPopup.alert({
                title: 'Erro',
                content: 'Não foi possível efetuar o login. Favor, tentar novamente.'
              });
              console.log(msg);
            }
          );
        } else {
            DataService.login({idToken: "token"}).then(function(usuario){
              usuarioLogado = usuario;
              window.localStorage.setItem('user_data', JSON.stringify(usuario));
              redirectAfterLogin();
            });
        }
      });
    }

    var logout = function(){
      usuarioLogado = null;
      window.localStorage.removeItem('user_data');
      if(window.plugins && window.plugins.googleplus){
        window.plugins.googleplus.disconnect();
      }
      redirectClean('abasInicio.meuTime');
    }

    var temTime = function() { return isAuthenticated() && getUsuarioLogado() && getUsuarioLogado().time;}

    function atualizarTime(time, token){
      if(time){
        time.escudo = time.escudo || (usuarioLogado.time? usuarioLogado.time.escudo : '');
      }
      usuarioLogado.time = time;
      if(token){
        usuarioLogado.token = token;
      }
      window.localStorage.setItem('user_data', JSON.stringify(usuarioLogado));
    }

    function checarCidadeDoTimeLogado(){
      //tem time, mas não tem cidade guardada na sessão
      if(temTime() && !_.get(getTime(), 'cidade')){
        var timeLogado = getTime();
        DataService.time(getTime()._id).then(function(time){
          if(time.cidade){
            timeLogado.cidade = time.cidade;
            atualizarTime(timeLogado);
          } else {
            //caso a cidade não esteja cadastrada, pedir para ele cadastrar
          }
        });
      }
    }

    function setNotificationToken(registrationId, registrationType){
      var notificationToken = window.localStorage.getItem('notificationToken');
      //Caso não esteja salvo no localStorage ou seja diferente, o registro será eviado para o servidor
      if(isAuthenticated() && notificationToken != registrationId){
        //Só atualiza o localStorage se conseguir salvar no servidor.
        DataService.setNotificationToken(getUsuarioLogado()._id, notificationToken, registrationId, registrationType).then(function(){
          window.localStorage.setItem('notificationToken', registrationId);
        });
      } else if(!isAuthenticated()){
        notificationTokenAntesLogin = registrationId;
        notificationTokenTypeAntesLogin = registrationType;
      }
    }

    function getTime() {
      return getUsuarioLogado() ? getUsuarioLogado().time : null
    }

    return {
      login: login,
      logout: logout,
      isAuthenticated: isAuthenticated,
      username: function() {return getUsuarioLogado().nome;},
      getUsuarioId: function() { return getUsuarioLogado()._id},
      getTime: getTime,
      getRegiao: function() { return getUsuarioLogado() ? _.get(getUsuarioLogado().time, 'cidade.uf') : null},
      getCidade: function() { return getUsuarioLogado() ? _.get(getUsuarioLogado().time, 'cidade') : null},
      temTime: temTime,
      atualizarTime: atualizarTime,
      checarCidadeDoTimeLogado: checarCidadeDoTimeLogado,
      getToken: function(){ return getUsuarioLogado() ? getUsuarioLogado().token : null},
      setNotificationToken: setNotificationToken,
    };
});
