
angular.module('smileyApp.controllers')

.controller('DrawCtrl', function($scope, Smiley, $state, $ionicScrollDelegate, $timeout, $http, User) {

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
    $scope.gif = true;
  }

  $scope.setEraserMode = function() {
    $scope.eraser = true;
    $scope.gif = false;
  }

  $scope.setDrawMode = function() {
    $scope.eraser = false;
    $scope.gif = false;
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

    var imageData = {}, postData;

    if ($scope.mode === modes.GIF && $scope.selectedGIF) {
      imageData = { gif: $scope.selectedGIF };
      postData = Object.assign(staticPostData, imageData);

      Smiley.$add(postData).then(toStart);
    } else {
      // Transform canvas to data url
      var canvas = document.getElementById('sketch'),
      context = canvas.getContext('2d'),
      dataUrl = canvas.toDataURL('image/png', 0.4);

      // Upload Image to Firebase Storage
      SmileyStorage.uploadDataUrl({
        name: Helpers.composeFileName(staticPostData.added, staticPostData.nick),
        data: dataUrl
      })
      .then(function(snapshot) {
        // Save Smiley to Firebase with Storage Image URL
        imageData = { img: snapshot.downloadURL };
        postData = Object.assign(staticPostData, imageData);

        Smiley.$add(postData).then(toStart);
      });
    }
  }

  $scope.cancel = function() {
    $state.go('tab.feed')
  }

});
