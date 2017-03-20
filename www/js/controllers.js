angular.module('smileyApp.controllers', [])

.controller('AppCtrl', function($scope, User) {
  // $scope.newItems = '';
  // var last = User.last();
  // Items.$loaded().then(function(data) {
  //   $scope.newItems = data.filter(function(item){
  //     return item.added > last;
  //   }).length;
  // });
})

.controller('IntroCtrl', function($scope, User, $state, $timeout) {

  $scope.$on("$ionicView.leave", function(event, data){
    $scope.saved = false;
  });
  $scope.user = User.get();

  $scope.save = function(username){
    if (username != '') {
      User.save(username);
      $scope.saved = true;
      $timeout( function() {
        $state.go('tab.feed')
      }, 1000);
    } else {
      $scope.failed = true
    }
  }
});
