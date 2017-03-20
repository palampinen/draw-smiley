angular.module('smileyApp.controllers')
.controller('FeedCtrl', function($scope, SmileyService, $timeout, User, Helpers) {

  // Compact mode toggle
  $scope.compact = User.getCompactMode();
  $scope.toggleCompactMode = function() {
    var currentCompactState = $scope.compact;
    var nextCompactState = !currentCompactState
    $timeout(function() {
      $scope.compact = nextCompactState;
      User.setCompactMode(nextCompactState);
    });
  };

  $scope.showDates = User.getShowDatesMode();
  $scope.toggleShowDateMode = function() {
    var currentShowDateState = !!$scope.showDates;
    var nextShowDateState = !currentShowDateState
    $timeout(function() {
      $scope.showDates = nextShowDateState;
      User.setShowDatesMode(nextShowDateState);
    });
  }


  // Load content
  $scope.lastChecked = User.lastChecked();
  $scope.items = [];

  $scope.loading = true;
  var unwatch;
  SmileyService.load(36).$loaded().then(function(data) {

    unwatch = data.$watch(onItemChange);

    $scope.items = data;
    $scope.loading = false;
  });

  // $scope.$on("$ionicView.leave", function(){
  //   console.log('unregister watcher');
  //   unwatch();
  // });


  //  Get time passed from last action
  $scope.getTimeAgo = Helpers.getTimeAgo;

  // Inifinite scroll
  var loadMoreCount = 0;
  $scope.bottomReached = false;
  $scope.loadMore = function() {

    if ($scope.bottomReached) {
      $scope.$broadcast('scroll.infiniteScrollComplete');
      return false;
    }

    loadMoreCount += 10;
    SmileyService.load($scope.items.length + loadMoreCount).$loaded().then(function(data) {
      if ($scope.items.length === data.length) {
        $scope.bottomReached = true;
      } else {
        $scope.items = data
      }

      $scope.$broadcast('scroll.infiniteScrollComplete');

    });
  }

  // Like count change animations
  $scope.animatingItems = {};
  var onItemChange = function(changeEvent) {
    if (changeEvent.event === 'child_changed') {
      $timeout(function() {
        $scope.animatingItems[changeEvent.key] = true;
        $timeout(function() {
          delete $scope.animatingItems[changeEvent.key];
        }, 1000)
      }, 0);
    }
  }

  // time calc
  $scope.isSameDay = function(a, b) {
    // console.log(moment(a).toISOString() + ' - ' + moment(b).toISOString(), moment(a).isSame(moment(b), 'day'));
    return a && b && moment(a).isSame(moment(b), 'day');
  }
  var today = moment();
  $scope.getDateLabel = function(date) {
    var momentDate = moment(date);
    return momentDate.isSame(today, 'day')
      ? 'Today'
      : moment(date).format('ddd D.M.');
  }

});
