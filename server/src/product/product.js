var db=require("../db/");
var Product=db.mongoose.model('Product',{
    barcode : String,
    name : String,
    Price : String,
    brand : String,
    ver : Number
});

module.exports=Product;