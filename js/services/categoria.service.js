angular
  .module('app.services')
  .service('CategoriaService', function() {
    var categorias = [
      {chave: 'BASE', nome: 'Base', idadeMinima: 4, idadeMaxima: 20},
      {chave: 'LIVRE', nome: 'Livre'},
      {chave: 'MASTER', nome: 'Master', idadeMinima: 35, idadeMaxima: 60},
    ];

    function nome(chave){
        return get(chave).nome;
    }

    function get(chave){
        return _.find(categorias, {chave: chave});
    }

    function getCategorias() {
        return categorias;
    }

    function descricao(categoria){
      var idadeMinima, idadeMaxima;
      idadeMinima = categoria.idadeMinima;
      idadeMaxima = categoria.chave === 'BASE' ? categoria.idadeMaxima : null;

      if (idadeMinima && idadeMaxima) {
          return 'Idades entre ' + idadeMinima + ' e ' + idadeMaxima + ' anos';
      } else if (idadeMinima) {
          return 'A partir de ' + idadeMinima + ' anos';
      } else {
          return 'Sem restrição de idade';
      }
    }

    function descricaoIdade(idade){
        if (!idade) return '';
        
        if (idade.minima && idade.maxima) {
            return idade.minima + ' a ' + idade.maxima + ' anos';
        } else if (idade.minima) {
            return idade.minima + ' anos ou mais';
        } else {
            return 'Livre';
        }
    }

    return {
        getCategorias: getCategorias,
        nome: nome,
        descricao: descricao,
        descricaoIdade: descricaoIdade,
        get: get,
    }

});
