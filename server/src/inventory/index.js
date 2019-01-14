var Inventory=require("./inventory");
var getInventory = function(req,res){
	console.dir(req.body);
  if(req.body.shop_id!=undefined){
   Inventory.find({shop_id:req.body.shop_id},function(err,Inv){
     if(err)
	return res.send("err");
     res.send(Inv);	
   }); 
  }else{
   res.send("invalid parms");
  }
}
var addInventory = function(req,res){
	console.dir(req.body);
	if(req.body.product_id!=undefined&&req.body.shop_id!=undefined){
	 var inv=new Inventory({
		shop_id:req.body.shop_id,
		product_id:req.body.product_id,
		barcode:req.body.bar_code||'',
		cost:req.body.cost||'1',
		qty:req.body.qty||'1',
		ver:0.02
	 });
	 inv.save(function(err,invv){
	  if(err){
	   return res.send("err");
	  }else{
	   res.send(invv);
	  }
	 });
	}else{
	 res.send("invalid parms");
	}
};
module.exports={
	"getInventory_api":getInventory,
	"addInventory_api":addInventory
}