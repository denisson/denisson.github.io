angular
  .module('app.services')
  .service('BannerService', function(AuthService, DataService, $q) {
    var banners = null;
    var fezConsulta = false;
    var deferred = $q.defer();

    function getBanners(){
        if(banners) {
            deferred.resolve(banners);
        } else if (!fezConsulta) {
            fezConsulta = true;
            var perfil = AuthService.getPerfilFiltro();
            DataService.banners(_.get(perfil, 'esporte.chave'), perfil.regiao).then(function(retorno){
                banners = retorno;
                deferred.resolve(banners);
            });
        }
		return deferred.promise;
    }


    return {
        getBanners: getBanners,
    }

});
