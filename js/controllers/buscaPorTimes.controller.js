angular
  .module('app.controllers')
  .controller('buscaPorTimesController', 
  ['$scope', '$rootScope', '$stateParams', 'DataService', 'AuthService', 'TimeService', 'GeneroService', 'ModalidadeService', 'CategoriaService',
  function ($scope, $rootScope, $stateParams, DataService, AuthService, TimeService, GeneroService, ModalidadeService, CategoriaService) {

    var QTD_POR_PAGINA = 10;
    var fuse;
    $scope.times = [];
    $scope.page = 1;
    $scope.temMaisResultados = true; // Determina se existem mais jogos salvos no banco de dados que ainda não foram exibidos na tela
    $scope.dadosCarregados = false; // Flag utilizada para saber se já retornou o resultado do banco de dados
    $scope.todosTimes = [];
    $scope.todosTimesInicio = [];
    $scope.perfilFiltro = AuthService.getPerfilFiltro();
    $scope.ligaId = AuthService.getLiga();
    $scope.search = {query: ''};
    $scope.generos = GeneroService.generos;
    var timesTmp = [];

    var fuseSemCidade;
    $scope.timesSemCidade = [];
    $scope.pageSemCidade = 1;
    $scope.temMaisResultadosSemCidade = true;
    $scope.todosTimesSemCidade = [];
    var timesSemCidadeTmp= [];

    $scope.filtros = {
      esporte: _.get($scope.perfilFiltro, 'esporte.chave'),
      regiao: $scope.perfilFiltro.regiao,
      cidade: _.get($scope.perfilFiltro, 'cidade'),
      plataforma: _.get($scope.perfilFiltro, 'plataforma.chave'),
      ligaId: $scope.ligaId,
      modalidade: _.get($scope.perfilFiltro, 'modalidade'),
      idade: getIdadeComDescricao(_.get($scope.perfilFiltro, 'idade')),
      genero: GeneroService.get(_.get($scope.perfilFiltro, 'genero')),
    };

    function getIdadeComDescricao(idade){
      if (idade) {
        idade.descricao = CategoriaService.descricaoIdade(idade);
      }
      return idade;
    }

    $rootScope.$on('alterarRegiao', function(event, filtro){
      $scope.perfilFiltro = filtro;
      $scope.filtros.esporte = _.get($scope.perfilFiltro, 'esporte.chave');
      $scope.filtros.regiao = $scope.perfilFiltro.regiao;
      $scope.filtros.plataforma = _.get($scope.perfilFiltro, 'plataforma.chave');
      $scope.filtros.cidade = _.get($scope.perfilFiltro, 'cidade.uf') === $scope.perfilFiltro.regiao ? _.get($scope.perfilFiltro, 'cidade') : null;
      aplicarFiltro();
    });

    $scope.carregarResultados = function(){
        if( $scope.todosTimes.length > 0){
            timesTmp.push.apply(timesTmp, $scope.todosTimes[$scope.page - 1]);
            $scope.page++;
        }
        $scope.temMaisResultados = ($scope.page <= $scope.todosTimes.length);
        $scope.times = _.clone(timesTmp);
        $scope.dadosCarregados = true;
        $scope.$broadcast('scroll.infiniteScrollComplete');
    }

    $scope.carregarResultadosSemCidade = function(){
      if( $scope.todosTimesSemCidade.length > 0){
          timesSemCidadeTmp.push.apply(timesSemCidadeTmp, $scope.todosTimesSemCidade[$scope.pageSemCidade - 1]);
          $scope.pageSemCidade++;
      }
      $scope.temMaisResultadosSemCidade = ($scope.pageSemCidade <= $scope.todosTimesSemCidade.length);
      $scope.timesSemCidade = _.clone(timesSemCidadeTmp);
      $scope.dadosCarregados = true;
      $scope.$broadcast('scroll.infiniteScrollComplete');
    }
      
    function carregarTimes(){
      if($scope.perfilFiltro.regiao || _.get($scope.perfilFiltro, 'esporte.efootball')){
        var filtros = $scope.filtrosParaRequisicao();
        return DataService.times(filtros).then(function(times){
          var timesDaRegiao = [];
          var timesSemCidade = [];
          // DataService.blockPopup();
          for (var i = 0; i < times.length; i++) {
            times[i]['nomeSemAcento'] = _.deburr(times[i]['nome']);

            if(_.get(times[i], 'cidade._id') || times[i]['cadastradoPelaLiga'] == $scope.ligaId){
              timesDaRegiao.push(times[i]);
            } else {
              timesSemCidade.push(times[i]);
            }
          }
          $scope.todosTimesInicio = timesDaRegiao;
          $scope.todosTimes = _.chunk(timesDaRegiao, QTD_POR_PAGINA);
          $scope.todosTimesSemCidade = _.chunk(timesSemCidade, QTD_POR_PAGINA);
          // $scope.todosTimesSemCidade = timesSemCidade;
          fuse = new Fuse(timesDaRegiao, {
            keys: ['nomeSemAcento'],
            threshold: 0.3,
          });

          fuseSemCidade = new Fuse(timesSemCidade, {
            keys: ['nomeSemAcento'],
            threshold: 0.3,
          });
          
        });
      }
    }

    $scope.buscarTime = function(query){
      if (fuse && fuseSemCidade) {
        if(query){
          var times = fuse.search(_.deburr(query));
          var timesSemCidade = fuseSemCidade.search(_.deburr(query));
        }  else {
          var times = $scope.todosTimesInicio;
          var timesSemCidade = fuseSemCidade.list;
        }
        $scope.todosTimes = _.chunk(times, QTD_POR_PAGINA);
        $scope.todosTimesSemCidade = _.chunk(timesSemCidade, QTD_POR_PAGINA);
        $scope.page = 1;
        $scope.pageSemCidade = 1;
        timesTmp = [];
        timesSemCidadeTmp = [];
        $scope.carregarResultados();
        $scope.carregarResultadosSemCidade();
      }          
    }

    function aplicarFiltro(){
      var timesCarregados = carregarTimes();
      if(timesCarregados){
        timesCarregados.then(function(){
          $scope.buscarTime($scope.search.query);
        });
      }
    }

    $scope.filtrarPor = function(chave, valor) {
      $scope.filtros[chave] = valor;
      aplicarFiltro();
    }

    $scope.filtrarPorCategoria = function (categoria, idade) {
      if (categoria.chave === 'LIVRE') {
        $scope.filtrarPor('categoria', categoria.chave);
      } else {
        $scope.filtrarPor('categoria', null);
      }
      $scope.filtrarPor('idade', idade);
      
    }

    $scope.formatarFiltro = function(filtro){
      if(_.get(filtro, 'esporte.efootball')){
        var nomePlataforma = _.get(filtro, 'plataforma.nome');
        return filtro.esporte.nome + (nomePlataforma ? " • " + nomePlataforma : "");
      } else {
        return filtro.regiao || 'BR';
      }
    }

    $scope.filtrosParaRequisicao = function(){
      var filtros = _.clone($scope.filtros);
      filtros.cidade = _.get(filtros, 'cidade._id');
      // filtros.modalidade = _.get(filtros, 'modalidade.chave');
      filtros.genero = _.get(filtros, 'genero.chave');
      filtros.idadeMin = _.get(filtros, 'idade.minima');
      filtros.idadeMax = _.get(filtros, 'idade.maxima');
      delete filtros.idade;
      var filtrosModalidade = ModalidadeService.getFiltros(filtros.modalidade);
      delete filtros.idade;
      return _.merge(filtros, filtrosModalidade);
    }

    $scope.textoRemoverFiltro = function(){
      var filtros = [];
      if ($scope.filtros.cidade) filtros.push('cidades');
      if ($scope.filtros.modalidade) filtros.push('modalidades');
      if ($scope.filtros.idade) filtros.push('idades');
      if ($scope.filtros.genero) filtros.push('sexos');
      if (filtros.length) {
        var ultimo = filtros.pop();
        var texto = filtros.join(', ');
        texto = texto ? texto + ' e ' + ultimo : ultimo;
        return 'Clique aqui para procurar times de todas as ' + texto + '.';
      } else {
        return null;
      }
    }

    $scope.descricaoTime = function(time){
      var descricao = TimeService.descricao(time);
      return _.get(time, 'cidade.nome') + (descricao ? ' • ' + descricao : '');
    }

    $scope.descricaoModalidade = function(modalidade) {
      return ModalidadeService.descricao(modalidade);
    }

    $scope.removerFiltro = function(){
      $scope.filtros.cidade = null;
      $scope.filtros.modalidade = null;
      $scope.filtros.idade = null;
      $scope.filtros.genero = null;
      aplicarFiltro();
    }

    aplicarFiltro();

  }])
