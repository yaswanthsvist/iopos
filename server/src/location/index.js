var db=require("../db/")
var config = require('../../config.js');

var setLocation = function(req,res){
	console.dir(req.body);
	if(req.body.lon!=undefined&&req.body.user_id!=undefined){
	var user_type=null;
	switch(req.body.user_type){
	  case config.location.SHOPS:
	    user_type="shops";
	}
	console.log('config.loc.',config.location.SHOPS);
	console.log('user_type',user_type);
	  db.clientDB.send_command("geoadd" ,[
		user_type,
		req.body.lon,
		req.body.lat,
		req.body.user_id
	  ],function(err,res){
		console.dir(res);
	  });
	  res.send(200);
	}
};
var getLocation = function(req,res){
	console.dir(req.body);
	if(req.body.user_id!=undefined){
	var user_type=null;
	switch(req.body.user_type){
	  case config.location.SHOPS:
	    user_type="shops";
	}
	console.log('config.loc.',config.location.SHOPS);
	console.log('user_type',user_type);
	  db.clientDB.send_command("geopos" ,[
		user_type,
		req.body.user_id
	  ],function(err,pos){
		console.dir(pos);
	  	if(err){
	  	 return res.send("err");
	  	}else{
	  	 res.send(pos);
	  	}
	  });
	}
};
module.exports={
	"getLocation_api":getLocation,
	"setLocation_api":setLocation
}