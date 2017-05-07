angular.module('smileyApp.controllers')

.controller('FeedItemCtrl', function($scope, $stateParams, $timeout, $state, SmileyService, Helpers, User) {

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

      usersSmileysQuery.$loaded().then(function(data) {
        $scope.smileysFromUser = data;
      });
    }

  });

  $scope.getTimeAgo = Helpers.getTimeAgo;


  // Remove
  $scope.userName = User.get();

  $scope.removeItem = function(item) {
    if (confirm('Remove post from ' + Helpers.getTimeAgo(item.added) + '?')) {
      $scope.loading = true;
      SmileyService.remove(item).then(function() {
        $timeout(function() {
          $state.go('tab.feed')
          $scope.loading = false;
        }, 300)
      });
    }
  };

})
