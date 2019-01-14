var db=require("../db/");
var User=db.mongoose.model('User',{
        username: String,
    password: String,
    email: String,
    gender: String,
    address: String
});
module.exports=User; 