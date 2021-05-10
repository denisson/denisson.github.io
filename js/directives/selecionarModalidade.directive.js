angular.module('app.directives')
.directive('selecionarModalidade', ['$ionicModal', 'ModalidadeService', 'TiposCampoService', '$ionicPopup', function($ionicModal, ModalidadeService, TiposCampoService, $ionicPopup){
    return {
        restrict: 'A',
        scope: {onSelecionado: '&', preSelecionado: '=', labelBotao: '@', esporte: '=', modalMinimo: '@', trigger: '@', podeLimpar: '='},
        link: function(scope, el, attr) {
            scope.modalidades = [];
            scope.modalidadeSelecionada = null;

            $ionicModal.fromTemplateUrl('templates/times/selecionarModalidade.html', {
                scope: scope,
                // animation: 'no-animation',
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
                        content: 'É preciso informar pelo menos um tipo de campo.'
                    });
                }
            }

            scope.limpar = function() {
                scope.modalidadeSelecionada = null;
                scope.onSelecionado({modalidade: scope.modalidadeSelecionada});
                scope.modal.hide();
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

            scope.tipoCampoChecked = function(tipoCampo) {
                return _.includes(scope.modalidadeSelecionada.tiposCampo, tipoCampo);
            }

            scope.setNumJogadores = function(num) {
                scope.modalidadeSelecionada.numJogadores = num;
            }

            function exibirModal(){
                carregar();
                scope.modal.show();
            }

            function exibirModalDetalhes() {
                var tipoSelecionado = scope.modalidadeSelecionada.tipo;
                scope.modalidadeSelecionada.tiposCampo = _.includes(tipoSelecionado.perguntar, 'tiposCampo')? _.get(scope.modalidadeSelecionada.tipo, 'default.tiposCampo') || [] : scope.modalidadeSelecionada.tiposCampo;
                scope.modalidadeSelecionada.numJogadores = _.includes(tipoSelecionado.perguntar, 'numJogadores')? _.get(scope.modalidadeSelecionada.tipo, 'default.numJogadores') || 6 : scope.modalidadeSelecionada.numJogadores;

                scope.modalidadeSelecionada = _.clone(scope.modalidadeSelecionada);

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