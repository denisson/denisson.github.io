angular
  .module('app.services')
  .service('TimeService', function(GeneroService, ModalidadeService, CategoriaService, DataService, $ionicPopup, AuthService, PerfilFiltroService, $rootScope, $state, $ionicModal) {

    function descricao(time){
      var textos = [];

      if (_.get(time, 'esporte.chave') !== 'FUT') return '';
      if (_.get(time.modalidade, 'tipo')) textos.push(ModalidadeService.descricao(time.modalidade));
      if (time.genero) textos.push(GeneroService.nome(time.genero));
      if (time.idade) textos.push(CategoriaService.descricaoIdade(time.idade));
      
      return textos.join(' • ');
    }

    function excluirTime(time){
        $ionicPopup.confirm({
          title: 'Confirmar exclusão',
          content: 'Deseja realmente remover este time? Não será possível desfazer essa ação.'
        }).then(function(res) {
          if(res) {
            DataService.excluirTime(time._id).then(function(resposta){
              AuthService.atualizarPerfil(null, resposta.token);
              // $rootScope.$broadcast('alterarRegiao', AuthService.getPerfilFiltro());
              PerfilFiltroService.setAtual(AuthService.getPerfilFiltro());
              $state.go('selecionarPerfil', {}, {reload: true});
            });
         }
       });
    }

    function desativarTime(time){
      $ionicPopup.confirm({
        title: 'Desativar time?',
        content: 'Deseja realmente desativar este time? É possível reativar novamente na tela principal do time.'
      }).then(function(res) {
        if(res) {
          DataService.desativarTime(time._id).then(function(){
            // $state.go('selecionarPerfil', {}, {reload: true});
            time.ativo = false;
          });
       }
     });
    }

    function cadastroIncompleto(time){
      return time.esporte.chave === 'FUT' && (!_.get(time.modalidade, 'tipo') || !time.genero || !time.idade);
    }

    function checarCadastroCompleto(time){
      //cadastro do time está incompleto
      if (time.ativo && cadastroIncompleto(time)) {
        var scope = $rootScope.$new();
        scope.time = time;
        scope.completo = function(){
          return !cadastroIncompleto(scope.time);
        }

        scope.salvar = function(){
          DataService.editarTime(_.pick(scope.time, ['_id', 'modalidade', 'idade', 'genero'])).then(function(){
            $state.go('time', {id: scope.time._id});
            scope.modal.hide();
          });
        }
        // var modalSobreTime;
        $ionicModal.fromTemplateUrl('templates/times/modalSobreTime.html', {
          scope: scope,
          animation: 'fade-in'
        }).then(function(modal){
          scope.modal = modal;
          modal.show();
        });


      }
    }

    return {
        descricao: descricao,
        excluirTime: excluirTime,
        desativarTime: desativarTime,
        checarCadastroCompleto: checarCadastroCompleto
    }

});
