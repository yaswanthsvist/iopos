angular.module('pos.pos',[])
.controller('posCtrl', function($scope,$ionicPopup,$timeout,hidScanner,$rootScope,$ionicModal,$http,transactions) {
  hidScanner.initialize();
  $rootScope.presentView="POS";
  $rootScope.transactions={};
  $rootScope.inventory={};
  $scope.$on("$ionicView.beforeEnter", function(event, data){
//      localStorage.clear();
    if($rootScope.user==undefined){
      var auth=localStorage.getItem("authData");
      var authData=JSON.parse(auth)
      if(authData!=null)
         $rootScope.user=authData;
    }

      var str=localStorage.getItem("inventory");
      var tXstr=localStorage.getItem("transactions");
        $rootScope.transactions=JSON.parse(tXstr);
        $rootScope.inventory=JSON.parse(str);
      if($rootScope.inventory===null)
        $rootScope.inventory={};
      if($rootScope.transactions===null)
        $rootScope.transactions={};
   console.log("$rootScope.inventory",$rootScope.inventory);
   $scope.updateProduct={};
  });
  $scope.$on("$ionicView.beforeLeave", function(event, data){
    localStorage.setItem("inventory",JSON.stringify($rootScope.inventory));
    localStorage.setItem("transactions",JSON.stringify($rootScope.transactions));
  });
  $scope.$on('$ionicView.enter', function(){
    $rootScope.presentView="POS";
      console.dir("$rootScope.inventory");
      console.dir($rootScope.inventory);
  });
  $ionicModal.fromTemplateUrl('productUpdate.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;

  });

  console.log(localStorage.getItem("inventory"));
  $scope.productUpdateInv=function(updateProduct){
    console.dir($rootScope.updateProduct);
    if(updateProduct.name==undefined||updateProduct.price==undefined){
      console.log("undefined",updateProduct);
      return 0;
    }
    console.dir(updateProduct);
    $http({
          method: 'POST',
          data:{bar_code:$scope.modalBarcode,data:updateProduct},
          url: 'http://gallishops.in:3000/setBarCode'
        }).then(
          function successCallback(response) {
            console.dir(response);
            if(response.data._id==undefined){
              return;
            }
            if($rootScope.user.id!=undefined)
              $http({
                method: 'POST',
                headers: {
                  'Authorization':'Bearer '+$rootScope.token},
                data:{
                  product_id:response.data._id,
                  shop_id:$rootScope.user.id,
                  bar_code:updateProduct.modalBarcode,
                  price:updateProduct.price,
                  brand:updateProduct.brand,
                  cost:updateProduct.cost||1,
                  qty:updateProduct.qty
                },
                url: 'http://gallishops.in:3000/addInventory'
              }).then(
                function successCallback(response) {
                      updateProduct["bar_code"]=$scope.modalBarcode;
                      $rootScope.barcodeToId["bar_code"]=response.data._id;
                      updateProduct["product_id"]=response.data._id;
                      $rootScope.inventory[response.data._id]=updateProduct;
                      localStorage.setItem("inventory",JSON.stringify($rootScope.inventory));
                      addProductToPosList($scope.modalBarcode);

                  console.dir(response);
                },
                 function errorCallback(response) {
                }
              );
          },
           function errorCallback(response) {
          }
        );
    $scope.modal.hide();
    //$scope.updateProduct={};
  }
  var updateTotal=function(){
    var ttl=0,ttlprd=0;
    for(var i=0;i<$scope.items.length;i++){
      ttl=ttl+$scope.items[i].qty*$scope.items[i].price;
      ttlprd=ttlprd+$scope.items[i].qty;
    }
    $scope.total=ttl;
    $scope.totalProducts=ttlprd; 
  }
  $scope.checkOut=function(){
    if($scope.total==0 || $scope.totalProducts.length==0)
      return
    var txn={};
    var time=(new Date()).getTime();
    txn.total=$scope.total;
    txn.totalProduct=parseInt( $scope.totalProducts);
    $rootScope.transactions[time]=txn;
    var transaction={
      transactionId:time,
      total:$scope.total,
      totalProduct:parseInt( $scope.totalProducts),
      items:$scope.items
    }
    transactions.add(transaction);
    $scope.items=[];
    $scope.totalProducts=0;
    $scope.total=0;
  }
  $scope.$on("hidScanner::scanned",function(e,obj){
    var charCode=obj.barcode.charCodeAt(obj.barcode.length -1);
    if(
          charCode == 9  ||
          charCode == 10 ||
          charCode ==  13
     ){
      obj.barcode=obj.barcode.slice(0,obj.barcode.length-1);
      console.log(obj.barcode.toString());
    }

    $scope.updateProduct={};
    if($rootScope.presentView=="POS"){
      if($rootScope.inventory[obj.barcode]==undefined){
      	$scope.updateProduct.modalBarcode=obj.barcode;
        $scope.modalBarcode=obj.barcode;
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
            var prod=response.data[keys[0]];
              $scope.updateProduct.name=prod.name;
              $scope.updateProduct.price=prod.Price;
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
        addProductToPosList(obj.barcode);
      }
    }
  });
  $scope.cancelUpdate=function(){
    $scope.modal.hide();
  }
  var searchItemsForDuplicate=function(barcode){
    for(var i=0;i<$scope.items.length;i++){
      if($scope.items[i].bar_code==barcode){
        return i;
      }
    }
    return -1;
  }
  var addProductToPosList=function(barcode){
    var indx=searchItemsForDuplicate(barcode);
    if(indx==-1){
      $scope.items.push({
        bar_code:barcode,
        name:$rootScope.inventory[barcode].name,
        price:$rootScope.inventory[barcode].price,
        qty:1
      });
    }else{
      $scope.items[indx].qty++;
    }
    if($rootScope.inventory[barcode].qty>=4){
        $rootScope.inventory[barcode].qty--;
    }else{
              $scope.updateProduct.name=$rootScope.inventory[barcode].name;
              $scope.updateProduct.price=$rootScope.inventory[barcode].price;
              $scope.updateProduct.qty=$rootScope.inventory[barcode].qty;
              $scope.modalBarcode=barcode;
              $scope.modal.show();
    }
    updateTotal();
    //$timeout(function(){ $scope.$apply(); });
//    console.dir($scope.items);
  }
  $scope.customProduct={};
  $scope.addCustom=function(){
    $scope.customProduct={
      name:"Custom",
      price:34,
      qty:1
    };
    $scope.customModal.show();
  }
  $scope.addItem=function(prd){
      $scope.items.push({
        bar_code:"pb_cus_0",
        name:prd.name,
        price:prd.price,
        qty:prd.qty
      });
    $scope.customModal.hide();
    updateTotal();
  }
  $ionicModal.fromTemplateUrl('addCustom.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.customModal = modal;
  });
  $scope.cancelCustom=function(){
    $scope.customModal.hide();
  }

  $scope.total=0;
  $scope.items=[
      
    ];
  $scope.updateItem=function(index,qty,barcode,action){
  	console.log(barcode);
    var prevQty=qty;
  	if(action=="++"){
  		qty++;
  	}else if(action=="--"){
  		qty--;
  	}else{
      console.log(qty);
      if(qty==0){
        return;
      }
    }
  	if(qty<=0){
        $scope.items.splice(index,1);
    }else{
        $scope.items[index].qty=qty;
    }
    var diff=qty-prevQty;
    if(barcode==0||
    	barcode==null||
    	barcode==undefined||
    	barcode.search("_cus_")>=0){

    }else if($rootScope.inventory[barcode].qty-diff>=4){
      $rootScope.inventory[barcode].qty=$rootScope.inventory[barcode].qty-diff;
    }else{
      $rootScope.inventory[barcode].qty=$rootScope.inventory[barcode].qty-diff;
      $scope.updateProduct.name=$rootScope.inventory[barcode].name;
      $scope.updateProduct.price=$rootScope.inventory[barcode].price;
      $scope.updateProduct.qty=$rootScope.inventory[barcode].qty;
      $scope.modalBarcode=barcode;
      $scope.modal.show();
    }
    updateTotal();
  }
  $scope.editQtyFn=function(index,barcode){
    var prevQty=$scope.items[index].qty;
    $scope.data={
      editQty:$scope.items[index].qty
    }
    var editQtyPopup=$ionicPopup.show({
      template:"<input type='number' ng-model='data.editQty'>",
      title:"Edit Quantity",
      scope:$scope,
      buttons:[
        {text:'cancel'},
        {
          text:'save',
          type:'button-positive',
          onTap:function(e){
            console.log($scope.data.editQty,index);
            if($scope.data.editQty==null||$scope.data.editQty<=0){
              $scope.items.splice(index,1);
            }else{
              console.log($scope.data.editQty);
              $scope.items[index].qty=$scope.data.editQty;
            }
            var diff=$scope.data.editQty-prevQty;
            if($rootScope.inventory[barcode].qty-diff>=4){
              $rootScope.inventory[barcode].qty=$rootScope.inventory[barcode].qty-diff;
            }else{
              $rootScope.inventory[barcode].qty=$rootScope.inventory[barcode].qty-diff;
              $scope.updateProduct.name=$rootScope.inventory[barcode].name;
              $scope.updateProduct.price=$rootScope.inventory[barcode].price;
              $scope.updateProduct.qty=$rootScope.inventory[barcode].qty;
              $scope.modalBarcode=barcode;
              $scope.modal.show();
            }
            console.dir($scope.items);
            updateTotal();
          }
        }
      ] 
    });
  }
});
