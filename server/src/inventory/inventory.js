var db=require("../db/");
var Inventory=db.mongoose.model('Inventory',{
    product_id: String,
    shop_id: String,
    barcode: String,
    cost: String,
    qty: String,
    ver :Number
});
module.exports=Inventory;