angular
  .module('app.services')
  .service('PerfilFiltroService', function(AuthService) {
    var perfilFiltroAtual = AuthService.getPerfilFiltro()

    function getAtual(){
        return _.clone(perfilFiltroAtual);
    }

    function setAtual(perfilFiltro){
        perfilFiltroAtual = perfilFiltro;
    }

    function diferenteDoAtual(perfilFiltro) {
        return !_.isEqual(perfilFiltro, perfilFiltroAtual);
    }

    return {
        getAtual: getAtual,
        setAtual: setAtual,
        diferenteDoAtual: diferenteDoAtual
    }

});
