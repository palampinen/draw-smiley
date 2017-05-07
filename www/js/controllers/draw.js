
angular.module('smileyApp.controllers')

.controller('DrawCtrl', function($scope, Smiley, Faceapp, $state, $ionicScrollDelegate, $timeout, $http, User) {

  var modes = {
    GIF: 'GIF',
    DRAW: 'DRAW',
    FACEAPP: 'FACEAPP'
  };
  $scope.modes = modes;
  $scope.mode = modes.DRAW;

  $scope.$on("$ionicView.leave", function(){
    $scope.givenRating = null;
    $scope.touched = false;
  });

  function debounce(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };

  $scope.loading = false;

  $scope.rateWeek = function(rating) {
    $scope.givenRating = rating;
    $timeout( function() {
      $scope.touched = true;
      $timeout( function() {
        $('#sketch').sketch({ defaultColor: '#329E41'});
      }, 10);
    }, 400);
  };

  $scope.searchGIF = debounce(function(term) {
    $http.get(`https://api.giphy.com/v1/gifs/search?q=${term}&api_key=dc6zaTOxFJmzC`).then(function (results) {
      $scope.GIFResults = results.data.data.map(function(item) {
        return item.images.downsized.url;
      });
    })
  }, 500);

  $scope.GIFResults = [];
  $scope.searchGIF('cat');

  $scope.colors = [
    { name: 'green', hex: '#329E41'},
    { name: 'red', hex: 'red'},
    { name: 'dark', hex: '#444'},
    { name: 'royal', hex: '#46289A'},
    { name: 'orange', hex: '#FF821E'}
  ];

  $scope.setColorActive = function(color) {
    $scope.activeColor = color;
  }

  $scope.setGIFMode = function() {
    $scope.mode = modes.GIF;
  }

  $scope.setEraserMode = function() {
    $scope.eraser = true;
    $scope.gif = false;
  }

  $scope.setDrawMode = function() {
    $scope.eraser = false;
    $scope.mode = modes.DRAW;
  }


  $scope.saveImg = function() {
    $scope.loading = true;

    function toStart() {
      $scope.touched = false;
      $scope.loading = false;
      $scope.givenRating = null;
      $state.go('tab.feed');

      $timeout(function() {
        $ionicScrollDelegate.scrollTop();
      }, 100);
    }

    var staticPostData = Object.assign({
      nick: User.get(),
      added: new Date().getTime(),
      like: 0
    }, $scope.givenRating ? { rate: $scope.givenRating } : {});

    var imageData = {};

    if ($scope.gif && $scope.selectedGIF) {
      imageData = { gif: $scope.selectedGIF };
    } else {
      var canvas = document.getElementById('sketch'),
      context = canvas.getContext('2d'),
      dataUrl = canvas.toDataURL('image/png', 0.5);

      // Show loader
      imageData = { img: dataUrl };
    }

    var postData = Object.assign(staticPostData, imageData);
    Smiley.$add(postData).then(toStart);

  }

  $scope.cancel = function() {
    $state.go('tab.feed')
  }


  // Faceapp integration
  $scope.faceappImg = null;
  $scope.faceappCode = null;
  $scope.faceappLoading = false;

  $scope.setFaceappMode = function() {
    $scope.mode = modes.FACEAPP;
    $timeout(function() {
      $scope.fireCameraUpload();
    }, 100);
  }

  var filters = ['old', 'hot', 'young', 'smile'];
  $scope.filters = filters;
  $scope.filter = filters[0];
  $scope.setFilter = function(filter) {
    $scope.filter = filter;

    $scope.getImageUrl();
  }

  $scope.fireCameraUpload =  function() { document.getElementById("camera-upload").click() }
  $scope.handleFileSelect = function (evt) {

    var f = evt.target.files[0];
    var reader = new FileReader();
    $scope.img = true;
    $scope.faceappLoading = true;
    $scope.faceappCode = null;
    $scope.faceappImg = null;

    reader.onload = (function(theFile) {
      return function(e) {
        var filePayload = e.target.result;

        var img   = new Image()
          width   = 300,
          height  = 300;
          img.src = filePayload;


        img.onload = function() {
          var tempW = img.width,
            tempH = img.height,
            offsetX = 0,
            offsetY = 0,
            limit;

          if (tempW < tempH) {
            offsetY = (tempH-tempW) / 2
            limit = tempW
            tempH *= width / tempW;
            tempW = width;
          } else {
            offsetX = (tempW-tempH) / 2
            limit = tempH
            tempW *= height / tempH;
            tempH = height;
          }

          var canvas = document.createElement('canvas');
          /// set its dimension to target size
          canvas.width = width;
          canvas.height = height;

          var ctx = canvas.getContext('2d');
          ctx.drawImage(img, offsetX, offsetY, limit, limit, 0, 0, width, height);


          /// encode image to data-uri with base64 version of compressed image
          var resizedImg = canvas.toDataURL('image/png');

          var fd = new FormData();
          fd.append('file', f);

          var scope = angular.element(document.getElementById("faceapp-view")).scope();

          Faceapp.post(fd, resizedImg)
          .then(function(res) {
            console.log(res);
            $scope.faceappCode = res.data.code;
            $scope.getImageUrl();
            $scope.faceappLoading = false;
          })
        }
      };
    })(f);
    reader.readAsDataURL(f);
  }

  $scope.getImageUrl = function() {
    $scope.faceappLoading = true;
    var code = $scope.faceappCode;
    var filter = $scope.filter;

    if (!filter || !code) {
      return;
    }

    Faceapp.get(code, filter)
    .then(function(res) {
      var urlCreator = window.URL || window.webkitURL;
      var imageUrl = urlCreator.createObjectURL(res.data);
      $scope.faceappImg = imageUrl;
      $scope.faceappLoading = false;
    })
  }

})
.directive('customOnChange', function() {
  'use strict';

  return {
    restrict: "A",
    link: function (scope, element, attrs) {
      var onChangeFunc = element.scope()[attrs.customOnChange];
      element.bind('change', onChangeFunc);
    }
  };
});
