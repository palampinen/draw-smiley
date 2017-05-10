angular.module('smileyApp.controllers')

.controller('FeedItemCtrl', function($scope, $stateParams, $ionicPopup, $timeout, $state, SmileyService, Helpers, User) {

  // Single Smiley mode
  $scope.loading = true;
  SmileyService.get($stateParams.smileyId)
  .$loaded()
  .then(function(data) {
    $scope.smiley = data;
    $scope.loading = false;


    // Find users other posts
    if (data.nick) {
      var usersSmileysQuery = SmileyService.findByUser(data.nick);

      usersSmileysQuery.$loaded().then(function(userSmileyData) {
        $scope.smileysFromUser = userSmileyData;
      });
    }

  });

  $scope.getTimeAgo = Helpers.getTimeAgo;


  // Remove
  $scope.userName = User.get();

  $scope.removeItem = function(item) {
    var itemDate = Helpers.getTimeAgo(item.added);
    var confirmPopup = $ionicPopup.confirm({
     title: 'Remove Post from ' + itemDate + '?'
     // template: 'Are you sure you want to eat this ice cream?'
    });

    confirmPopup.then(function(res) {
      if(res) {
        removeSmiley(item)
      }
    });
  };

  var removeSmiley = function(item) {
    $scope.loading = true;
    SmileyService.remove(item).then(function() {
      $timeout(function() {
        $state.go('tab.feed')
        $scope.loading = false;
      }, 300)
    });
  };

})
