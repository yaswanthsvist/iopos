angular.module('pos.inventory',[])
.controller('inventoryCtrl', function($scope,$rootScope,$http,$ionicModal) {
  $scope.settings = {
    enableFriends: true
  };
  $scope.addBarcodeManually=function(){
    $scope.updateProduct={};
    $scope.updateProduct.modalBarcode=null;
    $scope.modalBarcode=null;
    $scope.updateProduct.name='';
    $scope.updateProduct.price=0;
    $scope.barcodeModal.show();
  }
$scope.manualBarcodeUpdate=function(updateProduct){
  console.dir($rootScope.updateProduct);
    if(updateProduct.name==undefined||updateProduct.price==undefined){
      console.log("undefined",updateProduct);
      return 0;
    }
    console.dir(updateProduct);
    $http({
          method: 'POST',
          data:{bar_code:updateProduct.modalBarcode,data:updateProduct},
          url: 'http://gallishops.in:3000/setBarCode'
        }).then(
          function successCallback(response) {
            console.log(response);
          },
           function errorCallback(response) {
          }
        );
    if($rootScope.user.id!=undefined)
    $http({
          method: 'POST',
          headers: {
            'Authorization':'Bearer '+$rootScope.token},
          data:{
            shop_id:$rootScope.user.id,
            bar_code:updateProduct.modalBarcode,
            price:updateProduct.price,
            qty:updateProduct.qty
          },
          url: 'http://gallishops.in:3000/addInventory'
        }).then(
          function successCallback(response) {
            console.log(response);
          },
           function errorCallback(response) {
          }
        );
    
}

  $scope.$on("$ionicView.beforeEnter", function(event, data){
    console.dir($rootScope.user);
    if($rootScope.user!=undefined && $rootScope.user.id!=undefined){
       $scope.updateProduct={};
       $http({
          method: 'POST',
          headers: {
            'Authorization':'Bearer '+$rootScope.token},
          data:{
            shop_id:$rootScope.user.id
          },
          url: 'http://gallishops.in:3000/getInventory'
        }).then(
          function successCallback(response) {
            console.log(response);
          },
           function errorCallback(response) {
          }
        );
    }
    $rootScope.presentView="INV";
    var str=localStorage.getItem("inventory");
    $rootScope.inventory=$rootScope.inventory||JSON.parse(str);
    console.log($rootScope.inventory);
  });
  $ionicModal.fromTemplateUrl('productDetail.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });
  $ionicModal.fromTemplateUrl('manualBarcodeUpdate.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.barcodeModal = modal;
  });
  $scope.$on("hidScanner::scanned",function(e,obj){
    console.log($rootScope.presentView);
    if($rootScope.presentView=="INV"){
        $scope.modalBarcode=obj.barcode;
      if($rootScope.inventory[obj.barcode]==undefined){
//        $scope.modal.show();
        $http({
          method: 'POST',
          data:{bar_code:obj.barcode},
          url: 'http://gallishops.in:3000/getBarCode'
        }).then(function successCallback(response) {
            console.log(response.data);
            var keys=Object.keys(response.data);
            console.log(keys);
            if(keys.length!=0){
            var prod=JSON.parse(response.data[keys[0]]);
              $scope.updateProduct.name=prod.name;
              $scope.updateProduct.price=prod.price;
            }
            console.dir($scope.updateProduct);
            $scope.modal.show();
          }, function errorCallback(response) {
            console.log("response"+response);
            $scope.modal.show();
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
      }else{
        $scope.updateProduct.name=$rootScope.inventory[obj.barcode].name;
        $scope.updateProduct.price=$rootScope.inventory[obj.barcode].price;
        $scope.updateProduct.qty=$rootScope.inventory[obj.barcode].qty;
                   $scope.modal.show();
 
      }
    }
  });
  $scope.cancelUpdate=function(){
    $scope.modal.hide();
  }
  $scope.cancelManualBarcodeUpdate=function(){
    $scope.barcodeModal.hide();
  }
  $scope.productUpdateInv=function(updateProduct){
    console.dir($scope.updateProduct);
    if(updateProduct.name==undefined||updateProduct.price==undefined){
      console.log("undefined",updateProduct);
      return 0;
    }
    console.dir(updateProduct);
    updateProduct["bar_code"]=$scope.modalBarcode;
    console.dir(updateProduct);
    console.dir($rootScope.inventory);
    $rootScope.inventory[$scope.modalBarcode]=JSON.parse(JSON.stringify(updateProduct));
    localStorage.setItem("inventory",JSON.stringify($rootScope.inventory));
    console.dir($rootScope.inventory);
    $scope.modal.hide();
    //$scope.updateProduct={};
  }
//  $rootScope.inventory
  $scope.items=[
  ];
});
