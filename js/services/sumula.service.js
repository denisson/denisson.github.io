angular
  .module('app.services')
  .service('SumulaService', function(AuthService, DataService, $q) {

    /**
     * Percorre todos os campos de números do jogador. Caso tenha algum
     * número preenchido e diferente de 0, retorna true.
     */
    function jogadorTemCampos(jogador, campos) {
        for (var i = 0; i < campos.length; i++) {
            var campo = campos[i];
            if ( _.get(jogador, campo) ) return true;
        }
        return false;
    }

    return {
        ordenarJogadores: function (jogadores) {
            var ordem = {
                'elenco': 'asc',
                'destaque': 'desc',
                'gols': 'desc',
                'gosSofridos': 'desc',
                'assistencias': 'desc',
                'defesasDificeis': 'desc',
                'desarmes': 'desc',
                'cartoes.vermelho': 'asc',
                'cartoes.amarelo': 'asc',
                'cartoes.azul': 'asc',
                'jogador.nome': 'asc'
            };

            return _.orderBy(jogadores, _.keys(ordem), _.values(ordem));
        },
        temNumeros: function(jogador){
            var campos = [
                'gols',
                'gosSofridos',
                'assistencias',
                'defesasDificeis',
                'desarmes',
                'cartoes.vermelho',
                'cartoes.amarelo',
                'cartoes.azul',
            ];
            return jogadorTemCampos(jogador, campos);
        },
        temInformacaoParaMostrar: function (jogador){
            var campos = [
                'destaque',
                'gols',
                'gosSofridos',
                'assistencias',
                'defesasDificeis',
                'desarmes',
                'cartoes.vermelho',
                'cartoes.amarelo',
                'cartoes.azul',
            ];
            return jogadorTemCampos(jogador, campos);
        }
    }
});