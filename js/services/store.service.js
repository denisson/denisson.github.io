angular
  .module('app.services')
  .service('StoreService', function(AuthService, DataService) {

    function initialize(){
        if(window.store) {
            // store.verbosity = store.DEBUG;
            store.validator = function(product, callback) {
              DataService.checarReciboPagamento(product).then(function(retorno){
                if (retorno.ok) {
                  callback(true); // success!
                } else {
                  callback(false, {
                    code: store.PURCHASE_EXPIRED, // **Validation error code
                    latest_receipt: {}, // só para que a validação não se repita. Já que o servidor já confirmou que expirou
                    error: { message: "Subscription expired"}
                  });
                }
              }).catch(function(){
                callback(false, "Impossible to proceed with validation");
              });
            };
        
            var ASSINATURA_MENSAL = "assinatura.mensal";
            store.register({
              id: ASSINATURA_MENSAL,
              type: store.PAID_SUBSCRIPTION
            });
            store.refresh();
        
        
            store.when(ASSINATURA_MENSAL).approved(function(product){
              console.log('verificando...');
              if(AuthService.isUsuarioPro()){// se o usuário já é PRO, não preciso checar
                product.finish();
              } else {
                product.verify();
              }  
            });
            
            store.when(ASSINATURA_MENSAL).verified(function(product) {
              console.log('finalizando...');
              AuthService.setUserPro(true);
              product.finish();
            });
        
            store.when(ASSINATURA_MENSAL).unverified(function() {
              console.log('retirando o PRO');
              AuthService.setUserPro(false);
            });
          }
    }


    return {
        initialize: initialize,
    }

});



      // store.when(ASSINATURA_MENSAL).owned(function(){
      //   // AuthService.setUserPro(true);
      //   console.log('owned - agora é PRO!');
      // });

      // store.when(ASSINATURA_MENSAL).cancelled(function(){
      //     AuthService.setUserPro(false);
      //     console.log('deixou de ser PRO - cancelou');
      // });

      // store.when("refresh-completed", function() {
      //   var product = store.get(ASSINATURA_MENSAL);
      //   if (!product.owned && AuthService.isUsuarioPro()){ //a assinatura não está válida neste aparelho, mas usuário está com a conta PRO
      //     product.verify(); //verifica no backend a situação
      //     //verify só serve quando o status é aproved. preciso mudar isso
      //   }
      // });

      // store.when(ASSINATURA_MENSAL).expired(function(){
      //     AuthService.setUserPro(false);
      //     console.log('expired - deixou de ser PRO - expirou');
      // });

    //   store.when(ASSINATURA_MENSAL).loaded(function(product){
    //     if (product.owned){
    //       console.log('Já deve estar com a versão PRO');
    //       // AuthService.setUserPro(true);
    //     } else {
    //       console.log('Se tiver como PRO, precisa checar, pois não era para estar ou ele está mudando de iphone para android ou vice e versa');
    //       // AuthService.setUserPro(false);
    //     }
    //     console.log('status ' + product.state);
    //   });