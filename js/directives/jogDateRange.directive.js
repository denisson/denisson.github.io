angular.module('app.directives')
.directive('jogDateRange', ['$ionicModal', function($ionicModal){
    return {
        restrict: 'A',
        scope: {temporadas: '=', onSelecionado: '&', temporada: '@', mes: '@'},
        link: function(scope, el, attr) {
            scope.tipoFiltro = '';
            scope.temporada = getTemporada();
            scope.meses = moment.monthsShort();

            function getTemporada(){
                return scope.temporada == 'todas' ? moment().year() : scope.temporada;
            }

            scope.diasMes = function(numMes){
                var mes = moment().year(getTemporada()).month(numMes);
                var diaSemana = mes.startOf('month').day();
                var ultimoDia = mes.endOf('month').date();
                var dias = [];
                for (var i = 0; i < diaSemana; i++) {
                    dias.push('');
                }

                for (var dia = 1; dia <= ultimoDia; dia++) {
                    dias.push(dia);
                }

                return dias;
            }

            scope.rangeOptions = [
                { chave: 'mes', nome: 'Mês'},
                { chave: 'temporada', nome: 'Temporada'},
                { chave: 'range', nome: 'Período'},
            ];
            scope.setTemporada = function(temporada){
                scope.temporada = temporada;
            }

            scope.mesFuturo = function (mes) {
                return moment().year(getTemporada()).month(mes).isAfter(moment(), 'month');
            }

            scope.selecionar = function(temporada, mes) {
                if (mes && scope.mesFuturo(mes-1)) return;
                scope.onSelecionado({temporada: temporada, mes: mes});
                scope.modal.hide();
            }

            scope.selecionado = function(tipoFiltro){
                scope.tipoFiltro = tipoFiltro;
            }

            el.bind('click', function() {
                if (scope.modal) {
                    scope.temporada = getTemporada();
                    scope.modal.show();
                    return;
                }

                $ionicModal.fromTemplateUrl('templates/directives/jog-date-range.html', {
                    scope: scope
                }).then(function(modal){
                    scope.modal = modal; 
                    scope.temporada = getTemporada();
                    scope.modal.show();
                });

            });
        }
    };
}])