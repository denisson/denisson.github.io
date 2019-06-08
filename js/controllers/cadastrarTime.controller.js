angular
  .module('app.controllers')
  .controller('cadastrarTimeController', ['$scope', '$state', '$stateParams', 'DataService', '$cordovaCamera', 'AuthService','$ionicModal', '$ionicPopup',  function ($scope, $state, $stateParams, DataService, $cordovaCamera, AuthService, $ionicModal, $ionicPopup) {
  var imagePath = '';
  $scope.modalidade = {};
  $scope.telefone = {ddi: '55', whatsapp: true};

  DataService.estados().then(function(estados){
    $scope.estados = estados;
  });

  if(editando()){
    $scope.time = AuthService.getTime();


    DataService.time($scope.time._id).then(function(time){
      $scope.time = time;
      tratarModalidadeParaMostrar();
      tratarTelefone();
    });

    $scope.titulo = 'Editar perfil do time';
    $scope.labelBotao = 'Salvar';
  } else if (AuthService.temTime()) {
    $state.go('abasInicio.meuTime', {location: 'replace'}, {reload: true});
  } else {
    $scope.time = {nome: '', escudo: ''};
    $scope.titulo = 'Cadastrar time';
    $scope.labelBotao = 'Cadastrar time';
  }

  function editando(){
    return AuthService.getTime() && ($stateParams.id == AuthService.getTime()._id);
  }

  // document.getElementById('input-file-foto').addEventListener('change', function(){
  // 	if (this.files && this.files[0]) {
  //         var reader = new FileReader();
  //         reader.readAsDataURL(this.files[0]);
  //         reader.onload = function (e) {
  //             $scope.time.escudo = e.target.result;
  //         }
  //     }
  // });

    $scope.buscarEstado = function(query){
      if(query.length){
        $scope.estados = fuseEstados.search(_.deburr(query));
      } else {
        $scope.estados = fuseEstados.list;
      }
    }


    $ionicModal.fromTemplateUrl('templates/jogos/selecionarEstado.html', {
      scope: $scope,
      focusFirstInput: true,
    }).then(function(modal){
      $scope.modalEstado = modal;
    });

    $ionicModal.fromTemplateUrl('templates/jogos/selecionarCidade.html', {
      scope: $scope,
      focusFirstInput: true,
    }).then(function(modal){
      $scope.modalCidade = modal;
    });

    $ionicModal.fromTemplateUrl('templates/times/informarTelefone.html', {
      scope: $scope,
      animation: 'no-animation',
      focusFirstInput: true,
    }).then(function(modal){
      $scope.modalTelefone = modal;
    });

    $ionicModal.fromTemplateUrl('templates/times/informarBiografia.html', {
      scope: $scope,
      animation: 'no-animation',
      focusFirstInput: true,
    }).then(function(modal){
      $scope.modalBiografia = modal;
    });

    $ionicModal.fromTemplateUrl('templates/times/informarModalidades.html', {
      scope: $scope,
      animation: 'no-animation',
      focusFirstInput: true,
    }).then(function(modal){
      $scope.modalModalidades = modal;
    });

  $scope.estadoSelecionado = function(estado){
    $scope.time.estado = estado;
    $scope.capital = estado.capital;
    $scope.cidades = [];
    DataService.cidadesDaUf(estado.uf).then(function(cidades){
      $scope.cidades = cidades;
      fuseCidades = new Fuse(cidades, {
        keys: ['nomeSemAcento'],
        threshold: 0.3,
      });
    });
    $scope.modalEstado.hide();
    $scope.modalCidade.show();
  }

  $scope.cidadeSelecionada = function(cidade){
    $scope.time.cidade = cidade;
    $scope.modalCidade.hide();
  }

  $scope.confirmarBiografia = function(){
    if(editando()){
      DataService.editarTime(_.pick($scope.time, ['_id', 'biografia'])).then(function(){
        $scope.modalBiografia.hide();
      });
    } else {
      $scope.modalBiografia.hide();
    }
  }

  $scope.capturarFoto = function(){
    if (typeof Camera != 'undefined'){ // Executando no celular
      var options = {
        quality: 100,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
        allowEdit: true,
        encodingType: Camera.EncodingType.PNG,
        mediaType: Camera.MediaType.PICTURE,
        targetWidth: 400,
        targetHeight: 400,
        correctOrientation:true
      };

      $cordovaCamera.getPicture(options).then(function(imagePath) {
        $scope.time.escudo = imagePath;
        $scope.fotoAlterada = true;
      }, function(err) {
        console.log(err)
      });
    } else {
      // document.getElementById('input-file-foto').click();
    }
  };

  $scope.enviar = function(){
    tratarModalidadeParaEnvio();
    if(editando()){
      var timeSalvar = angular.copy($scope.time);
      if(!$scope.fotoAlterada) {
        timeSalvar.escudo = '';
      }
      
      DataService.editarTime(timeSalvar).then(function(time){
        AuthService.atualizarTime(time);
        $state.go('abasInicio.paginaDoTime-aba-time', {id: time._id});
      });
    } else {
      $scope.time.dono = AuthService.getUsuarioId();
      DataService.salvarTime($scope.time).then(function(resposta){
        AuthService.atualizarTime(resposta.time, resposta.token);
        $state.go('abasInicio.editarTime', {id: resposta.time._id});
      });
    }
  }

  function tratarModalidadeParaEnvio(){
    $scope.time.modalidades = [];
    if($scope.modalidade.society){
      $scope.time.modalidades.push('SOCIETY');
    }
    if($scope.modalidade.salao){
      $scope.time.modalidades.push('SALAO');
    }
    if($scope.modalidade.grama){
      $scope.time.modalidades.push('GRAMA');
    }
    if($scope.modalidade.terra){
      $scope.time.modalidades.push('TERRA');
    }
    if($scope.modalidade.areia){
      $scope.time.modalidades.push('AREIA');
    }
  }

  function tratarModalidadeParaMostrar(){
    $scope.modalidade.society = _.includes($scope.time.modalidades, 'SOCIETY');
    $scope.modalidade.salao = _.includes($scope.time.modalidades, 'SALAO');
    $scope.modalidade.grama = _.includes($scope.time.modalidades, 'GRAMA');
    $scope.modalidade.terra = _.includes($scope.time.modalidades, 'TERRA');
    $scope.modalidade.areia = _.includes($scope.time.modalidades, 'AREIA');
  }

  function tratarTelefone(){
    if($scope.time.telefone) {
      $scope.time.telefone.numeroFormatado = formatarTelefone($scope.time.telefone.numero);
      $scope.telefone = $scope.time.telefone;
    }
  }

  $scope.confirmarTelefone = function(){
    //todo:checar se telefone é válido
    if($scope.telefone.numero != undefined){
      // Informou o ddd?
      if($scope.telefone.numero.length >= 10 || $scope.telefone.numero.length == 0){ 
        $scope.time.telefone = $scope.telefone;
        $scope.time.telefone.numeroFormatado = formatarTelefone($scope.time.telefone.numero);
        if(editando()){
          DataService.editarTime(_.pick($scope.time, ['_id', 'telefone'])).then(function(){
            $scope.modalTelefone.hide();
          });
        } else {
          $scope.modalTelefone.hide();
        }
      } else {
        $ionicPopup.alert({
          title: 'Informe o DDD',
          content: 'Informe o telefone completo com DDD'
        });        
      }
    } else {
      $ionicPopup.alert({
        title: 'Telefone inválido',
        content: 'Informe um telefone válido'
      });
    }
  }

  function formatarTelefone(telefone){
    return telefone ? telefone.replace(/^(\d{2})?(\d{4,5})(\d{4})$/, "$1 $2-$3").trim() : '';
  }

  $scope.sair = function(){
    AuthService.logout();
  }
}])
