var express = require('express');
var models = require('./models.js');
var os = require("os");

var User = models.User;
var Item = models.Item;

var app = express.createServer();
 
app.configure(function(){
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.set('view options', {layout: false});
	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.session({ secret: "ABC" }));
	app.use(express.methodOverride());
	app.use(express.static(__dirname + '/public'));
	app.use(app.router);
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

// Routes
app.get('/', function(req,res){
	res.render("index");	
});

app.post('/login', function(req,res){
	var result = User.check_login(req.param('email',null), req.param('password',null));
	if ( result){
		res.redirect("/panel/" + result);
	} else {
		res.redirect("/wrong-login");
	}	
});

app.get('/panel/:type/:menu?', function(req,res,next){
	if ( req.params.menu){
		next();
	} else {
		if ( ['admin', 'staff', 'normal'].indexOf(req.params.type) != -1){		
			res.render("panel", {type:req.params.type});
		} else {
			res.send(404);
		}
	}
});

// Normal User Menus
app.get('/panel/normal/home', function(req,res){
	res.render("personal-details");
});

app.get('/panel/normal/my-books', function(req,res){
	res.render("my-books");
});

app.get('/panel/normal/reserve-room', function(req,res){
	res.render("reserve-room");
});


// Admin Menus
app.get('/panel/admin/manage-staff', function(req,res){
	res.render("manage-staff");
});

app.get('/panel/admin/edit-constraints', function(req,res){
	res.render("edit-constraints");
});

// Staff Menus
app.get('/panel/staff/manage-users', function(req,res){
	res.render('manage-users');
});

app.get('/panel/staff/checkout', function(req,res){
	res.render("user-holdings");
});

app.get("/logout", function(req,res){
	req.session.destroy();
	res.redirect("/");
});	
app.listen(3000);