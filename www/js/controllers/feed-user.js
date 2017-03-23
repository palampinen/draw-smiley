angular.module('smileyApp.controllers')

.controller('FeedUserCtrl', function($scope, $stateParams, SmileyService, Helpers, User) {


  var today = moment();

  $scope.$on("$ionicView.enter", function(){

    var userName = $stateParams.userName;
    var isMyPage = User.get() === userName;

    $scope.isMyPage = isMyPage;
    $scope.title = isMyPage ? 'My smileys' : 'Smileys from '+ userName;
  });


  $scope.loading = true;
  var usersSmileysQuery = SmileyService.findByUser($stateParams.userName);

  usersSmileysQuery.$loaded().then(function(data) {
    $scope.smileysFromUser = data;
    $scope.loading = false;
  });

  $scope.getSmileysThisWeek = function() {
    return ($scope.smileysFromUser || []).filter(function(smiley) {
    return moment(smiley.added).isSame(today, 'week')
    }).length;
  }

  $scope.getSmileysThisMonth = function() {
    return ($scope.smileysFromUser || []).filter(function(smiley) {
    return moment(smiley.added).isSame(today, 'month')
    }).length;
  }

  $scope.getTotalLikes = function() {
    return ($scope.smileysFromUser || []).reduce(function(acc, smiley) {
    return acc + (smiley.like || 0);
    }, 0);
  }




  $scope.getTimeAgo = Helpers.getTimeAgo;
})
