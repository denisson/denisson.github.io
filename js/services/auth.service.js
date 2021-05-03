angular
  .module('app.services')
  .service('AuthService', function($q, $http, DataService, $ionicModal, $rootScope, $state, $ionicHistory, $auth, $ionicPopup, $ionicPlatform) {
    // var stateAfterLogin;
    var usuarioLogado = null;
    var notificationTokenAntesLogin = null;
    var notificationTokenTypeAntesLogin = null;
    var modalSelecionarPerfil = null;

    $rootScope.$on('token.expired', function(){
      // refazerLogin();
      $ionicPopup.alert({
        title: 'Erro',
        content: 'Para garantir que somente você esteja acessando sua conta, será necessário logar novamente.'
      }).then(function(){
        logout();
      });
    });

    $rootScope.$on('$stateChangeStart', function (event, nextState, toParams) {
      if(stateCoringa(nextState, event, toParams)){
          return;
      }

      if(nextState.name == 'abasInicio.meuPerfil'){
        goToInicioPerfil(getPerfilAtivo(), event);
        return;
      }

      if(nextState.name == 'novoJogo' && !getTime()){
        redirectClean('abasInicio.novoJogoSemTime', event);
      } else if(nextState.name == 'abasInicio.novoJogoSemTime' && getTime()){
        event.preventDefault();
        $state.go('novoJogo');
        // redirectClean('novoJogo', event);
      } else if(nextState.name == 'abasInicio.login-time' && isAuthenticated()){
        redirectClean('abasInicio.meuTime', event);
        // redirectClean('abasInicio.meuPerfil', event);
      }  else if( (stateRequerLogin(nextState) && !isAuthenticated() ) || (stateRequerTime(nextState) && !getTime())){
        // stateAfterLogin = nextState.name;
        if(!isAuthenticated()){
          redirectClean('abasInicio.login-time', event);
        } else {
          redirectClean('selecionarPerfil', event);
        }
      }
    });
    

    function stateCoringa(nextState, event, toParams){
      if(_.get(nextState, 'params.coringa') && _.get(toParams, 'coringa') !== false ){
        var currentViews = _.get($state, 'current.views');
        if(currentViews){
          var abaAtual = currentViews ? Object.keys(currentViews)[0] : 'aba-time';
          _.set(toParams, 'coringa', false);
          redirectClean('abasInicio.' + nextState.name + '-' + abaAtual, event, toParams);
          return true;
        }
      }
      return false;
    }

    function goToInicioPerfil(perfil, event){
      switch(_.get(perfil, 'tipo')){
        case 'Liga':
          return redirectClean('liga', event);
        case 'Time':
          return redirectClean('abasInicio.meuTime', event);
        case 'Arbitro':
          return redirectClean('arbitro', event);
        default:
          return redirectClean('selecionarPerfil', event);
      }
    }

    function clearHistory(){
      $ionicHistory.nextViewOptions({
          historyRoot: true
      })
    }

    function goToCadastro(){
      if(getConvite('Arbitro')){
        redirectClean('cadastrarArbitro');
        return;
      }
      redirectClean('abasInicio.cadastrarTime');
    }


    function redirectClean(state, event, params){
      if(event) {
        $rootScope.$broadcast('$stateChangeError');
        event.preventDefault();
        $ionicHistory.nextViewOptions({
          disableAnimate: true,
          // disableBack: true
        });
      } else {
        $ionicHistory.removeCurrentView();  
      }
      var parametros = params || {};
      return $state.go(state, parametros, {location: 'replace'});
    }

    function getPerfilAtivo(){
      return getUsuarioLogado() ? getUsuarioLogado().perfil : null;
    }

    function getUsuarioLogado(){
      if(!usuarioLogado){
        usuarioLogado = JSON.parse(window.localStorage.getItem('user_data'));
      }
      return usuarioLogado;
    }

    function getConvite(papel){
      return _.get(getUsuarioLogado(), 'convite.papel') == papel ? _.get(getUsuarioLogado(), 'convite') : null;
    }

    function limparConvite(papel){
      var usuario = getUsuarioLogado();
      if (_.get(usuario, 'convite.papel') == papel){
        delete usuario['convite'];
        setUserData(usuario);
      }
    }
    
    function salvarConvite(convite){
      var usuario = getUsuarioLogado();
      usuario.convite = convite;
      setUserData(usuario);
    }


    function stateRequerTime(state){
      return state.params && state.params.requerTime;
    }

    function stateRequerArbitro(state){
      return state.params && state.params.requerArbitro;
    }

    function stateRequerLogin(state){
      return state.params && state.params.requerLogin;
    }

    function redirectAfterLogin(perfis, loginTelaArbitro){

      //caso o login tenha sido feito da tela de login de arbitragem e o usuário não tenha nenhum perfil de árbitro
      if ( loginTelaArbitro && !_.some(perfis, {tipo: 'Arbitro'}) ) {
        redirectClean('arbitroSemConvite');
        return;
      }

      if(temConviteArbitroSemCadastro(perfis)){
        goToCadastro();
        return;
      }

      if(soTemPerfilTime(perfis)){
        atualizarPerfilCompleto(perfis[0]);
      }

      goToInicioPerfil(getPerfilAtivo());
      // redirectClean('abasInicio.meuPerfil');
    }

    function soTemPerfilTime(perfis){
      return (perfis && perfis.length == 1 && perfis[0].tipo == 'Time');
    }

    function temConviteArbitroSemCadastro(perfis){
      var convite = getConvite('Arbitro');
      //tem convite, mas já tem um perfil de árbitro para a mesma liga do convite que ele recebeu.
      return convite && !_.some(perfis, {tipo: 'Arbitro', perfil: convite.ligaId});
    }

    function isAuthenticated() {
      var usuarioLogado = getUsuarioLogado();
      return usuarioLogado && usuarioLogado.id;
    }

    function lookupUser(provider, info, options){
      DataService.login(provider, info).then(function(usuario){
        if(options.convite) {usuario.convite = options.convite};
        setUserData(usuario);
        setPerfisUsuario(usuario.perfis);
        if(notificationTokenAntesLogin){
          setNotificationToken(notificationTokenAntesLogin, notificationTokenTypeAntesLogin);
        }
        redirectAfterLogin(usuario.perfis, options.loginTelaArbitro);
      }).catch(function(err){
        DataService.logError(err);
      });
    }

    function erroLogin(msg) {
      $ionicPopup.alert({
        title: 'Erro',
        content: 'Não foi possível efetuar o login. Favor, tentar novamente.'
      });
      DataService.logError(msg);
    }

    var login = function(provider, options){
      if(provider == 'google'){
        loginGoogle(provider, options);
      } else if(provider == 'apple') {
        loginApple(provider, options);
      }
    }

    var loginGoogle = function(provider, options){
      $ionicPlatform.ready(function() {
        if(window.plugins && window.plugins.googleplus){
          window.plugins.googleplus.login(
            {'webClientId': '526695492966-sk3hr67mov4mmfp1fb2nrbkdqienhhos.apps.googleusercontent.com'}, // optional clientId of your Web application from Credentials settings of your project - On Android, this MUST be included to get an idToken. On iOS, it is not required.
            function (user_data) {
              lookupUser(provider, {idToken: user_data.idToken}, options);
            },
            erroLogin
          );
        } else {
            DataService.logError("if(window.plugins && window.plugins.googleplus) retornou false");
        }
      });
    }

    var loginApple = function(provider, options){

      window.cordova.plugins.SignInWithApple.signin(
        { requestedScopes: [0, 1] },
        function(userInfo){
          lookupUser(provider, userInfo, options);
        },
        erroLogin
      )
    }

    var logout = function(){
      usuarioLogado = null;
      window.localStorage.removeItem('user_data');
      if(window.plugins && window.plugins.googleplus){
        window.plugins.googleplus.disconnect();
      }
      redirectClean('abasInicio.login-time');
    }

    function atualizarPerfilCompleto(perfilCompleto){
      perfilCompleto.cidade = perfilCompleto.perfil.cidade;
      perfilCompleto.esporte = perfilCompleto.perfil.esporte;
      perfilCompleto.efootball = perfilCompleto.perfil.efootball;
      perfilCompleto.modalidade = perfilCompleto.perfil.modalidade;
      perfilCompleto.idade = perfilCompleto.perfil.idade;
      perfilCompleto.genero = perfilCompleto.perfil.genero;
      perfilCompleto.pro = perfilCompleto.perfil.pro;
      perfilCompleto.dono = perfilCompleto.perfil.dono;
      perfilCompleto.perfil = perfilCompleto.perfil._id;
      atualizarPerfil(perfilCompleto, perfilCompleto.token);
    }

    function atualizarPerfil(perfil, token){
      var user = getUsuarioLogado();
      user.perfil = perfil;
      if(token){
        user.token = token;
      }
      setUserData(user);
    }

    function setUserData(user){
      usuarioLogado = _.pick(user, ['id', 'token', 'perfil', 'perfis', 'convite', 'pro']);
      window.localStorage.setItem('user_data', JSON.stringify(usuarioLogado));
    }

    function setPerfisUsuario(perfisCompletos){
      var perfis = perfisCompletos;

      var user = getUsuarioLogado();
      if(user) user.perfis = perfis;
      setUserData(user);
    }

    function atualizarPerfisUsuario(){
      if(isAuthenticated()) {
        return DataService.usuarioPerfis().then(function(usuario){
          setUserPro(usuario.pro);
          setPerfisUsuario(usuario.perfis);
          atualizarTokenPerfilAtivo(usuario);
        });        
      } else {
        return Promise.resolve([]);
      }
    }

    function atualizarTokenPerfilAtivo(usuario){
      var perfilAtivo = getPerfilAtivo();
      if(perfilAtivo){
        var perfil = _.find(usuario.perfis, function(p){
          return p.perfil._id ==  perfilAtivo.perfil
        });//encontra o perfil na lista que veio do server para ter acesso ao novo token
        if(perfil) {
          atualizarPerfilCompleto(perfil);
        } else {
          atualizarPerfil(null);
        }
      }
      setUserPro(usuario.pro);
    }

    function setUserPro(pro){
      var user = getUsuarioLogado();
      
      if(user.pro !== pro) {
        user.pro = pro;
        setUserData(user);
      }
    }

    function atualizarPerfilTime(alteracoes){
      var perfil = getPerfilAtivo();
      perfil.cidade = alteracoes.cidade;
      perfil.esporte = alteracoes.esporte;
      perfil.efootball = alteracoes.efootball;
      perfil.efootball = alteracoes.efootball;
      perfil.efootball = alteracoes.efootball;
      perfil.efootball = alteracoes.efootball;
      perfil.modalidade = alteracoes.modalidade;
      perfil.idade = alteracoes.idade;
      perfil.genero = alteracoes.genero;
      atualizarPerfil(perfil);
    }
    
    function checarCidadeDoTimeLogado(){
      //tem time, mas não tem cidade guardada na sessão
      if(getTime() && !getCidade()){
        DataService.time(getTime()).then(function(time){
          if(time.cidade){
            atualizarPerfilTime({cidade: time.cidade});
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
        DataService.setNotificationToken(getUsuarioId(), notificationToken, registrationId, registrationType).then(function(){
          window.localStorage.setItem('notificationToken', registrationId);
        });
      } else if(!isAuthenticated()){
        notificationTokenAntesLogin = registrationId;
        notificationTokenTypeAntesLogin = registrationType;
      }
    }

    function getTime() {
      return getPerfilId('Time');
    }

    function getArbitro() {
      return getPerfilId('Arbitro');
    }

    function getLiga() {
      return getPerfilId('Liga');
    }

    function getPerfilId(tipo){
      var perfil = getPerfilAtivo();
      return perfil && perfil.tipo == tipo ? perfil.perfil : null;
    }

    function getCidade(){
      return _.get(getPerfilAtivo(), 'cidade');
    }

    function getUsuarioId(){
      return getUsuarioLogado() ? getUsuarioLogado().id : null;
    }

    function temMaisPerfis(){
      var user = getUsuarioLogado();
      return user && user.perfis && (user.perfis.length > 1); //tem mais de um perfil
    }

    function setPerfilbyId(perfilId){
      if(temMaisPerfis()){
        var perfil = _.find(getUsuarioLogado().perfis, {perfil: {_id: perfilId }});
        if(perfil){
          atualizarPerfilCompleto(perfil);
        }
      }
    }

    function getRegiao(){
      return _.get(getPerfilAtivo(), 'cidade.uf');
    }

    function getCidade(){
      return _.get(getPerfilAtivo(), 'cidade');
    }

    function getPerfilFiltro(){
      var perfil = getPerfilAtivo();
      return {
        esporte: _.get(perfil, 'esporte'),
        regiao: getRegiao(),
        cidade: getCidade(),
        plataforma: _.get(perfil, 'efootball.plataforma'),
        modalidade: _.get(perfil, 'modalidade'),
        idade: _.get(perfil, 'idade'),
        genero: _.get(perfil, 'genero'),
        modos: _.get(perfil, 'efootball.modos')
      }
    }

    function isPerfilEfootball(){
      var perfil = getPerfilAtivo();
      return _.get(perfil, 'esporte.efootball');
    }

    function isUsuarioPro(){
      var user = getUsuarioLogado();
      return user && user.pro;
    }

    function isTimePro(){
      var perfil = getPerfilAtivo();
      return perfil && perfil.tipo == 'Time' && perfil.pro;
    }

    function getPrimeiroTime(){
      var user = getUsuarioLogado();
      if( user ){ 
        return _.find(user.perfis, {tipo: 'Time'});
      } else {
        return null;
      }
    }
    
    function adminJogueiros(){
      return getUsuarioId() == '59a0e025a9e74b00116d322e';
    }

    return {
      login: login,
      logout: logout,
      isAuthenticated: isAuthenticated,
      getUsuarioId: getUsuarioId,
      getTime: getTime,
      getArbitro: getArbitro,
      getLiga: getLiga,
      getRegiao: getRegiao,
      getCidade: getCidade,
      atualizarPerfil: atualizarPerfil,
      atualizarPerfilCompleto: atualizarPerfilCompleto,
      atualizarPerfilTime: atualizarPerfilTime,
      setPerfisUsuario: setPerfisUsuario,
      atualizarPerfisUsuario: atualizarPerfisUsuario,
      temMaisPerfis: temMaisPerfis,
      setPerfilbyId: setPerfilbyId,
      // temArbitroVinculado: temArbitroVinculado,
      checarCidadeDoTimeLogado: checarCidadeDoTimeLogado,
      getToken: function(){ return getUsuarioLogado() ? getUsuarioLogado().token : null},
      setNotificationToken: setNotificationToken,
      goToInicioPerfil: goToInicioPerfil,
      goToCadastro: goToCadastro,
      getPerfilAtivo: getPerfilAtivo,
      redirectAfterLogin: redirectAfterLogin,
      getConvite: getConvite,
      limparConvite: limparConvite,
      salvarConvite: salvarConvite,
      redirectClean: redirectClean,
      getPerfilFiltro: getPerfilFiltro,
      isPerfilEfootball: isPerfilEfootball,
      isUsuarioPro: isUsuarioPro,
      setUserPro: setUserPro,
      isTimePro: isTimePro,
      getPrimeiroTime: getPrimeiroTime,
      adminJogueiros: adminJogueiros,
    };
});
