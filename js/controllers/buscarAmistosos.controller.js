angular
  .module('app.controllers')
  .controller('buscarAmistososController', ['$scope', '$stateParams', 'DataService', 'AuthService', '$ionicModal', '$ionicPopup', function ($scope, $stateParams, DataService, AuthService, $ionicModal, $ionicPopup) {

      var diasExtenso = ['','Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
      $scope.tiposCampo = {
          'SOCIETY': 'Society',
          'SALAO': 'Salão',
          'GRAMA': 'Grama',
          'TERRA': 'Terra',
          'AREIA': 'Areia'
        };
      $scope.modalidades = [
        {key: 'SOCIETY', value: 'Society'},
        {key: 'SALAO', value: 'Salão'},
        {key: 'GRAMA', value: 'Grama'},
        {key: 'TERRA', value: 'Terra'},
        {key: 'AREIA', value: 'Areia'}
      ];

      $scope.filtro = {};
      $scope.propostaEnviada = false;

      $scope.filtro.diasSemana = [];
      $scope.filtro.horario = {
        inicio: 0,
        fim: 24
      }

      $scope.filtro.modalidades = [];
      $scope.filtro.locais = [];
      $scope.filtro.cidade = AuthService.getCidade();


      var filtroSalvo = recuperarFiltroSalvo();
      if (filtroSalvo) {
        $scope.filtro = filtroSalvo;
      }
      

      //Paginação

      var QTD_POR_PAGINA = 20;
      $scope.resultados = [];
      $scope.page = 1;
      $scope.temMaisResultados = true; // Determina se existem mais resultados salvos no banco de dados que ainda não foram exibidos na tela
      $scope.dadosCarregados = false; // Flag utilizada para saber se já retornou o resultado do banco de dados

      var processaResultados = function(resultados){
        resultados = tratarDiasDisponiveis(resultados);
        if($scope.zerar){ // Quando o parâmetro zerar é passado, ao invés de trazer mais resultados, os resultados atuais irão sobrepor os atuais. É o refresh da tela
          $scope.resultados = resultados;
          $scope.page++;
        } else if( resultados.length > 0){
            $scope.resultados.push.apply($scope.resultados, resultados);
            $scope.page++;
        }
        $scope.temMaisResultados = (resultados.length == QTD_POR_PAGINA);
        $scope.dadosCarregados = true;
        $scope.$broadcast('scroll.refreshComplete');
        $scope.$broadcast('scroll.infiniteScrollComplete');
      }

      $scope.carregarResultados = function(zerar){
        $scope.zerar = zerar;
        if($scope.zerar){
          $scope.page = 1;
        }
        if($scope.dadosCarregados){//primeiro carregamento
          DataService.blockPopup();
        }

        result = $scope.filtrar();

        result.then(processaResultados).catch(function(){
          $scope.temMaisResultados = false;
          $ionicPopup.alert({
            title: 'Erro de conexão',
            content: 'Não foi possível carrregar os jogos'
          });
          $scope.$broadcast('scroll.refreshComplete');
          $scope.$broadcast('scroll.infiniteScrollComplete');
        });
      };

      //FIM - Paginação


      function tratarDiasDisponiveis(mandosCampo){
          for (var i = mandosCampo.length - 1; i >= 0; i--) {
            mandosCampo[i].datasDisponiveis = datasMes(mandosCampo[i]);
          }
          return mandosCampo;
      }

      $scope.diaExtenso = function(num){
        return diasExtenso[num];
      }

      $scope.diaSemanaSelecionado = function(numDia){
        return _.includes($scope.filtro.diasSemana, numDia);
      }

      $scope.toggleDiaSemana = function(numDia){
        if($scope.diaSemanaSelecionado(numDia)){
          _.pull($scope.filtro.diasSemana, numDia);
        } else {
          $scope.filtro.diasSemana.push(numDia);
        }
      }

      $scope.tipoCampo = function(tipo){
        return $scope.tiposCampo[tipo];
      }

      $scope.nomesLocais = function(){
        return _.map($scope.filtro.locais, 'nome').join(', ');
      }

      $ionicModal.fromTemplateUrl('templates/times/modalTiposCampo.html', {
        scope: $scope
      }).then(function(modal){
        $scope.modalTiposCampo = modal;
      });

      $scope.confirmarTiposCampo = function(){
        $scope.filtrar();
        $scope.modalTiposCampo.hide();
      }

      $scope.getTextoTiposCampo = function(modalidades){
        if ($scope.filtro.modalidades.length > 0){
          return _.map($scope.filtro.modalidades, 'value').join(', ');
        } else {
          return 'Todos';
        }
      }

      function dataDisponivel(data, jogosMarcados){
        for (var i = jogosMarcados.length - 1; i >= 0; i--) {
          if(moment(jogosMarcados[i].dataHora).isSame(data, 'date')){
            return false;
          }
        }
        return true;
      }

      function datasMes(mando){
        var inicio = moment();
        var fim = moment().add(4, 'week');

        var datasMes = [];

        var data = inicio.clone().day(mando.diaSemana - 1);
        if( data.isBefore(inicio) ) {
          data.day(mando.diaSemana - 1 + 7);
        }
        while(data.isBefore(fim)){
          datasMes.push({
            data: data.format('DD/MM'),
            dataCompleta: data.format('DD/MM/YYYY'),
            disponivel: dataDisponivel(data, mando.jogosMarcados),
            id: '' + mando.time._id + data.format('DD/MM')
          });
          data.day(mando.diaSemana - 1 + 7);
        };
        return datasMes;
      }


      $scope.cidadeSelecionada = function(cidade){
        $scope.filtro.cidade = cidade;
        $scope.filtrar();
      }

      $scope.locaisSelecionados = function(locais) {
        $scope.filtro.locais = locais;
        $scope.filtrar();
      }
      

      $scope.filtrar = function(){
        salvarFiltro($scope.filtro);
        var filtro = _.clone($scope.filtro);
        filtro.horarioInicio = filtro.horario.inicio.toString().padStart(2, 0) + ':00';
        filtro.horarioFim = filtro.horario.fim.toString().padStart(2, 0) + ':00';
        // filtro.regiao = $scope.regiao;
        filtro.cidadeId = $scope.filtro.cidade ? $scope.filtro.cidade._id: null;
        filtro.tipoCampo = _.map(filtro.modalidades, 'key');
        delete filtro.cidade;
        filtro.locais = _.map(filtro.locais, '_id');
        filtro.pag = $scope.page;
        filtro.porPag = QTD_POR_PAGINA;
        return DataService.mandosCampo(filtro);
      }

      $scope.carregarResultados();

      function salvarFiltro(filtro){
        window.localStorage.setItem('filtro_amistosos', JSON.stringify(filtro));
      }

      function recuperarFiltroSalvo(){
        return JSON.parse(window.localStorage.getItem('filtro_amistosos'));
      }


      $ionicModal.fromTemplateUrl('templates/times/confirmarAmistoso.html', {
        scope: $scope,
        animation: 'fade-in'
      }).then(function(modal){
        $scope.modalConfirmarAmistoso = modal;
      });

      $scope.confirmarAmistoso = function(mandoCampo, data){
        $scope.propostaEnviada = false;
        $scope.amistoso = {
          mandante: mandoCampo.time,
          visitante: AuthService.getTime(),
          dataHora: moment(data + ' ' + mandoCampo.horario, 'DD/MM/YYYY HH:mm'),
          local: mandoCampo.local,
          mandoCampoId: mandoCampo._id
        }
        $scope.modalConfirmarAmistoso.show();
      }


      $scope.enviarPropostaJogo = function(amistoso){
        DataService.salvarPropostaJogo(amistoso).then(function(proposta){
          if(proposta.id){
            $scope.propostaEnviada = true;
          }
        });
      }

  }])
