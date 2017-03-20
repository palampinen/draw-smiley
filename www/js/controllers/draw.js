angular.module('smileyApp.controllers')

.controller('DrawCtrl', function($scope, Smiley, $state, $ionicScrollDelegate, $timeout, User) {
  $scope.loading = false;

  $scope.showContent = function() {
    $scope.touched = true;
    $timeout( function() {
      $('#sketch').sketch({ defaultColor: '#329E41'});
    }, 10);
  };

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

  $scope.saveImg = function() {
    var canvas = document.getElementById('sketch'),
    context = canvas.getContext('2d'),
    dataUrl = canvas.toDataURL('image/png');

    // Show loader
    $scope.loading = true;


    if (dataUrl != 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAYAAAB5fY51AAABdElEQVR4nO3BMQEAAADCoPVPbQwfoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD+Bn+3AAEkkD9cAAAAAElFTkSuQmCC') {
      Smiley.$add({ nick: User.get(), added: new Date().getTime(), img: dataUrl, like: 0 }).then(function(data) {
        $scope.touched = false;
        $scope.loading = false;
        $state.go('tab.feed');

        $timeout(function() {
          $ionicScrollDelegate.scrollTop();
        }, 100);

      });
    }
  }

  $scope.cancel = function() {
    $state.go('tab.feed')
  }

})
