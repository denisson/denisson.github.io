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

    function request(url, params){
		var options = defaultOptions();
		options.params = params;
		var requisicao = $http.get(config.URL_API + url, options);
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

	CacheFactory('oneDayCache', {
	    maxAge: 24 * 60 * 60 * 1000, // Items added to this cache expire after 15 minutes
	    // cacheFlushInterval: 60 * 60 * 1000, // This cache will clear itself every hour
	    deleteOnExpire: 'aggressive', // Items will be deleted from this cache when they expire
	    storageMode: 'localStorage' // This cache will use `localStorage`.
	});

	// $http.defaults.cache = CacheFactory.get('dataCache');
	return {
		blockPopup: function(){
			blockPopup = true;
		},
		login: function(provider, userData){
			return post('login/' + provider, userData);
		},
		adminGrafico: function(tipoRanking, esporte, regiao, plataforma){
			esporte = esporte || '';
			regiao = regiao || '';
			plataforma = plataforma || '';
			return request('jogos/admin/'+ tipoRanking +'?esporte='+ esporte + '&regiao=' + regiao + '&plataforma=' + plataforma);
		},
		jogosEncerrados: function(pag, porPag, esporte, regiao, plataforma){
			esporte = esporte || '';
			regiao = regiao || '';
			plataforma = plataforma || '';
			return request('jogos/encerrados?pag=' + pag + '&porPag=' + porPag + '&esporte=' + esporte + '&regiao=' + regiao + '&plataforma=' + plataforma);
		},
		jogosFuturos: function(pag, porPag, esporte, regiao, plataforma){
			esporte = esporte || '';
			regiao = regiao || '';
			plataforma = plataforma || '';
			return request('jogos/proximos?pag=' + pag + '&porPag=' + porPag + '&esporte=' + esporte + '&regiao=' + regiao + '&plataforma=' + plataforma);
		},
		jogosRodada: function(pag, porPag){
			return request('jogos/rodada?pag=' + pag + '&porPag=' + porPag);
		},
		jogosEncerradosTime: function(timeId, temporada, params){
			return request('jogos/' + timeId + '/' + temporada + '/encerrados', params);
		},
		jogosAgendadosTime: function(timeId, temporada, pag, porPag){
			return request('jogos/' + timeId + '/' + temporada +  '/proximos?pag=' + pag + '&porPag=' + porPag);
		},
		time: function(id){
			return request('time/' + id + '?jogadores=false&jogos=false');
		},
		timeJogadores: function(id){
			return request('time/' + id + '/jogadores');
		},
		timeJogos: function(id, temporada){
			temporada = temporada || moment().year();
			return request('time/' + id + '?jogadores=true&jogos=true&temporada=' + temporada);
		},
		timeEstatisticas: function(id, temporada){
			temporada = temporada || moment().year();
			return request('time/' + id + '/estatisticas?temporada=' + temporada);
		},
		timeAdversarios: function(id, temporada, ordem){
			temporada = temporada || moment().year();
			return request('time/' + id + '/adversarios?temporada=' + temporada + '&ordem=' + ordem);
		},
		times: function(esporte, regiao, plataforma, ligaId){
			esporte = esporte || '';
			regiao = regiao || '';
			plataforma = plataforma || '';
			ligaId = ligaId || '';
			return request('times?esporte='+ esporte + '&regiao=' + regiao + '&plataforma=' + plataforma + '&ligaId=' + ligaId);
		},
		rankingGeralTimes: function(tipoRanking, esporte, regiao, plataforma){
			esporte = esporte || '';
			regiao = regiao || '';
			plataforma = plataforma || '';
			return request('times/ranking/'+ tipoRanking +'?esporte='+ esporte + '&regiao=' + regiao + '&plataforma=' + plataforma);
		},
		esportes: function(){
			var deferred = $q.defer();

			  deferred.resolve([
				{ "chave" : "FUT", "nome" : "Futebol", "efootball" : false },
				{ "chave" : "PES", "nome" : "PES", "efootball" : true },
				{ "chave" : "FIFA", "nome" : "FIFA", "efootball" : true }
			]);

			return deferred.promise;
		},
		plataformas: function(){
			var deferred = $q.defer();

			  deferred.resolve([
				{ "chave" : "PS","nome" : "PS" },
				{ "chave" : "XBOX","nome" : "Xbox" },
				{ "chave" : "PC","nome" : "PC" },
				{ "chave" : "MOBILE","nome" : "Mobile" }
			]);

			return deferred.promise;
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
		salvarCompeticao: function(competicao){
			return post('competicao', competicao);
		},
		competicoes: function( esporte, regiao, plataforma){
			esporte = esporte || '';
			regiao = regiao || '';
			plataforma = plataforma || '';
			return request('competicao/lista?esporte=' + esporte + '&regiao=' + regiao + '&plataforma=' + plataforma);
		},
		competicoesSugeridas: function(timeId){
			return request('competicao/sugeridas/' + timeId);
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
		jogoHistoricoConfrontos: function(mandanteId, visitanteId, temporada){
			temporada = temporada || '';
			return request('jogos/confrontos/'+ mandanteId + '/' + visitanteId + '?temporada=' + temporada);
		},
		jogador: function(id){
			return request('jogador/' + id);
		},		
		jogadorJogos: function(id, temporada){
			return request('jogador/' + id + '/jogos?temporada='+temporada);
		},
		jogadorPosicoes: function(){
			return request('jogador/posicoes');
		},
		jogadorEstatisticas: function(id, timeId, temporada){
			temporada = temporada || moment().year();
			return request('jogador/' + id + '/' + timeId + '/estatisticas?temporada=' + temporada);
		},
		salvarJogo: function(jogo, escudoVisitante){
			var endpoint = jogo._id ? 'jogo/' + jogo._id : 'jogo';
			return upload(endpoint, escudoVisitante, jogo);
		},
		salvarJogoLiga: function(jogo, ligaId){
			return post('jogo/liga/'+ligaId, jogo);
		},
		importarJogoParaLiga: function(jogoId){
			return post('jogo/importar/' + jogoId);
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
		salvarTimeLiga: function(time, ligaId){
			return upload('time/liga/'+ligaId, time.escudo, time);
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
		timeEnviarConviteAdmin: function(timeId, dados){
			return post('time/' + timeId + '/admin/convite', dados);
		},
		timeExcluirAdmin: function(timeId, administradorId){
			return deleteRequest('time/' + timeId + '/admin/' + administradorId);
		},
		timeExcluirConviteEmail: function(conviteId){
			return deleteRequest('time/convite/' + conviteId);
		},
		salvarJogador: function(jogador){
			jogador = _.pick(jogador, ['_id', 'foto', 'nome', 'camisa', 'posicao', 'time', 'convidado']);
			return upload('jogador', jogador.foto, jogador);
		},
		ligasDisponiveis: function(jogo){
			return request('liga/disponiveis?cidadeId=' + jogo.local.cidade._id + '&dataHora=' + jogo.dataHora );
		},
		solicitarArbitragem: function(jogoId, ligaId){
			return post('jogo/solicitarArbitragem/'+jogoId + '/' + ligaId);
		},
		cancelarSolicitacaoArbitragem: function(jogoId){
			return deleteRequest('jogo/cancelarSolicitacaoArbitragem/'+jogoId);
		},
		salvarArbitro: function(arbitro){
			return upload('arbitro', arbitro.foto, arbitro);
		},
		editarArbitro: function(arbitro){
			return upload('arbitro/' + arbitro._id, arbitro.foto, arbitro);
		},

		arbitro: function(id){
			return request('arbitro/' + id);
		},
		arbitroAgenda: function(id, dataInicio, dataFim){
			return request('arbitro/' + id + '/agenda/' + dataInicio + '/' + dataFim);
		},
		arbitroJogos: function(id){
			return request('arbitro/' + id + '?jogos=true');
		},
		arbitroJogosFuturos: function(id, pag, porPag){
			return request('arbitro/' + id + '/jogos/futuros?pag=' + pag + '&porPag=' + porPag);
		},
		arbitroJogosEncerrados: function(id, pag, porPag){
			return request('arbitro/' + id + '/jogos/encerrados?pag=' + pag + '&porPag=' + porPag);
		},
		arbitros: function(ligaId){
			return request('liga/' + ligaId + '/arbitros');
		},
		liga: function(id){
			return request('liga/' + id);
		},
		ligaJogosFuturos: function(id, pag, porPag, filtro){
			return request('liga/' + id + '/jogos/futuros?pag=' + pag + '&porPag=' + porPag + '&filtro=' + filtro);
		},
		ligaJogosEncerrados: function(id, pag, porPag, filtro){
			return request('liga/' + id + '/jogos/encerrados?pag=' + pag + '&porPag=' + porPag + '&filtro=' + filtro);
		},
		ligaJogosCancelados: function(id, pag, porPag){
			return request('liga/' + id + '/jogos/cancelados?pag=' + pag + '&porPag=' + porPag);
		},
		ligaCompleto: function(id){
			return request('liga/' + id + '?arbitros=true');
		},
		ligaTimes: function(id, pag, porPag){
			return request('liga/' + id + '/times?pag=' + pag + '&porPag=' + porPag);
		},
		ligaConfiguracao: function(id){
			return request('liga/' + id + '?arbitros=false&admins=true');
		},
		ligaFaturas: function(id){
			return request('liga/' + id + '/faturas');
		},
		enviarConviteArbitroLiga: function(ligaId, dados){
			return post('liga/' + ligaId + '/arbitro/convite', dados);
		},
		enviarConviteAdminLiga: function(ligaId, dados){
			return post('liga/' + ligaId + '/admin/convite', dados);
		},
		excluirAdminLiga: function(ligaId, administradorId){
			return deleteRequest('liga/' + ligaId + '/admin/' + administradorId);
		},
		excluirConviteEmail: function(conviteId){
			return deleteRequest('liga/convite/' + conviteId);
		},
		gerarTokenArbitroLiga: function(ligaId){
			return request('liga/' + ligaId + '/arbitro/token');
		},
		desativarTokenArbitroLiga: function(ligaId){
			return deleteRequest('liga/' + ligaId + '/arbitro/token');
		},
		validarTokenLiga: function(ligaId, token, usuarioId){
			return request('liga/' + ligaId + '/validar/' + token + '/' + (usuarioId ? usuarioId : '') );
		},
		editarLiga: function(liga){
			return upload('liga/' + liga._id, liga.escudo, liga);
		},
		editarConfiguracaoLiga: function(liga){
			return post('liga/' + liga._id + '/configuracao', liga);
		},
		designarArbitro: function(jogoId, arbitroId){
			return post('jogo/designarArbitro/' + jogoId + '/' + arbitroId);
		},
		excluirArbitro: function(arbitroId){
			return deleteRequest('arbitro/' + arbitroId);
		},
		confirmarArbitragem: function(jogoId){
			return post('jogo/confirmarArbitragem/' + jogoId);
		},
		rejeitarArbitragem: function(jogoId){
			return post('jogo/rejeitarArbitragem/' + jogoId);
		},
		cancelarArbitroJogo: function(jogoId, motivo){
			return post('jogo/cancelarArbitragem/' + jogoId, {motivo: motivo});
		},
		ranking: function(id){
			return request('ranking/' + id);
		},
		rankingTimes: function(id, pag){
			return request('ranking/' + id + '/times?pag=' + pag);
		},
		timeRanking: function(id){
			return request('ranking/time/' + id);
		},
		rankingJogosFuturos: function(id, pag, porPag){
			return request('ranking/' + id + '/jogos/futuros?pag=' + pag + '&porPag=' + porPag);
		},
		rankingJogosEncerrados: function(id, pag, porPag){
			return request('ranking/' + id + '/jogos/encerrados?pag=' + pag + '&porPag=' + porPag);
		},
		cadastrarRanking: function(ranking){
			return upload('ranking', ranking.foto, ranking);
		},
		editarRanking: function(id, ranking){
			return upload('ranking/' + id, ranking.foto, ranking);
		},
		excluirRanking: function(rankingId){
			return deleteRequest('ranking/' + rankingId);
		},
		criteriosClassificacao: function(){
			return request('criteriosClassificacao');
		},

		mandosCampo: function(filtro){
			return request('mandoCampo', filtro);
		},
		salvarPropostaJogo: function(propostaJogo){
			return post('propostaJogo', propostaJogo);
		},
		propostaJogo: function(id){
			return request('propostaJogo/' + id);
		},
	    confirmarPropostaJogo: function(id, mandanteId){
	   		return post('propostaJogo/confirmar/' + id, {mandanteId: mandanteId});
	    },

		usuarioPerfis: function(){
			return request('usuario/perfis?v=2');
		},
		banners: function(esporte, regiao){
			esporte = esporte || '';
			regiao = regiao || '';
			return request('banners?esporte=' + esporte + '&regiao=' + regiao);
		},
		setNotificationToken: function(usuarioId, oldNotificationToken, newNotificationToken, registrationType){
			return post('usuario/'+ usuarioId +'/setNotificationToken', {oldNotificationToken: oldNotificationToken, newNotificationToken: newNotificationToken, registrationType: registrationType});
		},
        checarReciboPagamento: function(product){
			return post('check-purchase', product);
		},
		solicitarJogueirosPRO: function(){
			return post('usuario/solicitarJogueirosPRO');
		},
		infoTimeJogueirosPRO: function(timeId) {
			return request('admin/infoPRO/' + timeId);
		},
		concederJogueiroPRO: function(timeId, meses){
			return post('admin/grantPRO/' + timeId, {meses: meses});
		},
		registrarNotificacaoClicada: function(notificacaoId){
			return post('usuario/notificacaoClicada', {notificacaoId: notificacaoId});
		},
		logError: function(exception){
			var userData = JSON.parse(window.localStorage.getItem('user_data'));
			var device = window.device || null;
			return post('log/error', {exception: exception, user: _.pick(userData, ['time', 'nome', '_id']), device: device, url: window.location.hash});
		}
	}
}]);
