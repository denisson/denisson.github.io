
angular.module('app.services')
.service('DataService', ['$rootScope', '$q', '$http', 'CacheFactory', '$cordovaFileTransfer', 'config', '$injector', function($rootScope, $q, $http, CacheFactory, $cordovaFileTransfer, config, $injector){
	var blockPopup = false;

	function tratarRequisicao(requisicao){

		if(!blockPopup) {
			$rootScope.$emit('loading.init');
		} else {
			blockPopup = false;
		}
		var deferred = $q.defer();
		requisicao.then(
        function(response){
          $rootScope.$emit('loading.finish');
          deferred.resolve(response.data);
        },
        function(response){
        	if (response.status == 401 && response.data.expired) {
        		$rootScope.$emit('token.expired');
        	}
			$rootScope.$emit('loading.finish');
			deferred.reject(response);
        }
      );
      return deferred.promise;
	}

	function defaultOptions(){
		var AuthService = $injector.get('AuthService');
		return {headers: {'x-token': AuthService.getToken()}};
	}

    function deleteRequest(url){
      var requisicao = $http.delete(config.URL_API + url, defaultOptions());
      return tratarRequisicao(requisicao);
  	}

    function request(url){
		var requisicao = $http.get(config.URL_API + url, defaultOptions());
		return tratarRequisicao(requisicao);
  	}

    function post(url, dados){
		var requisicao = $http.post(config.URL_API + url, dados, defaultOptions());
		return tratarRequisicao(requisicao);
    }

    function upload(url, arquivo, dados){
    	var AuthService = $injector.get('AuthService');
    	if(window.plugins && arquivo){
			var deferred = $q.defer();
			$rootScope.$emit('loading.init');
			var options = {
				params: {dados: JSON.stringify(dados)},
				headers: {
					'x-token': AuthService.getToken(),
		        	Connection: "close"
		    	}
			};
			$cordovaFileTransfer.upload(config.URL_API + url, arquivo, options).then(function(result) {
		        console.log(result);
		        deferred.resolve(JSON.parse(result.response));
		        $rootScope.$emit('loading.finish');
		      }, function(err) {
		      	$rootScope.$emit('loading.finish');
		        console.log(err);
		      }, function (progress) {
		        console.log(progress);
		      }
		    );
			return deferred.promise;
    	} else {
			return post(url, {dados: dados});
    	}
    }

	CacheFactory('dataCache', {
    // maxAge: 15 * 60 * 1000, // Items added to this cache expire after 15 minutes
    // cacheFlushInterval: 60 * 60 * 1000, // This cache will clear itself every hour
    // deleteOnExpire: 'aggressive', // Items will be deleted from this cache when they expire
    storageMode: 'localStorage' // This cache will use `localStorage`.
	});

	// $http.defaults.cache = CacheFactory.get('dataCache');
	return {
		blockPopup: function(){
			blockPopup = true;
		},
		login: function(userData){
			return post('login/google', userData);
		},
		jogosEncerrados: function(pag, porPag, regiao){
			return request('jogos/encerrados?pag=' + pag + '&porPag=' + porPag + '&regiao=' + regiao);
		},
		jogosFuturos: function(pag, porPag, regiao){
			return request('jogos/proximos?pag=' + pag + '&porPag=' + porPag + '&regiao=' + regiao);
		},
		jogosRodada: function(pag, porPag){
			return request('jogos/rodada?pag=' + pag + '&porPag=' + porPag);
		},
		time: function(id){
			return request('time/' + id + '?jogadores=false&jogos=false');
		},
		timeJogadores: function(id){
			return request('time/' + id + '?jogadores=true');
		},
		timeJogos: function(id, temporada){
			temporada = temporada || moment().year();
			return request('time/' + id + '?jogadores=true&jogos=true&temporada=' + temporada);
		},
		times: function(regiao){
			return request('times?regiao='+ regiao);
		},
		// timesComPaginacao: function(pag, porPag){
		// 	return request('times/pagina?pag=' + pag + '&porPag=' + porPag);
		// },
		locais: function(regiao){
			return request('locais?regiao=' + regiao);
		},
		locaisPreferidos: function(timeId){
			return request('locaisPreferidos/' + timeId);
		},
		salvarLocalJogo: function(localJogo){
			return post('localJogo', localJogo);
		},
		estados: function(){
			return request('estados');
		},
		cidadesDaUf: function(uf){
			return request('cidadesDaUf/' + uf);
		},
		jogo: function(id){
			return request('jogo/' + id);
		},
		jogadorJogos: function(id, temporada){
			return request('jogador/' + id + '/jogos?temporada='+temporada);
		},
		salvarJogo: function(jogo){
			var escudoVisitante = jogo.visitante.id ? null : jogo.visitante.escudo; //só envia o escudo se for de um visitante sem cadastro
			return upload('jogo', escudoVisitante, jogo);
		},
		confirmarJogo: function(jogoId, visitanteId){
			return post('jogo/confirmar/' + jogoId, {visitanteId: visitanteId});
		},
		rejeitarJogo: function(jogoId, visitanteId){
			return post('jogo/rejeitar/' + jogoId, {visitanteId: visitanteId});
		},
		confirmarPlacar: function(jogoId, visitanteId){
			return post('jogo/confirmarPlacar/' + jogoId, {visitanteId: visitanteId});
		},
		rejeitarPlacar: function(jogoId, visitanteId){
			return post('jogo/rejeitarPlacar/' + jogoId, {visitanteId: visitanteId});
		},
		removerJogo: function(id){
      		return deleteRequest('jogo/' + id);
		},
		removerJogador: function(id, timeId){
      		return deleteRequest('jogador/' + id + '/' + timeId);
		},
		salvarPlacar: function(jogoId, placar){
	      return post('jogo/placar/' + jogoId, placar);
	    },
	    salvarSumula: function(jogoId, golsJogadores, time){
	      return post('jogo/gols/' + jogoId + '/' + time , golsJogadores);
	    },
	    salvarGolsJogo: function(jogoId, golsJogadores, time){
	      return post('jogo/gols/' + jogoId + '/' + time , golsJogadores);
	    },
		salvarTime: function(time){
			return upload('time', time.escudo, time);
		},
		editarTime: function(time){
			return upload('time/' + time._id, time.escudo, time);
		},
		reativarTime: function(timeId){
			return post('time/' + timeId + '/reativar');
		},
		excluirTime: function(timeId){
			return deleteRequest('time/' + timeId);
		},
		salvarJogador: function(jogador){
			return upload('jogador', jogador.foto, jogador);
		},
		setNotificationToken: function(usuarioId, oldNotificationToken, newNotificationToken, registrationType){
			return post('usuario/'+ usuarioId +'/setNotificationToken', {oldNotificationToken: oldNotificationToken, newNotificationToken: newNotificationToken, registrationType: registrationType});
		},
		logError: function(exception){
			var userData = JSON.parse(window.localStorage.getItem('user_data'));
			var device = device || null;
			return post('log/error', {exception: exception, user: _.pick(userData, ['time', 'nome', '_id']), device: device});
		}
	}
}]);
