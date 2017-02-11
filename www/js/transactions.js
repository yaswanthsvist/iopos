angular.module('pos.transactions',[])
.controller('transactionsCtrl', function($scope, transactions,$rootScope,$state) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});
  $scope.$on("$ionicView.beforeEnter", function(event, data){
   $rootScope.presentView="INV";
        var str=localStorage.getItem("transactions");
   //   $rootScope.transactions=$rootScope.transactions||JSON.parse(str);
    $scope.transactions = transactions.all();
    console.log($scope.transactions);
  });
  $scope.goToTransaction=function(transactionId){
    console.log("gotoTransaction");
    $state.go("tab.transaction-detail",{transactionId:transactionId});
  }
  $scope.$on('$ionicView.enter', function(){
//    $rootScope.presentView="POS";
      console.dir("$rootScope.transaction");
  });
  $scope.remove = function(chat) {
    transactions.remove(chat);
  };
})
.controller('transactionDetailCtrl', function($scope,$rootScope, $stateParams, transactions) {
  $scope.$on("$ionicView.beforeEnter", function(event, data){
   $rootScope.presentView="INV";
   console.log($stateParams.transactionId);
   $scope.transaction = transactions.get($stateParams.transactionId);
    console.log($scope.transaction);
  });
});
