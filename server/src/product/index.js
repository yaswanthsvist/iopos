var path=require("path");
var node_mod=path.join( __dirname,"../../node_modules/");

var rSearch = require(node_mod+'redis-search');
var Search=rSearch.createSearch();
var async = require(node_mod+'async');

var Product=require("./product");


var search = function(req,res){
  if(req.body.search!=undefined){
   Search
    .query(query =req.body.search, function(err, ids) {
        if (err){
	  res.send("error");
	  throw err;
	}
        console.log('Search results for "%s":', query);
        console.log(ids);
	var asyncFun=[];
	if(ids.length>0){
	  for(var s=0;s<ids.length;s++){
		var ff=getBarCodeInfo(ids[s]);
		asyncFun.push(getBarCodeInfo(ids[s],"bcid:"));
	  }
	  console.log(asyncFun);
	}
	async.parallel(asyncFun,function(err,result){
		console.log(result);
		res.send(result);
	});
	
    });
  }else{
	res.send(500);
  }
  console.dir(req.body);
};

var getBarCodeInfo=function(product_id,prefix){
  return function(callback){
    console.log(product_id);
    if(product_id!=undefined){
      Product.findById(product_id,function(err,result){
          if(!err){
               callback(null,result);
          }else{
             callback(null,err);
          }
         });
    }else{
     callback(-1,"{}");
    }
 } 
}

var strfy=function(obj){
 return JSON.stringify(obj);
}
// api for products with barcode
var setBarCode = function(req,res){
 if(req.body.bar_code!=undefined){
  if(req.body.data.name!=undefined){
    Product.findOne({barcode:req.body.bar_code},function(error,existprod){
	if(error){
	   console.dir(error);
	   res.send(error);
	   return;
	}
	if(prod){
	   res.send(existprod);
           return;
	}else{
	 var prod=new Product({
		name:req.body.data.name,
		barcode:req.body.bar_code||'',
		Price:req.body.data.price||'1',
		brand:req.body.data.brand||'',
		ver:0.02
	 });
	 prod.save(function(err,product){
	  if(err){
	   return res.send("err");
	  }else{
	    Search.index(req.body.data.name,product._id.toString());
		   if(product)
		   { 
		     console.log(product);
		     res.send(product);
		   }else{
		     res.send("failed");
		   }
	  }
	 });
	}
    });
  }else{
	 res.send("invalid parms");
  }
 }
};


// procucts with out barcode can have a shop user desired barcode or custom barcode.
// These products can be searchable by text not by barcode.
// custom barcode searching feature is not supported at server.
var addProduct = function(req,res){ 
//  clientDB.set('bc'+req.body.bar_code,newid,function(err,result){  // there will be no barcode to product id conversion available with this option
//  });								     // products with out barcode(organic veg,non veg,food menu items,etc) can have a dedicated unique barcode
								     //   produced by a algorithm
  if(
	req.body.data.name!=undefined ){
	 var prod=new Product({
		name:req.body.data.name,
		brand:req.body.data.brand||'',
		barcode:req.body.data.bar_code||'',
		Price:req.body.data.price||'1',
		ver:0.02
	 });
	 prod.save(function(err,product){
	  if(err){
	   return res.send("err");
	  }else{
	    Search.index(req.body.data.name,product._id);
		   if(result)
		   { 
		     console.log(result);
		     res.send(product);
		   }else{
		     res.send("failed");
		   }
	  }
	 });
  }else{
	 res.send("invalid parms");
  }
};
var getBarCode = function(req,res){
	console.dir(req.body);
	if(req.body.bar_code!=undefined){
	 Product.find({'barcode':req.body.bar_code},function(err,result){	
	  if(result){
		res.send(result);
	  }else{
		res.send({});
	  }
	 });
	}
};
module.exports={
	"getBarCode_api":getBarCode,
	"setBarCode_api":setBarCode,
	"addProduct_api":addProduct,
	"search_api":search
}
