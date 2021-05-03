angular.module('app.directives')
.directive('selecionarModalidade', ['$ionicModal', 'ModalidadeService', 'TiposCampoService', '$ionicPopup', function($ionicModal, ModalidadeService, TiposCampoService, $ionicPopup){
    return {
        restrict: 'A',
        scope: {onSelecionado: '&', preSelecionado: '=', labelBotao: '@', esporte: '=', modalMinimo: '@', trigger: '@'},
        link: function(scope, el, attr) {
            scope.modalidades = [];
            scope.modalidadeSelecionada = null;

            $ionicModal.fromTemplateUrl('templates/times/selecionarModalidade.html', {
                scope: scope,
                animation: 'no-animation',
            }).then(function(modal){
                scope.modal = modal; 
            });

            $ionicModal.fromTemplateUrl('templates/times/modalDetalhesModalidade.html', {
                scope: scope,
                animation: 'no-animation',
            }).then(function(modal){
                scope.modalDetalhes = modal; 
            });


            function carregar(){                
                scope.modalidades = ModalidadeService.getModalidades(scope.esporte);
            }

            scope.selecionada = function(modalidade){
                scope.modalidadeSelecionada = {
                    tipo: modalidade,
                    numJogadores: modalidade.numJogadores || 7,
                    tiposCampo: modalidade.tiposCampo || []
                };
                if (modalidade.perguntar.length) {
                    scope.modal.hide().then(function(){
                        exibirModalDetalhes();
                    });
                } else {
                    scope.dispararEventoSelecionado();
                }
            }
            scope.concluir  = function() {
                if(scope.modalidadeSelecionada.tiposCampo.length) {
                    scope.dispararEventoSelecionado();
                    scope.modalDetalhes.hide();
                } else {
                    $ionicPopup.alert({
                        title: 'Informe os tipos de campo',
                        content: 'É importante saber em quais tipos de campo o seu time joga para te ajudarmos a encontrar outros times da mesma modalidade que a sua.'
                    });
                }
            }

            scope.dispararEventoSelecionado = function() {
                scope.modalidadeSelecionada.tipo = scope.modalidadeSelecionada.tipo._id;
                scope.onSelecionado({modalidade: scope.modalidadeSelecionada});
                scope.modal.hide();
                scope.modalidadeSelecionada = null;
            }

            scope.toggleTipoCampo = function(tipoCampo) {
                // caso já esteja selecionado, retira, caso não esteja, adiciona
                scope.modalidadeSelecionada.tiposCampo = _.xor(scope.modalidadeSelecionada.tiposCampo, [tipoCampo]);
            }

            scope.setNumJogadores = function(num) {
                scope.modalidadeSelecionada.numJogadores = num;
            }

            function exibirModal(){
                carregar();
                scope.modal.show();
            }

            function exibirModalDetalhes() {
                scope.modalidadeSelecionada.tiposCampo = _.includes(scope.modalidadeSelecionada.tipo.perguntar, 'tiposCampo')? [] : scope.modalidadeSelecionada.tiposCampo;
                scope.modalidadeSelecionada.numJogadores = _.includes(scope.modalidadeSelecionada.tipo.perguntar, 'numJogadores')? 7 : scope.modalidadeSelecionada.numJogadores;

                scope.modalDetalhes.show();
            }

            scope.nomeTipoCampo = function(chave) {
                return TiposCampoService.nome(chave);
            }

            el.bind(scope.trigger || 'click', function() {
                exibirModal()
            });
        }
    };
}])