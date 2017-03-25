
angular.module('smileyApp.controllers')

.controller('DrawCtrl', function($scope, Smiley, $state, $ionicScrollDelegate, $timeout, $http, User) {

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

  $scope.showContent = function() {
    $scope.touched = true;
    $timeout( function() {
      $('#sketch').sketch({ defaultColor: '#329E41'});
    }, 10);
  };

  $scope.searchGIF = debounce(function(term) {
    $http.get(`http://api.giphy.com/v1/gifs/search?q=${term}&api_key=dc6zaTOxFJmzC`).then(function (results) {
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

    function toStart() {
      $scope.touched = false;
      $scope.loading = false;
      $state.go('tab.feed');

      $timeout(function() {
        $ionicScrollDelegate.scrollTop();
      }, 100);
    }

    if($scope.gif && $scope.selectedGIF) {
      Smiley.$add({
        nick: User.get(),
        added: new Date().getTime(),
        gif: $scope.selectedGIF,
        like: 0
      }).then(toStart);
    } else {
      var canvas = document.getElementById('sketch'),
      context = canvas.getContext('2d'),
      dataUrl = canvas.toDataURL('image/png', 0.5);

      // Show loader
      $scope.loading = true;

      if (dataUrl != 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAYAAAB5fY51AAABdElEQVR4nO3BMQEAAADCoPVPbQwfoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD+Bn+3AAEkkD9cAAAAAElFTkSuQmCC') {
        Smiley.$add({ nick: User.get(), added: new Date().getTime(), img: dataUrl, like: 0 }).then(toStart);
      }
    }
  }

  $scope.cancel = function() {
    $state.go('tab.feed')
  }

})
