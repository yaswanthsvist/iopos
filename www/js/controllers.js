angular.module('starter.controllers', [])

.controller('tabCtrl', function($scope,$state,$rootScope, $stateParams, transactions) {
  console.log("tabCtrl");
  $scope.$on("$ionicView.enter",function(event,data){
    $rootScope.side_menu = document.getElementsByTagName("ion-side-menu")[0];
  });
  $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromParams, toParams) {
    if (toState.name != "tab.location") {
        $rootScope.side_menu.style.visibility = "visible";
    }
});
  $scope.logout=function(){
    localStorage.clear();
    $state.go("login");
  }

})
.controller('loginCtrl', function($scope,$rootScope, $stateParams, $http,$state) {
  $scope.user={};
  $scope.login=function(user){
    $http({
          method: 'POST',
          data:{
            username:user.name,
            password:user.pwd
          },
          url: 'http://gallishops.in:3000/login'
        }).then(
          function successCallback(response) {
            console.log(response);
            $rootScope.token=response.data.token;
            $rootScope.user=response.data.user;
            localStorage.setItem("userData",JSON.stringify(user))
            localStorage.setItem("authData",JSON.stringify(response.data.user))
            $state.go("tab.pos")
          },
           function errorCallback(response) {
          }
        );
  }
  $scope.$on("$ionicView.beforeEnter", function(event, data){
   var str=localStorage.getItem("userData");
   var tempUser=JSON.parse(str);
    if(tempUser!=null){
         var auth=localStorage.getItem("authData");
         $rootScope.user=JSON.parse(auth);
      $scope.login(tempUser);
    }
    console.log("loginCtrl");
  });
})
.controller('registerCtrl', function($scope,$rootScope, $stateParams, $http) {
  $scope.user={};
  $scope.login=function(user){
    $http({
          method: 'POST',
          data:{username:user.name,password:user.pwd},
          url: 'http://gallishops.in:3000/register'
        }).then(
          function successCallback(response) {
            console.log(response);
          },
           function errorCallback(response) {
          }
        );
  }
  console.log("registerCtrl");
})


.controller('searchCtrl', function($scope, $stateParams, transactions,$http,$rootScope) {
  $scope.search={};
  $scope.searchList=[];
  $scope.searchPrd = function(){
    console.log($scope.search.txt);
    if($scope.search.txt.length>=3)
    $http({
          method: 'POST',
          headers: {
            'Authorization':'Bearer '+$rootScope.token},
          data:{search:$scope.search.txt},
          url: 'http://gallishops.in:3000/search'
        }).then(
          function successCallback(response) {
            console.log(response.data);
              $scope.searchList=[];
            for(var i=0;i<response.data.length;i++){
              $scope.searchList.push(response.data[i]);
            }
          },
           function errorCallback(response) {
          }
    );
  }
})
.controller('locationCtrl', function($scope, $stateParams, transactions,$http,$rootScope,config) {
  $scope.search={};
  var div = null;
  $scope.$on('$ionicView.enter', function(){
    $rootScope.side_menu.style.visibility = "hidden";
    $rootScope.presentView="POS";
    if(
      typeof plugin !=='undefined'&&

      plugin.google.maps!=undefined){
      console.log("plugin.google.maps location");
      div=document.getElementById("map_canvas");
/*        if(navigator!=undefined){
          navigator.geolocation.getCurrentPosition(geolocationSuccess,
                                         geoError,
                                         { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true });
        }
*/          getHomeLocation();
    }
  });
  function getHomeLocation(){
    $http({
      method: 'POST',
      headers: {
        'Authorization':'Bearer '+$rootScope.token},
      data:{
        user_id: $rootScope.user.id,
        user_type:config.user_type
      },
      url: 'http://gallishops.in:3000/getLocation'
    })
    .then(
      function successCallback(response) {
        console.dir(response.data[0]);
        homeLocationSuccess(response.data[0]);
      },
       function errorCallback(response) {
    });
  }
  function homeLocationSuccess(position){
    var lon=parseFloat(position[0].slice(0,10));
    var lat=parseFloat(position[1].slice(0,10));

    console.log(lon,lat);
    if(div==null){
      return;
    }
      const HOME = new plugin.google.maps.LatLng(lat,lon);
      var map = plugin.google.maps.Map.getMap(div, {
        'camera': {
          'latLng': HOME,
          'zoom': 17
         }
      });
      map.addEventListener(plugin.google.maps.event.MAP_READY, function() {
        map.addMarker({
            'position': HOME,
            'title': "ur Home!"
          }, function(marker) {
              marker.showInfoWindow();
          });
      });
    console.dir(position);
  }
    function geolocationSuccess(position){
      const HOME = new plugin.google.maps.LatLng(position.coords.latitude,position.coords.longitude);
      var map = plugin.google.maps.Map.getMap(div, {
        'camera': {
          'latLng': HOME,
          'zoom': 17
         }
      });
      map.addEventListener(plugin.google.maps.event.MAP_READY, function() {
        map.addMarker({
            'position': HOME,
            'title': "ur here!"
          }, function(marker) {
              marker.showInfoWindow();
          });
      });
      console.log('Latitude: '          + position.coords.latitude          + '\n' +
            'Longitude: '         + position.coords.longitude         + '\n' +
            'Altitude: '          + position.coords.altitude          + '\n' +
            'Accuracy: '          + position.coords.accuracy          + '\n' +
            'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
            'Heading: '           + position.coords.heading           + '\n' +
            'Speed: '             + position.coords.speed             + '\n' +
            'Timestamp: '         + position.timestamp                + '\n');
  }
  function geoError(error) {
        alert('code: '    + error.code    + '\n' +
              'message: ' + error.message + '\n');
    }

})
.controller('userprofileCtrl', function($scope, $stateParams, transactions,$http,$rootScope,config,$ionicHistory) {
  $scope.search={};
   var div = null;
    
    $scope.$on('$ionicView.enter', function(){
    $rootScope.presentView="profile";
  });

  $scope.saveLocation=function(){
    if(plugin.google.maps){
      console.log("plugin.google.maps location");
      div=document.getElementById("map_canvas");
      if(navigator!=undefined){
        navigator.geolocation.getCurrentPosition(geolocationSuccess,
                                         geoError,
                                         { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true });
      }
    }
  }
  $scope.goBack=function(){
    console.log("goBack");
    window.history.back();
  }
    function geolocationSuccess(position){
      $http({
          method: 'POST',
          headers: {
            'Authorization':'Bearer '+$rootScope.token},
          data:{
            user_id: $rootScope.user.id,
            user_type:config.user_type,
            lat: position.coords.latitude,
            lon: position.coords.longitude
          },
          url: 'http://gallishops.in:3000/setLocation'
      })
      .then(
          function successCallback(response) {
            console.log(response.data);
              $scope.searchList=[];
            for(var i=0;i<response.data.length;i++){
              $scope.searchList.push(JSON.parse(response.data[i]));
            }
          },
           function errorCallback(response) {
          }
      );
      console.log('Latitude: '          + position.coords.latitude          + '\n' +
              'Longitude: '         + position.coords.longitude         + '\n' +
              'Altitude: '          + position.coords.altitude          + '\n' +
              'Accuracy: '          + position.coords.accuracy          + '\n' +
              'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
              'Heading: '           + position.coords.heading           + '\n' +
              'Speed: '             + position.coords.speed             + '\n' +
              'Timestamp: '         + position.timestamp                + '\n');
  }
  function geoError(error) {
        alert('code: '    + error.code    + '\n' +
              'message: ' + error.message + '\n');
    }

});
