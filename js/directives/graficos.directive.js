angular.module('app.directives')
.directive('graficoTimeSaldoGols', [function(){
    return {
      restrict: 'A',
      scope: {dados: '=', positiveColor: '@', showZero: '@', labelInfo: '@'},
      link: function(scope, el, attr) {
  

    /**
     * Used to show a small bar on the chart if the value is 0
     *
     * @type Object
     */
    var showZeroPlugin = {
        beforeRender: function (chartInstance) {
            if(chartInstance.config.options.showZero){
                var datasets = chartInstance.config.data.datasets;

                for (var i = 0; i < datasets.length; i++) {
                    var meta = datasets[i]._meta;
                    // It counts up every time you change something on the chart so
                    // this is a way to get the info on whichever index it's at
                    var metaData = meta[Object.keys(meta)[0]];
                    var bars = metaData.data;

                    for (var j = 0; j < bars.length; j++) {
                        var model = bars[j]._model;

                        if (metaData.type === "horizontalBar" && model.base === model.x) {
                            model.x = model.base + (model.width * 0.12);
                            model.base -= (model.width * 0.12) + 1 ;
                        } else if (model.base === model.y) {
                            model.y = model.base - (model.width * 0.12);
                            model.base += (model.width * 0.12) + 1;
                        }
                    }
                }
            }
        }
    };

    var chart;
  
    function preencherDataset(dados){
        return { 
            label: scope.labelInfo,
            data: dados.map(function(data){
                return  data.y;
            }),
            backgroundColor: dados.map(function(data){
                if (data.y > 0) {
                    return scope.positiveColor || '#66BB6A';
                } else if (data.y < 0) {
                    return '#ef7176';
                } else {
                    return '#facc48';
                }
            }),
        };
    }

    function preencherLabels(dados){
        return dados.map(function(data){
            return  moment(data.t).format('DD/MM/YYYY');
        })
    }

    scope.$watch('dados', function(dados){
        chart.data.labels = preencherLabels(dados);
        chart.data.datasets[0] = preencherDataset(dados);
        chart.update();
    });
    // Enabled by default
    Chart.pluginService.register(showZeroPlugin);

    var ctx = el[0].getContext('2d');
    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: preencherLabels(scope.dados),
            datasets: [preencherDataset(scope.dados)],
        },
        options: {
            showZero: scope.showZero,
            tooltips: {
                intersect: false,
                mode: 'x',
                titleAlign: 'center',
                titleMarginBottom: 10,
                callbacks: {
                    afterTitle: function(itens) {
                        return montarPlacar(scope.dados, itens);
                    },
                }
            },
            legend: false,
            animation: {
                duration: 0, // general animation time
            },
            maintainAspectRatio: true,
            scales:
            {
                xAxes: [{
                    display: false,
                    // type: 'time',
                    // distribution: 'series',
                    // bounds: 'ticks',
                    // barPercentage:1,
                    // categoryPercentage: 0.9,
                    ticks: {
                        beginAtZero: true
                    },
                    time: {
                        // unit: 'month',
                        // stepSize: 11,
                        // min: "2020-01-01",
                        // max: "2020-12-31",
                        // displayFormats: {
                        //     month: 'MMM'
                        // }
                    }
                }],
                yAxes: [{
                    ticks: {
                        // stepSize: 1,
                        precision: 0,
                        beginAtZero: true,
                    }
                }]
            }
        }
    });

      }
    };
  }])
  .directive('graficoTimeDesempenho', [function(){
    return {
      restrict: 'A',
      scope: {dados: '='},
      link: function(scope, el, attr) {
        var chart;
  
        scope.$watch('dados', function(dados){
            chart.data.datasets[0].data = [dados.vitorias, dados.empates, dados.derrotas];
            chart.update();
        });

        var ctx = el[0].getContext('2d');
        chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [ 'Vitórias', 'Empates', 'Derrotas'],
                datasets: [{
                    data: [scope.dados.vitorias, scope.dados.empates, scope.dados.derrotas],
                    backgroundColor: ['#66BB6A', '#facc48', '#ef7176']
                }],
            },
            options: {
                animation: {
                    duration: 0, // general animation time
                },
                aspectRatio: 1.5,
                legend: {
                    display: false
                },
                scales: {
                    xAxes: [{
                        // display: false,
                        gridLines: {
                            display: false
                        },
                        ticks: {
                            beginAtZero: true
                        }
                    }],
                    yAxes: [{
                        display: false,
                        gridLines: {
                            display: false,    
                        },
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });

      }
    };
  }])
  .directive('graficoTimeDesempenhoSimples', [function(){
    return {
      restrict: 'A',
    //   scope: {dados: '@'},
      link: function(scope, el, attr) {
        var dados = scope.$eval(attr.dados);
        var ctx = el[0].getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [ 'Vitórias', 'Empates', 'Derrotas'],
                datasets: [{
                    data: [dados.vitorias, dados.empates, dados.derrotas],
                    backgroundColor: ['#66BB6A', '#facc48', '#ef7176']
                }],
            },
            options: {
                events: [],
                animation: {
                    duration: 0, // general animation time
                },
                // aspectRatio: 1.5,
                // responsive: true,
                maintainAspectRatio: false,
                legend: {
                    display: false
                },
                scales: {
                    xAxes: [{
                        // display: false,
                        gridLines: {
                            // display: false
                            drawOnChartArea: false,
                            // drawTicks: false,
                            tickMarkLength: 3,
                            lineWidth: 2
                        },
                        ticks: {
                            display: false,
                            beginAtZero: true
                        }
                    }],
                    yAxes: [{
                        // scaleLabel: {
                        // display: false,    
                        // }
                        // display: false,
                        gridLines: {
                            // display: false,    
                            drawOnChartArea: false,
                            drawTicks: false,
                            lineWidth: 2
                        },
                        ticks: {
                            display: false,   
                            beginAtZero: true
                        }
                    }]
                }
            }
        });

      }
    };
  }])
  .directive('graficoTimeMando', [function(){
    return {
      restrict: 'A',
      scope: {dados: '='},
      link: function(scope, el, attr) {
        var chart;
  
        scope.$watch('dados', function(dados){
            chart.data.datasets[0].data = [dados.mandante, dados.visitante];
            chart.update();
        });
  
        var ctx = el[0].getContext('2d');
        chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Mandante', 'Visitante'],
                datasets: [{
                    data: [scope.dados.mandante, scope.dados.visitante],
                    backgroundColor: ['#4285f4', '#68bced']
                }],
            },
            // maintainAspectRatio: false,
            options: {
                animation: {
                    duration: 0, // general animation time
                },
                legend: {
                    display: false
                },
                // title: {
                //     display: true,
                //     text: Math.round(scope.aproveitamento) + '%'  + ' de aproveitamento',
                //     position: 'bottom'
                // }
            }
        });

      }
    };
  }])
  .directive('graficoTimeCartoes', [function(){
    return {
      restrict: 'A',
      scope: {dados: '='},
      link: function(scope, el, attr) {
        var chart;
  
        scope.$watch('dados', function(dados){
            chart.data.datasets[0].data = [dados.cartoes.amarelo, dados.cartoes.vermelho];
            chart.update();
        });
  
        var ctx = el[0].getContext('2d');
        var chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Amarelo', 'Vermelho'],
                datasets: [{
                    data: [scope.dados.cartoes.amarelo, scope.dados.cartoes.vermelho],
                    backgroundColor: ['#facc48', '#ef7176']
                }],
            },
            // maintainAspectRatio: false,
            options: {
                animation: {
                    duration: 0, // general animation time
                },
                legend: {
                    display: false
                },
                scales: {
                    xAxes: [{
                        // display: false,
                        gridLines: {
                            display: false
                        },
                        ticks: {
                            beginAtZero: true
                        }
                    }],
                    yAxes: [{
                        display: false,
                    }]
                }
            }
        });

      }
    };
  }])
  .directive('graficoJogadorNumeros', [function(){
    return {
      restrict: 'A',
      scope: {dados: '=', atributo: '@', atributoTime: '@'},
      link: function(scope, el, attr) {
        var chart;

        function preencherDataset(dados){
            return [
                { 
                    data: dados.map(function(data){
                        return  data.jogador[scope.atributo];
                    }),
                    backgroundColor: '#4285f4',
                    label: 'Jogador',
                },
                { 
                    data: dados.map(function(data){
                        var attrTime = scope.atributoTime || 'golsPro';
                        return  data.time[attrTime] - data.jogador[scope.atributo];
                    }),
                    backgroundColor: '#ebedf0',
                    label: 'Resto do time',
                }
            ];
        }
    
        function preencherLabels(dados){
            return dados.map(function(data){
                return  moment(data.jogo.dataHora).format('DD/MM/YYYY');
            })
        }
  
        scope.$watch('dados', function(dados){
            chart.data.labels= preencherLabels(dados);
            chart.data.datasets = preencherDataset(dados);
            chart.update();
        });

        var ctx = el[0].getContext('2d');
        chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: preencherLabels(scope.dados),
                datasets: preencherDataset(scope.dados),
            },
            options: {
                tooltips: {
                    intersect: false,
                    mode: 'x',
                    titleAlign: 'center',
                    titleMarginBottom: 10,
                    callbacks: {
                        afterTitle: function(itens) {
                            return montarPlacar(scope.dados, itens);
                        },
                    },
                },
                legend: false,
                animation: {
                    duration: 0, // general animation time
                },
                maintainAspectRatio: true,
                scales:
                {
                    xAxes: [{
                        stacked: true,
                        display: false,
                    }],
                    yAxes: [{
                        stacked: true,
                        ticks: {
                            beginAtZero: true,
                            precision: 0
                        }
                    }]
                }
            }
        });

    }
};
}])
.directive('graficoJogadorDesempenho', [function(){
    return {
      restrict: 'A',
      scope: {dados: '='},
      link: function(scope, el, attr) {

        var chart;

        function preencherDataset(dados){
            return[
                {
                    label: 'Com o jogador',
                    data: [dados.jogador.vitorias, dados.jogador.empates, dados.jogador.derrotas],
                    backgroundColor: ['#66BB6A', '#facc48', '#ef7176']
                },
                {
                    label: 'Sem o jogador',
                    data: [dados.time.vitorias - dados.jogador.vitorias, dados.time.empates - dados.jogador.empates, dados.time.derrotas - dados.jogador.derrotas],
                    backgroundColor: ['#ebedf0', '#ebedf0', '#ebedf0']
                }
            ]
        }
  
        scope.$watch('dados', function(dados){
            chart.data.datasets = preencherDataset(dados);
            chart.update();
        });

  
        var ctx = el[0].getContext('2d');
        chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [ 'Vitórias', 'Empates', 'Derrotas'],
                datasets: preencherDataset(scope.dados),
            },
            options: {
                animation: {
                    duration: 0, // general animation time
                },
                aspectRatio: 1.5,
                legend: {
                    display: false
                },
                tooltips: {
                    intersect: false,
                    mode: 'x',
                },
                scales: {
                    xAxes: [{
                        stacked: true,
                        gridLines: {
                            display: false
                        },
                        ticks: {
                            beginAtZero: true
                        }
                    }],
                    yAxes: [{
                        stacked: true,
                        display: false,
                        gridLines: {
                            display: false,    
                        },
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });

      }
    };
  }])
  .directive('graficoJogadorCartoes', [function(){
    return {
      restrict: 'A',
      scope: {dados: '='},
      link: function(scope, el, attr) {
        var chart;

        function preencherDataset(dados){
            return[
                {
                    label: 'Jogador',
                    data: [dados.jogador.amarelo, dados.jogador.vermelho],
                    backgroundColor: ['#facc48', '#ef7176']
                },
                {
                    label: 'Resto do time',
                    data: [dados.time.amarelo - dados.jogador.amarelo, dados.time.vermelho - dados.jogador.vermelho],
                    backgroundColor: ['#ebedf0', '#ebedf0']
                }
            ]
        }
  
        scope.$watch('dados', function(dados){
            chart.data.datasets = preencherDataset(dados);
            chart.update();
        });


        var ctx = el[0].getContext('2d');
        chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Amarelo', 'Vermelho'],
                datasets: preencherDataset(scope.dados),
            },
            // maintainAspectRatio: false,
            options: {
                animation: {
                    duration: 0, // general animation time
                },
                legend: {
                    display: false
                },
                tooltips: {
                    intersect: false,
                    mode: 'x',
                },
                scales: {
                    xAxes: [{
                        stacked: true,
                        gridLines: {
                            display: false
                        },
                        ticks: {
                            beginAtZero: true
                        }
                    }],
                    yAxes: [{
                        stacked: true,
                        display: false,
                    }]
                }
            }
        });

      }
    };
  }])
  .directive('graficoAdminJogos', [function(){
    return {
      restrict: 'A',
      scope: {dados: '=', atributo: '@', atributoTime: '@'},
      link: function(scope, el, attr) {

        var ctx = el[0].getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: scope.dados.map(function(resultado){
                    return  resultado.data //moment().format('DD/MM/YYYY');
                }),
                datasets: [
                    { 
                        data: scope.dados.map(function(resultado){
                            return  resultado.numJogos;
                        }),               
                        label: 'Jogos',
                        // data: scope.dados.map(function(resultado){
                        //     return  {x: resultado.data, y: resultado.numJogos};
                        // }),
                        borderColor: '#4285f4',
                        backgroundColor: '#4285f461'
                    }
                ],
            },
            options: {
                // tooltips: {
                //     intersect: false,
                //     mode: 'x'
                // },
                // legend: false,
                animation: {
                    duration: 0, // general animation time
                },
                maintainAspectRatio: true,
                scales:
                {
                    xAxes: [{
                        // stacked: true,
                        // display: false,
                        // type: 'time',
                        // time: {
                        //     unit: 'week'
                        // }
                    }],
                    yAxes: [{
                        // stacked: true,
                        ticks: {
                            beginAtZero: true,
                            precision: 0
                        }
                    }]
                }
            }
        });

    }
};
}])

function montarPlacar(dados, itens) {
    var jogo = dados[itens[0].index].jogo;
    if(jogo.mandanteNaEsquerda) return jogo.mandante.nome + ' ' + jogo.placar.mandante + 'x' + jogo.placar.visitante + ' ' + jogo.visitante.nome;
    else return jogo.visitante.nome + ' ' + jogo.placar.visitante + 'x' + jogo.placar.mandante + ' ' + jogo.mandante.nome;
}
