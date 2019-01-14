var path=require("path");
var node_mod=path.join( __dirname,"../../node_modules/");
var passport = require(node_mod+'passport');
var LocalStrategy   = require(node_mod+'passport-local').Strategy;
var bCrypt = require(node_mod+'bcrypt-nodejs');

const expressJwt = require(node_mod+'express-jwt');  
const authenticate = expressJwt({secret : 'server secret'});
const jwt = require(node_mod+'jsonwebtoken');

var User=require("./user");

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

var login=function(req,res,next){
 passport.authenticate('login', function(err, user, info) {
  console.log(req.body.data);
  if (err) { return res.status(412).json(err); }
  if (!user) { return res.status(401).json({error:"invalid username/password"}); }
      //return res.send('success');
	next();
  })(req, res, next);
};
var register=function(req,res,next){
 passport.authenticate('registration', function(err, user, info) {
    console.log(req.body.data);
    if (err) { return next(err); }
    if (!user) { return res.status(401).json(req.body.error); }
      return res.status(200).json(user);
  })(req, res, next);
};


module.exports={
  "authenticate":authenticate,
  "passport":passport,
  "generateToken":generateToken,
  "respond":respond,
  "login_api":login,
  "register_api":register
}