var path=require("path");
var node_mod=path.join( __dirname,"/node_modules/");

var config = require('./config.js');
var mainScope=require("./src/");

var express=require(node_mod+'express');
var expressSession = require(node_mod+'express-session');
var app = require(node_mod+'express')();
var http = require('http').Server(app);
var body_parser=require(node_mod+'body-parser');
var socket_redis=require(node_mod+"socket.io-redis");
var io = require(node_mod+'socket.io')(http);
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
app.use(expressSession({secret: 'mySecretKey'}));
app.use(mainScope.user.passport.initialize());
app.use(mainScope.user.passport.session());


app.get( '/', function(req, res){
  res.sendFile( 'index.html', { root : __dirname});
});
app.post( '/login', mainScope.user.login_api, mainScope.user.generateToken, mainScope.user.respond );
app.post( '/register', mainScope.user.register_api );

app.post( '/search',mainScope.user.authenticate,mainScope.product.search_api);

// api for products with barcode
app.post( '/getBarCode', mainScope.product.getBarCode_api );
app.post( '/setBarCode', mainScope.product.setBarCode_api );


// procucts with out barcode can have a shop user desired barcode or custom barcode.
// These products can be searchable by text not by barcode.
// currently custom barcode searching feature is not supported at server.
app.post( '/addProduct', mainScope.product.addProduct_api );

app.post( '/getInventory', mainScope.user.authenticate, mainScope.inventory.getInventory_api );
app.post( '/addInventory', mainScope.user.authenticate, mainScope.inventory.addInventory_api );

app.post( '/setLocation', mainScope.user.authenticate, mainScope.location.setLocation_api );
app.post( '/getLocation', mainScope.user.authenticate, mainScope.location.getLocation_api );


io.on('connection', function(socket){
  console.log('a user connected');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
