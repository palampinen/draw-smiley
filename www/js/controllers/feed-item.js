angular.module('smileyApp.controllers')

.controller('FeedItemCtrl', function($scope, $stateParams, SmileyService, Helpers) {

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
})
