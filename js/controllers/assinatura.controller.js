angular
  .module('app.controllers')
  .controller('assinaturaController', ['$scope', '$rootScope',  '$state', '$stateParams', 'DataService', 'AuthService', function ($scope, $rootScope, $state, $stateParams, DataService, AuthService) {
    $scope.primeiraTentativa = true;
    $scope.opcaoWhatsapp = false;

    $scope.assinatura = {
        // preco: 5.90
    }
  
    // store.when("assinatura.mensal").updated(render);
    if(window.store){
      var product = store.get("assinatura.mensal");
      $scope.assinatura.preco = product.price;
      $scope.assinatura.id = product.id;
      if(!product.price) {
        // if (window.FirebasePlugin) window.FirebasePlugin.logEvent('exception', {description: 'Preço vazio na tela de assinatura'});
        DataService.logError('Preço vazio na tela de assinatura');
      }
    }

    $scope.assinar = function(){
        
        store.order($scope.assinatura.id, {userId: AuthService.getUsuarioId()}).error(function(e){
          $scope.mostrarOpcaoWhatsapp();
          // if (window.FirebasePlugin) window.FirebasePlugin.logEvent('compra_interrompida', e);
        });

        setCallbacks();
    }

    $scope.solicitarCondicaoEspecial = function(){
      // DataService.solicitarJogueirosPRO().then(function(permissaoConcedida){
      //   if (permissaoConcedida) {
      //     AuthService.setUserPro(true);
      //     $scope.$emit('assinatura-finalizada');
      //   }
      // });
      // if (window.FirebasePlugin) window.FirebasePlugin.logEvent('compra_whatsapp');
      var texto = 'Olá! Gostaria de assinar o Jogueiros PRO, mas não quero utilizar o cartão de crédito. Como devo proceder?';
      window.open('https://api.whatsapp.com/send?phone=5582996966288&text=' + texto, '_system');
    }

    $scope.fecharModal = function() {
      $scope.$emit('fechar-modal');
    }

    $scope.destaque = function(feature){
      return feature == $scope.feature;
    }

    $scope.mostrarOpcaoWhatsapp = function(){
      $scope.opcaoWhatsapp = true;
    }

    function setCallbacks(){
      $rootScope.$emit('loading.init');
      if($scope.primeiraTentativa){
        $scope.primeiraTentativa = false;

        store.once($scope.assinatura.id).approved(function(product){
          product.verify();
        });

        store.once($scope.assinatura.id).verified(function(product) {
          AuthService.setUserPro(true);
          $scope.$emit('assinatura-finalizada');
          $rootScope.$emit('loading.finish');
        });

        store.once($scope.assinatura.id).cancelled(function(product){
          // if (window.FirebasePlugin) window.FirebasePlugin.logEvent('compra_cancelada');
          DataService.logError({product: product, erro: 'Processo de compra cancelado'});
          $scope.mostrarOpcaoWhatsapp();
          $rootScope.$emit('loading.finish');
        });

        store.once($scope.assinatura.id).error(function(err){
          // if (window.FirebasePlugin) window.FirebasePlugin.logEvent('compra_erro', err);
          DataService.logError({detalhes: err, erro: 'Processo de compra gerou erro'});
          $scope.mostrarOpcaoWhatsapp();
          $rootScope.$emit('loading.finish');
        });
      }
    }
    
  }])
