angular.module('app.directives')
.directive('graficoTimeSaldoGols', [function(){
    return {
      restrict: 'A',
      scope: {dados: '=', positiveColor: '@', showZero: '@'},
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

    // Enabled by default
    Chart.pluginService.register(showZeroPlugin);

        var ctx = el[0].getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: scope.dados.map(function(data){
                    return  moment(data.t).format('DD/MM/YYYY');
                }),
                datasets: [
                    { 
                        data: scope.dados.map(function(data){
                            return  data.y;
                        }),
                        backgroundColor: scope.dados.map(function(data){
                            if (data.y > 0) {
                                return scope.positiveColor || '#66BB6A';
                            } else if (data.y < 0) {
                                return '#ef7176';
                            } else {
                                return '#facc48';
                            }
                        }),
                    },
                ],
            },
            options: {
                showZero: scope.showZero,
                tooltips: {
                    intersect: false,
                    mode: 'x'
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
                            precision: 0
                        }
                    }]
                }
            }
        });

      }
    };
  }])
  .directive('graficoTimeAproveitamento', [function(){
    return {
      restrict: 'A',
      scope: {aproveitamento: '='},
      link: function(scope, el, attr) {
  
        var ctx = el[0].getContext('2d');

        Chart.pluginService.register({
            beforeDraw: function(chart) {
              if (chart.config.options.elements.center) {
                // Get ctx from string
                var ctx = chart.chart.ctx;
          
                // Get options from the center object in options
                var centerConfig = chart.config.options.elements.center;
                var fontStyle = centerConfig.fontStyle || 'Arial';
                var txt = centerConfig.text;
                var color = centerConfig.color || '#000';
                var maxFontSize = centerConfig.maxFontSize || 75;
                var sidePadding = centerConfig.sidePadding || 20;
                var sidePaddingCalculated = (sidePadding / 100) * (chart.innerRadius * 2)
                // Start with a base font of 30px
                ctx.font = "30px " + fontStyle;
          
                // Get the width of the string and also the width of the element minus 10 to give it 5px side padding
                var stringWidth = ctx.measureText(txt).width;
                var elementWidth = (chart.innerRadius * 2) - sidePaddingCalculated;
          
                // Find out how much the font can grow in width.
                var widthRatio = elementWidth / stringWidth;
                var newFontSize = Math.floor(30 * widthRatio);
                var elementHeight = (chart.innerRadius * 2);
          
                // Pick a new font size so it will not be larger than the height of label.
                var fontSizeToUse = Math.min(newFontSize, elementHeight, maxFontSize);
                var minFontSize = centerConfig.minFontSize;
                var lineHeight = centerConfig.lineHeight || 25;
                var wrapText = false;
          
                if (minFontSize === undefined) {
                  minFontSize = 20;
                }
          
                if (minFontSize && fontSizeToUse < minFontSize) {
                  fontSizeToUse = minFontSize;
                  wrapText = true;
                }
          
                // Set font settings to draw it correctly.
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                var centerX = ((chart.chartArea.left + chart.chartArea.right) / 2);
                var centerY = ((chart.chartArea.top + chart.chartArea.bottom) / 2);
                ctx.font = fontSizeToUse + "px " + fontStyle;
                ctx.fillStyle = color;
          
                if (!wrapText) {
                  ctx.fillText(txt, centerX, centerY);
                  return;
                }
          
                var words = txt.split(' ');
                var line = '';
                var lines = [];
          
                // Break words up into multiple lines if necessary
                for (var n = 0; n < words.length; n++) {
                  var testLine = line + words[n] + ' ';
                  var metrics = ctx.measureText(testLine);
                  var testWidth = metrics.width;
                  if (testWidth > elementWidth && n > 0) {
                    lines.push(line);
                    line = words[n] + ' ';
                  } else {
                    line = testLine;
                  }
                }
          
                // Move the center up depending on line height and number of lines
                centerY -= (lines.length / 2) * lineHeight;
          
                for (var n = 0; n < lines.length; n++) {
                  ctx.fillText(lines[n], centerX, centerY);
                  centerY += lineHeight;
                }
                //Draw text in center
                ctx.fillText(line, centerX, centerY);
              }
            }
        });

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Aproveitamento'],
                datasets: [{
                    data: [Math.round(scope.aproveitamento), 100 - Math.round(scope.aproveitamento)],
                    backgroundColor: ['#4285f4']
                }],
            },
            // maintainAspectRatio: false,
            options: {
                elements: {
                    center: {
                        text: Math.round(scope.aproveitamento) + '%'
                    }
                },
                animation: {
                    duration: 0, // general animation time
                },
                aspectRatio: 2,
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
  .directive('graficoTimeDesempenho', [function(){
    return {
      restrict: 'A',
      scope: {dados: '='},
      link: function(scope, el, attr) {
  
        var ctx = el[0].getContext('2d');
        new Chart(ctx, {
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
  
        var ctx = el[0].getContext('2d');
        new Chart(ctx, {
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
  
        var ctx = el[0].getContext('2d');
        new Chart(ctx, {
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

        var ctx = el[0].getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: scope.dados.map(function(data){
                    return  moment(data.dataHora).format('DD/MM/YYYY');
                }),
                datasets: [
                    { 
                        data: scope.dados.map(function(data){
                            return  data.jogador[scope.atributo];
                        }),
                        backgroundColor: '#4285f4'
                    },
                    { 
                        data: scope.dados.map(function(data){
                            var attrTime = scope.atributoTime || 'golsPro';
                            return  data.time[attrTime] - data.jogador[scope.atributo];
                        }),
                        backgroundColor: '#ebedf0'
                    }
                ],
            },
            options: {
                tooltips: {
                    intersect: false,
                    mode: 'x'
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
      scope: {dadosJogador: '=', dadosTime: '='},
      link: function(scope, el, attr) {
  
        var ctx = el[0].getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [ 'Vitórias', 'Empates', 'Derrotas'],
                datasets: [
                    {
                        data: [scope.dadosJogador.vitorias, scope.dadosJogador.empates, scope.dadosJogador.derrotas],
                        backgroundColor: ['#66BB6A', '#facc48', '#ef7176']
                    },
                    {
                        data: [scope.dadosTime.vitorias - scope.dadosJogador.vitorias, scope.dadosTime.empates - scope.dadosJogador.empates, scope.dadosTime.derrotas - scope.dadosJogador.derrotas],
                        backgroundColor: ['#ebedf0', '#ebedf0', '#ebedf0']
                    }
                ],
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
      scope: {dadosJogador: '=', dadosTime: '='},
      link: function(scope, el, attr) {
  
        var ctx = el[0].getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Amarelo', 'Vermelho'],
                datasets: [
                    {
                        data: [scope.dadosJogador.amarelo, scope.dadosJogador.vermelho],
                        backgroundColor: ['#facc48', '#ef7176']
                    },
                    {
                        data: [scope.dadosTime.amarelo - scope.dadosJogador.amarelo, scope.dadosTime.vermelho - scope.dadosJogador.vermelho],
                        backgroundColor: ['#ebedf0', '#ebedf0']
                    }
                ],
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
