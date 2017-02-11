// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 
        'starter.controllers',
         'pos.config',
        'yaru22.angular-timeago',
         'starter.services',
         'ui.odometer',
         'angular-hidScanner',
         "pos.transactions",
         "pos.pos",
         "pos.inventory"])

.run(function($ionicPlatform,$rootScope,$state) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
      window.addEventListener('native.keyboardshow', function(){
        document.body.classList.add('keyboard-open');
      });

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
    $rootScope.goto=function(str){
      $state.go(str);
    }
  });
})

.config(function($stateProvider, $urlRouterProvider,$httpProvider) {

    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common["X-Requested-With"];
 

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'loginCtrl'
  })
    .state('register', {
    url: '/register',
    templateUrl: 'templates/register.html',
    controller: 'registerCtrl'
  })
  .state('userprofile', {
      url: '/userprofile',
      templateUrl: 'templates/userprofile.html',
      controller: 'userprofileCtrl'
    })
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html',
    controller: 'tabCtrl'
  })

  // Each tab has its own nav history stack:

  .state('tab.pos', {
    url: '/pos',
    views: {
      'tab-pos': {
        templateUrl: 'templates/pos.html',
        controller: 'posCtrl'
      }
    }
  })

  .state('tab.transactions', {
      url: '/transactions',
      views: {
        'tab-transactions': {
          templateUrl: 'templates/transactions.html',
          controller: 'transactionsCtrl'
        }
      }
    })
  .state('tab.search', {
      url: '/search',
      views: {
        'tab-search': {
          templateUrl: 'templates/search.html',
          controller: 'searchCtrl'
        }
      }
    })
  .state('tab.location', {
      url: '/location',
      views: {
        'tab-search': {
          templateUrl: 'templates/location.html',
          controller: 'locationCtrl'
        }
      }
    })
    .state('tab.transaction-detail', {
      url: '/transaction',
      params:{
        transactionId:null
      },
      views: {
        'tab-transactions': {
          templateUrl: 'templates/transaction-detail.html',
          controller: 'transactionDetailCtrl'
        }
      }
    })

  .state('tab.inventory', {
    url: '/inventory',
    views: {
      'tab-inventory': {
        templateUrl: 'templates/inventory.html',
        controller: 'inventoryCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/pos');

}).config(['$ionicConfigProvider', function($ionicConfigProvider) {

    $ionicConfigProvider.tabs.position('bottom'); // other values: top

}]);
