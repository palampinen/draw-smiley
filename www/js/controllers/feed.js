angular.module('smileyApp.controllers')
.controller('FeedCtrl', function($scope, SmileyService, $timeout, User, Helpers) {

  $scope.$on("$ionicView.enter", function(){
    $timeout(function() {
      $scope.userName = User.get();
    })
  });

  // List mode toggle
  $scope.listMode = User.getListMode();
  $scope.toggleListMode = function() {
    var currentListModeState = $scope.listMode;
    var nextListModeState = !currentListModeState
    $timeout(function() {
      $scope.listMode = nextListModeState;
      User.setListMode(nextListModeState);
    });
  };

  $scope.showDates = true; // User.getShowDatesMode();
  // $scope.toggleShowDateMode = function() {
  //   var currentShowDateState = !!$scope.showDates;
  //   var nextShowDateState = !currentShowDateState
  //   $timeout(function() {
  //     $scope.showDates = nextShowDateState;
  //     User.setShowDatesMode(nextShowDateState);
  //   });
  // }


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

  // Period (day, week) based content splitting
  var periods = {
    WEEK: 'week',
    DAY: 'day'
  };

  var chosenPeriod = periods.WEEK;
  var startDate = moment().startOf('week');
  var prevStartDate = moment().subtract(1, 'week').startOf('week');

  var getPeriodFormats = function(period) {
    switch(period) {
      case periods.WEEK:
        return { same: 'This Week', prev: 'Last Week', dateString: 'Week ', dateFormat: 'w' };

      case periods.DAY:
        return { same: 'Today', prev: 'Yesteday', dateString: '', dateFormat: 'ddd D.M.' }
    }
  }

  $scope.isInSamePeriod = function(a, b) {
    return a && b && moment(a).isSame(moment(b), chosenPeriod);
  }

  $scope.getPeriodLabel = function(date) {
    var momentDate = moment(date);
    var format = getPeriodFormats(chosenPeriod);

    if (momentDate.isSame(startDate, chosenPeriod)){
      return format.same;
    }
    if (momentDate.isSame(prevStartDate, chosenPeriod)){
      return format.prev;
    }
    return format.dateString + momentDate.format(format.dateFormat);
  }

  $scope.getTotalRatingsForDate = function(date) {
    var momentDate = moment(date);
    var totalRatedPostsForDate = ($scope.items || [])
    .filter(function(smiley) {
      return smiley.rate && momentDate.isSame(moment(smiley.added), chosenPeriod)
    });

    if (totalRatedPostsForDate.length === 0) {
      return '-';
    }

    var avg = (totalRatedPostsForDate || []).reduce(function(acc, smiley) {
      return acc + (smiley.rate || 0);
    }, 0) / totalRatedPostsForDate.length;

    return avg.toFixed(1);
  }


});
