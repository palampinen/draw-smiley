angular
  .module("smileyApp.controllers")
  .controller("FeedCtrl", function(
    $scope,
    SmileyService,
    $timeout,
    User,
    Helpers
  ) {
    $scope.$on("$ionicView.enter", function() {
      $timeout(function() {
        $scope.userName = User.get();
      });
    });

    // List mode toggle
    $scope.listMode = false;

    // Show dates
    $scope.showDates = true;

    var periodLabelFormat = "YYYY-W";

    // Load content
    $scope.lastChecked = User.lastChecked();
    $scope.items = [];
    var periodAgo = 0;

    var getLoadDate = function(periodsAgo) {
      var ago = periodsAgo || 0;
      return moment()
        .startOf("isoWeek")
        .subtract(ago, "weeks")
        .valueOf();
    };

    var unwatch;
    $scope.loading = true;

    SmileyService.loadBefore(getLoadDate(periodAgo))
      .$loaded()
      .then(function(data) {
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

    // Load more data
    loadPeriodData = function(direction) {
      if ($scope.loading) {
        return;
      }

      if (direction) {
        periodAgo += direction;
      }

      $scope.loading = true;
      var before = getLoadDate(periodAgo);
      var after = getLoadDate(periodAgo - 1);

      SmileyService.loadBefore(before, after)
        .$loaded()
        .then(function(data) {
          $scope.items = data;
          $scope.loading = false;
        });
    };

    $scope.loadPrevPeriod = function() {
      loadPeriodData(1);
    };
    $scope.loadNextPeriod = function() {
      loadPeriodData(-1);
    };

    // Like count change animations
    $scope.animatingItems = {};
    var onItemChange = function(changeEvent) {
      if (changeEvent.event === "child_changed") {
        $timeout(function() {
          $scope.animatingItems[changeEvent.key] = true;
          $timeout(function() {
            delete $scope.animatingItems[changeEvent.key];
          }, 1000);
        }, 0);
      }
    };

    // Period (day, week) based content splitting
    var periods = {
      WEEK: "week",
      DAY: "day"
    };

    var chosenPeriod = periods.WEEK;
    var startDate = moment().startOf("week");
    var prevStartDate = moment()
      .subtract(1, "week")
      .startOf("week");

    var getPeriodFormats = function(period) {
      switch (period) {
        case periods.WEEK:
          return {
            same: "This Week",
            prev: "Last Week",
            dateString: "Week ",
            dateFormat: "w",
            id: "weeks"
          };

        case periods.DAY:
          return {
            same: "Today",
            prev: "Yesteday",
            dateString: "",
            dateFormat: "ddd D.M.",
            id: "days"
          };
      }
    };

    $scope.isNextWeekInFuture = function() {
      return periodAgo <= 0;
    };

    $scope.isNextWeekInFuture = function() {
      return periodAgo <= 0;
    };

    $scope.isInSamePeriod = function(a, b) {
      return a && b && moment(a).isSame(moment(b), chosenPeriod);
    };

    $scope.getPeriodLabel = function() {
      var format = getPeriodFormats(chosenPeriod);
      var momentDate = moment().subtract(periodAgo, format.id);

      if (momentDate.isSame(startDate, chosenPeriod)) {
        return format.same;
      }

      if (momentDate.isSame(prevStartDate, chosenPeriod)) {
        return format.prev;
      }

      return format.dateString + momentDate.format(format.dateFormat);
    };

    $scope.getTotalRatingsForDate = function(date) {
      var format = getPeriodFormats(chosenPeriod);
      var momentDate = moment().subtract(periodAgo, format.id);

      var totalRatedPostsForDate = ($scope.items || []).filter(function(
        smiley
      ) {
        return (
          smiley.rate && momentDate.isSame(moment(smiley.added), chosenPeriod)
        );
      });

      if (totalRatedPostsForDate.length === 0) {
        return "-";
      }

      var avg =
        (totalRatedPostsForDate || []).reduce(function(acc, smiley) {
          return acc + (smiley.rate || 0);
        }, 0) / totalRatedPostsForDate.length;

      return avg.toFixed(1);
    };

    $scope.resetPeriodNavigation = function() {
      periodAgo = 0;
      loadPeriodData();
    };
  });
