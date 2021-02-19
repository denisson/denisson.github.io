angular.module('app.directives')
.directive('jogEscudo', ['config', function(config){
    return {
      restrict: 'A',
      link: function(scope, el, attr) {
        var imagemDefault = 'img/escudo.svg';

        scope.$watch(el.attr('jog-escudo'), function(urlImg){
            processar(urlImg, el, imagemDefault, config)
        });
      }
    };
  }])
  .directive('jogJogador', ['config', function(config){
    return {
      restrict: 'A',
      link: function(scope, el, attr) {
        var imagemDefault = 'img/jogador.svg';
  
        scope.$watch(el.attr('jog-jogador'), function(urlImg){
            processar(urlImg, el, imagemDefault, config)
        });
      }
    };
  }])

  function processar(urlImg, el, imagemDefault, config) {
    
    if(/^(\w+\:((\/\/)|(image)))/.test(urlImg)){//caso a imagem seja com o protocolo e tudo completo
      el.attr('src', urlImg);
      el.css({'background-image': ''});
    } else if (urlImg) { 
      if(el.attr('jog-size') != 'small'){
        el.attr('src', '');
        el.css({'background-image': 'url(' + getUrlImg(urlImg, 'small', config) +')'});
      }
      el.attr('src', getUrlImg(urlImg, el.attr('jog-size'), config));
      el.addClass(el.attr('jog-size'));
    } else {
      el.css({'background-image': ''});
      el.attr('src', imagemDefault);
    }
    el.addClass('foto-jogador');
    el.bind('error', function() {
      var imagemSrc = el.attr('src');
      var imgBackground = el.css('background-image');
      var matches = /url\([\"\'](.*)[\'\"]\)/.exec(imgBackground);
      imgBackground = matches ? matches[1] : '';

      if (imgBackground && imgBackground != imagemSrc){
        imagemSrc = imgBackground;
      } else {
        imagemSrc = imagemDefault;
        // el.css({'background-image': ''});
      }

      if(el.attr('src') != imagemSrc){
        el.attr('src', imagemSrc);
      }


    });
  }

  function getUrlImg(urlImg, size, config){
    var mapSize = {
      'small': {width: 48, height: 48, fit: 'cover'},
      'mid': {width: 80, height: 80, fit: 'cover'},
      'big': {width: 180, height: 180, fit: 'cover'},
      'large': {width: 300, height: 300, fit: 'cover'}
    };
    var dimensions = (mapSize[size]? mapSize[size] : mapSize['large']);

    var imageRequest = {
      bucket: "jogueiros-fc-uploads",
      key: urlImg,
      edits: {
        resize: dimensions
      }
    }
    
    return config.URL_AWS_CLOUDFRONT + btoa(JSON.stringify(imageRequest));
  }
