angular
  .module('app.services')
  .service('TiposCampoService', function() {
    var tiposCampo = [
        { chave: 'SOCIETY', nome: 'Sintético' },
        { chave: 'SALAO', nome: 'Salão' },
        { chave: 'GRAMA', nome: 'Grama' },
        { chave: 'TERRA', nome: 'Terra' },
        { chave: 'AREIA', nome: 'Areia' }
      ];

    function nome(chave){
      var tipo = _.find(tiposCampo, {chave: chave});
      return tipo? tipo.nome : null;
    }

    function getTiposCampo(){
      return tiposCampo;
    }

    function valoresByChaves(chaves) {
      return _.map(chaves, function(chave){
        return nome(chave);
      })
    }

    function textoByChaves(chaves){
      var valores = valoresByChaves(chaves);
      if (valores.length === 1) return valores[0];
      const ultimo = valores.pop();
      return valores.join(', ') + ' ou ' + ultimo;
    }

    return {
        getTiposCampo: getTiposCampo,
        nome: nome,
        valoresByChaves: valoresByChaves,
        textoByChaves: textoByChaves,
    }

});
