var path=require("path");
var node_mod=path.join( __dirname,"/node_modules/");
var socket_redis=require(node_mod+"socket.io-redis");
var redis = require(node_mod+'redis');
var config = require('./config.js');
var async = require(node_mod+'async');
var clientDB=redis.createClient();
var rSearch = require(node_mod+'redis-search');
var search=rSearch.createSearch();
var Module=require("./src/");
clientDB.on("error",function(err){
 console.log(err)
});
var express=require(node_mod+'express');
var app = require(node_mod+'express')();
var http = require('http').Server(app);
var io = require(node_mod+'socket.io')(http);
var body_parser=require(node_mod+'body-parser');
io.adapter(socket_redis({ host: 'localhost', port: 6379 }));
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Authorization,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});
app.use(body_parser.json());
app.use(express.static('public'));
app.use(body_parser.urlencoded({ extended: true }));

var mongoose = require(node_mod+'mongoose');
var ObjectId = mongoose.Types.ObjectId;
var MongoDB=mongoose.connect('mongodb://localhost/passport').connection;
MongoDB.on('error', function(err) { console.log(err.message); });
MongoDB.once('open', function() {
  console.log("mongodb connection open");
});
var User=mongoose.model('User',{
        username: String,
    password: String,
    email: String,
    gender: String,
    address: String
});
var passport = require(node_mod+'passport');
var LocalStrategy   = require(node_mod+'passport-local').Strategy;
var bCrypt = require(node_mod+'bcrypt-nodejs');
var expressSession = require(node_mod+'express-session');


/////////////////////////////////////////////////////////
///////////authentication token creation config//////////
const expressJwt = require(node_mod+'express-jwt');  
const authenticate = expressJwt({secret : 'server secret'});
const jwt = require(node_mod+'jsonwebtoken');
function generateToken(req, res, next) {  
  req.token = jwt.sign({
    id: req.user.id,
  }, 'server secret', {
    expiresIn: "24h"
  });
  next();
}
function respond(req, res) {  
  res.status(200).json({
    user: req.user,
    token: req.token
  });
}
passport.serializeUser(function(user, done) {
  done(null, user._id);
});
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});
passport.use('login', new LocalStrategy({
    passReqToCallback : true
  },
  function(req, username, password, done) { 
    console.log(username+password);
	req.body=req.body||{};
	req.body.data=req.body.data||{};
	req.body.data.error=null;
    // check in mongo if a user with username exists or not
    User.findOne({ 'username' :  username }, 
      function(err, user) {
        // In case of any error, return using the done method
        if (err)
          return done(err);
        // Username does not exist, log error & redirect back
        if (!user){
          console.log('User Not Found with username '+username);
	   req.body.data.error="invalid username:"+username;
          return done(null, false);                 
        }
        // User exists but wrong password, log the error 
        if (!isValidPassword(user, password)){
          console.log('Invalid Password');
	  req.body.data.error="Invalid Password";
          return done(null, false);
        }
        // User and password both match, return user from 
        // done method which will be treated like success
	req.user={
	  id:user._id
	}
	console.dir(req.user);
	req.body.data.error=false;
        return done(null, user);
      }
    );
}));
var isValidPassword = function(user, password){
  return bCrypt.compareSync(password, user.password);
}
var createHash = function(password){
  return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}
passport.use('registration', new LocalStrategy({
    passReqToCallback : true
  },
  function(req, username, password, done) {
    console.log(username+password);
	req.body=req.body||{};
	req.body.data=req.body.data||{};
	req.body.data.error=null;
    findOrCreateUser = function(){
      // find a user in Mongo with provided username
      User.findOne({'username':username},function(err, user) {
        // In case of any error return
        if (err){
          console.log('Error in SignUp: '+err);
          return done(err);
        }
        // already exists
        if (user) {
          console.log('User already exists');
	   req.body.data.error="User already exists"+username;
          return done(null, false);
        } else {
          // if there is no user with that email
          // create the user
          var newUser = new User();
          // set the user's local credentials
          newUser.username = username;
          newUser.password = createHash(password);
          newUser.email = req.body['email']||"";
          newUser.firstName = req.body['firstName']||"";
          newUser.lastName = req.body['lastName']||"";
 
          // save the user
          newUser.save(function(err) {
            if (err){
              console.log('Error in Saving user: '+err);  
              throw err;  
            }
            console.log('User Registration succesful');    
	    req.body.data.user=newUser;
            return done(null, newUser);
          });
        }
      });
    };
     
    // Delay the execution of findOrCreateUser and execute 
    // the method in the next tick of the event loop
    process.nextTick(findOrCreateUser);
  })
);





app.use(expressSession({secret: 'mySecretKey'}));
app.use(passport.initialize());
app.use(passport.session());
app.get('/', function(req, res){
  res.sendFile('index.html', { root : __dirname});
});
app.post('/login',function(req,res,next){
 passport.authenticate('login', function(err, user, info) {
  console.log(req.body.data);
  if (err) { return res.status(412).json(err); }
  if (!user) { return res.status(401).json({error:"invalid username/password"}); }
      //return res.send('success');
	next();
  })(req, res, next);
},generateToken,respond);
app.post('/register',function(req,res,next){
 passport.authenticate('registration', function(err, user, info) {
    console.log(req.body.data);
    if (err) { return next(err); }
    if (!user) { return res.status(401).json(req.body.error); }
      return res.status(200).json(user);
  })(req, res, next);
})
app.post('/search',authenticate,function(req,res){
  if(req.body.search!=undefined){
   search
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
});

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
app.post('/setBarCode',function(req,res){
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
	    search.index(req.body.data.name,product._id.toString());
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
});


// procucts with out barcode can have a shop user desired barcode or custom barcode.
// These products can be searchable by text not by barcode.
// custom barcode searching feature is not supported at server.
app.post('/addProduct',function(req,res){ 
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
	    search.index(req.body.data.name,product._id);
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
});
app.post('/getBarCode',function(req,res){
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
});

var Product=mongoose.model('Product',{
    barcode : String,
    name : String,
    Price : String,
    brand : String,
    ver : Number
});
var Inventory=mongoose.model('Inventory',{
    product_id: String,
    shop_id: String,
    barcode: String,
    cost: String,
    qty: String,
    ver :Number
});

app.post('/getInventory',authenticate,function(req,res){
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
});
app.post('/addInventory',authenticate,function(req,res){
	console.dir(req.body);
	if(req.body.product_id!=undefined&&req.body.shop_id!=undefined){
	 var inv=new Inventory({
		product_id:req.body.product_id,
		shop_id:req.body.shop_id,
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
});
app.post('/setLocation',authenticate,function(req,res){
	console.dir(req.body);
	if(req.body.lon!=undefined&&req.body.user_id!=undefined){
	var user_type=null;
	switch(req.body.user_type){
	  case config.location.SHOPS:
	    user_type="shops";
	}
	console.log('config.loc.',config.location.SHOPS);
	console.log('user_type',user_type);
	  clientDB.send_command("geoadd" ,[
		user_type,
		req.body.lon,
		req.body.lat,
		req.body.user_id
	  ],function(err,res){
		console.dir(res);
	  });
	  res.send(200);
	}
});
app.post('/getLocation',authenticate,function(req,res){
	console.dir(req.body);
	if(req.body.user_id!=undefined){
	var user_type=null;
	switch(req.body.user_type){
	  case config.location.SHOPS:
	    user_type="shops";
	}
	console.log('config.loc.',config.location.SHOPS);
	console.log('user_type',user_type);
	  clientDB.send_command("geopos" ,[
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
});


io.on('connection', function(socket){
  console.log('a user connected');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
