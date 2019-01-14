var path=require("path");
var node_mod=path.join( __dirname,"../../node_modules/");
var redis = require(node_mod+'redis');
var clientDB=redis.createClient();
clientDB.on("error",function(err){
 console.log(err)
});
var mongoose = require(node_mod+'mongoose');
var ObjectId = mongoose.Types.ObjectId;
var MongoDB=mongoose.connect('mongodb://localhost/passport').connection;
MongoDB.on('error', function(err) { console.log(err.message); });
MongoDB.once('open', function() {
  console.log("mongodb connection open");
});
module.exports={
	"redis":redis,
	"clientDB":clientDB,
	"mongoose":mongoose,
	"MongoDB":MongoDB
}