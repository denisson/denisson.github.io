angular
  .module('app.services')
  .service('GeneroService', function() {
    var generos = [
        { chave: 'MASCULINO', nome: 'Masculino'},
        { chave: 'MISTO', nome: 'Misto'},
        { chave: 'FEMININO', nome: 'Feminino'},
    ]

    function nome(chave){
        return get(chave).nome;
    }

    function get(chave){
        return _.find(generos, {chave: chave});
    }

    return {
        generos: generos,
        nome: nome,
        get: get
    }

});
