angular
  .module('app.services')
  .service('ModalidadeService', function(DataService, $q) {
    var modalidades = [];

    function loadModalidades(){
        return DataService.modalidades().then(function(modalidadesCarregadas){
            modalidades = modalidadesCarregadas;
        });
    }

    function getModalidades(esporte){
        if (!esporte) {
            return modalidades;
        } else {
            return _.filter(modalidades, {esporte: esporte});
        }
    }

    function find(params){
        return _.find(getModalidades(), params);
    }

    function descricao(modalidade){
        if (!_.get(modalidade, 'tipo')) return '' ;
        var tipoModalidade = find({_id: modalidade.tipo});
        if( !tipoModalidade ) return '';
        return !tipoModalidade.perguntar.length ? tipoModalidade.nome : tipoModalidade.nome + ' • ' + modalidade.numJogadores + 'x' + modalidade.numJogadores;
    }

    function getFiltros(modalidade){
        if (!_.get(modalidade, 'tipo')) return {};
        var filtros = {};
        var tipoModalidade = find({_id: modalidade.tipo});
        if ( !tipoModalidade.perguntar.length ) {
            filtros.modalidade = tipoModalidade._id;
        } else {
            filtros.modalidade = null;
            filtros.numJogadores = modalidade.numJogadores;
            filtros.tiposCampo = modalidade.tiposCampo;
        }
        return filtros;
    }

    return {
        loadModalidades: loadModalidades,
        getModalidades: getModalidades,
        getFiltros: getFiltros,
        descricao: descricao, 
    }

});
