// Smiley App
angular.module('smileyApp',
[
  'ionic',
  'smileyApp.controllers',
  'smileyApp.services',
  'firebase',
  'templates',
  'config'
])

.run(function($ionicPlatform, $state, User) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    if(!User.get())
     $state.go('intro')

  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

  $ionicConfigProvider.tabs.position('bottom');
  // $ionicConfigProvider.views.transition('android');
  // $ionicConfigProvider.views.transition('none');
  $ionicConfigProvider.navBar.alignTitle('left');
  $ionicConfigProvider.spinner.icon('android');
  $ionicConfigProvider.backButton.previousTitleText(false);
  $ionicConfigProvider.backButton.text('');

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

    // setup an abstract state for the tabs directive
    .state('tab', {
      url: "",
      abstract: true,
      templateUrl: "tabs.html",
      controller:'AppCtrl'
    })

    // Each tab has its own nav history stack:

    .state('tab.draw', {
      url: '/draw',
      views: {
        'tab-draw': {
          templateUrl: 'tab-drawing.html',
          controller: 'DrawCtrl'
        }
      }
    })

    .state('tab.feed', {
      url: '/feed',
      views: {
        'tab-feed': {
          templateUrl: 'tab-feed.html',
          controller: 'FeedCtrl'
        }
      }
    })

    .state('tab.feedItemForUser', {
      url: '/user/:userName',
      views: {
        'tab-feed': {
          templateUrl: 'tab-feed-user.html',
          controller: 'FeedUserCtrl'
        }
      }
    })

    .state('tab.feedItem', {
      url: '/feed/:smileyId',
      views: {
        'tab-feed': {
          templateUrl: 'tab-feed-item.html',
          controller: 'FeedItemCtrl'
        }
      }
    })

    .state('tab.account', {
      url: '/account',
      views: {
        'tab-feed': {
          templateUrl: 'tab-account.html',
          controller: 'IntroCtrl'
        }
      }
    })
    .state('intro', {
        url: '/intro',
        templateUrl: 'tab-intro.html',
        controller: 'IntroCtrl'
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/feed');

});
