
angular.module('smileyApp.controllers')

.controller('DrawCtrl', function($scope, $state, Smiley, SmileyStorage, Post, $ionicScrollDelegate, $timeout, Helpers, $http, User) {

  var modes = {
    GIF: 'GIF',
    DRAW: 'DRAW',
    PHOTO: 'PHOTO',
  };

  $scope.modes = modes;
  $scope.mode = modes.DRAW;
  $scope.loading = false;

  // Reset tools when view is closed
  $scope.$on("$ionicView.leave", function(){
    $scope.givenRating = null;
    $scope.touched = false;
    clearCanvas();
    clearTools();
  });



  //
  // # Initial week rate
  //
  $scope.rateWeek = function(rating) {
    $scope.givenRating = rating;

    // Timeout for animating transition
    $timeout(function() {
      $scope.touched = true;

      // Launch Sketch (jQuery!)
      $timeout(function() {
        $('#sketch').sketch({ defaultColor: '#329E41'});
      });
    }, 400);
  };


  //
  // # DRAW Mode
  //
  $scope.setDrawMode = function() {
    $scope.eraser = false;
    $scope.mode = modes.DRAW;
  }

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

  // Clear canvas by re-rendering it with toggling scope variable
  var clearCanvas = function() {
    $timeout(function() { $scope.clearingCanvas = true;
      $timeout(function() { delete $scope.clearingCanvas; });
    });
  }

  // Set default tool settings
  var clearTools = function() {
    $scope.setColorActive($scope.colors[0].name);
    $scope.setDrawMode();
  }


  //
  // # GIF Mode
  //
  $scope.setGIFMode = function() {
    $scope.mode = modes.GIF;
  }

  var delayedGifLoad = null;
  $scope.searchGIF = Helpers.debounce(function(term) {

    if (!term) {
      return;
    }

    $http.get(`https://api.giphy.com/v1/gifs/search?q=${term}&limit=30&api_key=dc6zaTOxFJmzC`).then(function (results) {

      if (delayedGifLoad) {
        $timeout.cancel(delayedGifLoad);
      }

      var res = results.data.data;
      var firstLoad = 6;

      var firstPart = res.slice(0, firstLoad);
      var secondPart = res.slice(firstLoad, res.length);

      $scope.GIFResults = firstPart.map(function(item) {
        return item.images.downsized.url;
      });

      delayedGifLoad = $timeout(function() {
        var delayedSetOfGifs = res.map(function(item) {
          return item.images.downsized.url;
        });
        $scope.GIFResults = delayedSetOfGifs;

      }, 100);


    })
  }, 500);

  $scope.submitGIFSearch = function() {
    document.getElementById('gif-search').blur();
  }

  $scope.GIFResults = [];
  $scope.searchGIF('cat');

  $scope.setEraserMode = function() {
    $scope.eraser = true;
    $scope.gif = false;
  }


  //
  // # PHOTO Mode
  //
  var isMobile = ionic.Platform.isIOS() || ionic.Platform.isAndroid();
  $scope.setPhotoMode = function() {
    $scope.mode = modes.PHOTO;
    $scope.photoImg = null;

    // Auto start camera with mobile phone
    if (isMobile) {
      $timeout(function() {
        $scope.fireCameraUpload();
      });
    }
  }

  $scope.photoImg = null;

  var setPhotoImg = function(imgData) {
    $timeout(function() {
      $scope.photoImg = imgData;
    });
  }


  $scope.fireCameraUpload =  function() { document.getElementById("camera-upload").click() }

  var exifInfo = null;
  $scope.handleFileSelect = function (evt) {
    var file = evt.target.files[0];

    loadImage.parseMetaData(
      file,
      function (data) {
        exifInfo = data.exif ? data.exif[0x0112] : null;
      },
      { maxMetaDataSize: 262144, disableImageHead: false}
    );

    $timeout(function() {
      loadImage(
        file,
        function (img) {
          var photo = img.toDataURL('image/jpeg', 0.8);
          setPhotoImg(photo);
        },
        {
          crop: true,
          maxWidth: 250,
          maxHeight: 250,
          canvas: true,
          orientation: exifInfo
        }
      );
    }, 500);
  }


  //
  // # Saving post
  // Different logic for saving Drawing, GIF and Photo
  $scope.saveImg = function() {
    $scope.loading = true;

    function toStart() {
      $scope.touched = false;
      $scope.loading = false;
      $scope.givenRating = null;
      $scope.photoImg = null;

      $state.go('tab.feed');

      $timeout(function() {
        $ionicScrollDelegate.scrollTop();
      }, 100);
    }

    var staticPostData = Object.assign({
      nick: User.get(),
      added: new Date().getTime(),
      like: 0,
      type: $scope.mode
    }, $scope.givenRating ? { rate: $scope.givenRating } : {});

    var imageData = {}, postData;
    //
    // # Upload GIF Mode
    //
    if ($scope.mode === modes.GIF && $scope.selectedGIF) {
      imageData = { gif: $scope.selectedGIF };
      postData = Object.assign(staticPostData, imageData);

      Smiley.$add(postData).then(toStart);
    } else if ($scope.mode === modes.PHOTO) {
    //
    // # Upload PHOTO Mode
    //
      // empty img not allowed
      if (!$scope.photoImg) {
        return;
      }

      Post.savePostImg($scope.photoImg, staticPostData, toStart);
    } else {
    //
    // # Upload DRAW Mode
    //

      // Transform canvas to data url
      var canvas  = document.getElementById('sketch'),
          context = canvas.getContext('2d'),
          dataUrl = canvas.toDataURL('image/png', 0.4);

      Post.savePostImg(dataUrl, staticPostData, toStart);
    }
  }

  $scope.cancel = function() {
    $state.go('tab.feed')
  }

})

// This is used on file-input as onChange event launcher
// Usage: <input type="file" custom-on-chhange="myOnChangeFunction" />
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
