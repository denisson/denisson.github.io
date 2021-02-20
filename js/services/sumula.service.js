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

            jogadores.sort(function (jogadorA, jogadorB) {
                var ordem = {
                    'elenco': 'desc',
                    'destaque': 'desc',
                    'gols': 'desc',
                    'golsSofridos': 'desc',
                    'assistencias': 'desc',
                    'defesasDificeis': 'desc',
                    'desarmes': 'desc',
                    'cartoes.vermelho': 'asc',
                    'cartoes.amarelo': 'asc',
                    'cartoes.azul': 'asc',
                };

                for (var attr in ordem) {
                    var valorA = _.get(jogadorA, attr, 0);
                    var valorB = _.get(jogadorB, attr, 0);
                    var ordenar = ordem[attr] == 'asc' ? 1 : -1;
                    if (valorA != valorB) {
                        return (valorA - valorB) * ordenar;
                    }
                }
                return _.get(jogadorA, 'jogador.nome', '').localeCompare(_.get(jogadorB, 'jogador.nome', ''));
            });
            return jogadores;
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