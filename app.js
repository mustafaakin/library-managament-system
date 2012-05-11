var express = require('express');
var models = require('./models.js');
var moment = require('moment');
var async = require('async');
var os = require("os");

var User = models.User;
var Item = models.Item;
var Room = models.Room;

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
	var user = req.param('email',null);
	var password = req.param('password',null);
	User.check_login(user,password, function(result){	
		if ( result){
			var type = result.UserType;
			req.session.UserID = result.UserID;
			if ( ['privileged', 'normal', 'guest'].indexOf(type) != -1){
				res.redirect('/panel/normal');
				req.session.UserType = "normal";			
			} else {
				res.redirect("/panel/" + type);				
				req.session.UserType = type;			
			}
		} else {
			res.redirect("/wrong-login");
		}	
	});
});

app.get('/wrong-login', function(req,res){
	res.render("wrong-login");
});

app.get('/panel/:type/:menu?/:opts1?/:opts2?', function(req,res,next){
	if ( req.params.type != req.session.UserType){
		res.redirect("401");
	} else if ( req.params.menu){
		next();
	} else {
		if ( ['admin', 'staff', 'normal'].indexOf(req.params.type) != -1){					
			res.render("panel", {type:req.params.type});
		} else {
			res.redirect("404");
		}
	}
});

// Normal User Menus
app.get('/panel/normal/home', function(req,res){
	User.statistics(req.session.UserID, function(stat){
		res.render("personal-details", {
			id: req.session.UserID,
			name: stat.membership[0].Name,
			birth: moment().diff(moment(stat.membership[0].DateOfBirth),"hours"),
			start: moment(stat.membership[0].StartDate).format("DD MMMM YYYY"),
			expire: moment(stat.membership[0].ExpireDate).diff(moment(),"days") + " days later",
			reserves: stat.reserves[0].count,
			booksOn: stat.current_books[0].count,
			reserved: stat.reserves[0].count,
			media: stat.rooms_so_far[0].count,
			borrowed: stat.books_so_far[0].count
		});
	});
});

app.get('/panel/normal/my-books', function(req,res){
	async.parallel({
		borrows: function(callback){
			User.user_items(req.session.UserID, function(data){
				for ( var i = 0; i < data.length; i++){
					data[i].BorrowDate =  moment(data[i].BorrowDate).format("DD MMMM YYYY");
					data[i].ValidUntil =  moment(data[i].ValidUntil).format("DD MMMM YYYY");				
				}
				callback(null,data);
			});
		},
		reserves: function(callback){
			User.reserves(req.session.UserID, function(data){
				for ( var i = 0; i < data.length; i++){
					data[i].ValidUntil =  moment(data[i].ValidUntil).format("DD MMMM YYYY");				
				}				
				callback(null,data)
			});
		}
	}, function(err,results){
		res.render("my-books", {
			borrows:results.borrows,  
			reserves:results.reserves,
		});
	});
});

app.get('/panel/normal/reserve-room', function(req,res){
	Room.types(function(data){
		res.render("reserve-room", {types:data});
	});
});


// Admin Menus
app.get('/panel/admin/manage-staff', function(req,res){
	User.get_staff(function(result){
		res.render("manage-staff", {users:result});
	});
});

app.get('/panel/admin/edit-constraints', function(req,res){
	User.get_all_constraints(function(rows){
		res.render("edit-constraints", {constraints:rows});
	});
});

app.get('/panel/admin/statistics', function(req,res){
	User.stats.numbers(function(data){
		res.render("statistics", {numbers:data});
	});
});

// Staff Menus
app.get('/panel/staff/manage-users', function(req,res){
	User.membership_dues(function(results){
		res.render('manage-users', {dues:results});
	});
});

app.get('/panel/staff/checkin/:userID?', function(req,res){
	if ( !req.params.userID){
		res.render("user-holdings", {userID : null, found: true});
	} else {
		User.user_details(req.params.userID, function(data){ 
			if ( data){
				User.user_items(req.params.userID, function(items){
					res.render("user-holdings", {	
						userID : req.params.userID,
					 	name: data.name,
						birth: data.DateOfBirth,
						found: true,
						items: items
					});			
				})
			} else {
				res.render("user-holdings", {
					userID: req.params.userID, 
					found: false
				});
			}
		});
	}
});

app.get("/panel/staff/addItem",function(req,res){
	res.render("add-item");
});

app.get("/logout", function(req,res){
	req.session.destroy();
	res.redirect("/");
});	

app.get('/items/:keyword', function(req,res){
	Item.item_search(req.params.keyword, function(results){
		res.render("item-search-results", {items:results});
	});	
});

app.get('/panel/normal/comments/:id', function(req,res){
	Item.comments(req.params.id, function(data){
		for ( var i = 0; i < data.length; i++){
			data[i].date =  moment(data[i].date).format("DD MMMM YYYY");
		}
		res.render("comments", {
			comments:data, 
			user: req.session.UserID,
			item: req.params.id
		});
	});
});

app.get('/item/:id/:category', function(req,res){
  	Item.item_details_category(req.params.id, req.params.category, function(result){
		res.render("item-details", {details: result,user:req.session.UserType});
  	});
});

app.get('/item/:id', function(req,res){
	Item.item_details(req.params.id, function(result){
		if ( result)
			res.render("item-details-checkin", {details: result});
		else
			res.render("item-details-checkin", {details: null});			
  	});
});

app.post("/panel/admin/staff/add", function(req,res) {
	var name = req.param('name',null);
	var password = req.param('password',null);
	var birth = req.param('birthday',null);
	var email = req.param('email',null);
	var type = 2;
	User.register(name,email,password,birth,type, function(result){
		res.send(result);
	})
});

app.get("/panel/staff/checkin/:user/:item", function(req,res){
	Item.check_in(req.params.user, req.params.item, function(data){
		res.send(data);
	});
});

app.post("/panel/staff/add/book", function(req,res){
	var title = req.param('title', null);
	var location = req.param('location', null);
	var isBorrowable = req.param('isBorrwable', null);
	var count = req.param("count",null);
	var ISBN = req.param('ISBN', null);
	var author = req.param('author', null);
	var publisher = req.param('publisher', null);
	var year = req.param('year', null);
	Item.addBook(title, location, isBorrowable, count, ISBN, author, publisher, year, function(result){
		res.send(result);
	})
});


app.post("/panel/staff/add/video", function(req,res){
	var title = req.param('title', null);
	var location = req.param('location', null);
	var isBorrowable = req.param('isBorrwable', null);
	var director = req.param('director', null);
	var year = req.param('year', null);
	var producer = req.param('producer', null);
	var duration = req.param('duration', null);
	var count = req.param("count",null);
	Item.addVideo(title, location, isBorrowable, count, director, year, producer, duration, function(result){
		res.send(result);
	})
});

app.post("/panel/staff/add/audio", function(req,res){
	var title = req.param('title', null);
	var location = req.param('location', null);
	var isBorrowable = req.param('isBorrwable', null);
	var year = req.param('year', null);
	var artist = req.param('artist', null);
	var count = req.param("count",null);
	Item.addAudio(title, location, isBorrowable, count, year, artist, function(result){
		res.send(result);
	})
});

app.post("/panel/staff/add/ematerial", function(req,res){
	var title = req.param('title', null);
	var location = req.param('location', null);
	var isBorrowable = req.param('isBorrwable', null);
	var URL = req.param('URL', null);
	Item.addEmaterial(title, location, isBorrowable, URL, function(result){
		res.send(result);
	})
});

app.post("/panel/staff/register", function(req,res){	
	var name = req.param('name', null);
	var email = req.param('email', null);
	var password = req.param('password', null);
	var birth = req.param('birth', null);
	var type = req.param('type', null);
	if ( type == "2" || type == "1"){ // Staff cannot add admin or staff
		res.send(401);
	} else {
		User.register(name,email,password,birth,type, function(result){
			res.send(result);
		});
	}
});

app.post('/panel/staff/extend/', function(req,res){
	var user = req.param("user",null);
	var item = req.param("item", null);
	User.extend_item(user,item, function(status){
		res.send(status);
	})
});

app.get("/panel/staff/checkout/charge/:user/:item", function(req,res){
	User.borrow_charge(req.params.user, req.params.item, function(price){
		res.send(price.toString());
	});	
});

app.get("/panel/staff/checkout/:user/:item", function(req,res){
	User.checkout(req.params.user, req.params.item, req.session.UserID, function(data){
		res.send(data);
	});
});

app.get("/panel/staff/membershipdue/:user", function(req,res){
	User.extend_membership_due(req.params.user, function(price){
		res.send(price.toString());
	});
})

app.get("/panel/staff/membershipextend/:user", function(req,res){
	User.extend_mebmership(req.params.user, function(msg){
		res.send(msg);
	});
});

app.post('/panel/normal/extend/', function(req,res){
	var user = req.session.UserID;
	var item = req.param("item", null);
	User.extend_item(user,item, function(status){
		res.send(status);
	})
});


app.get('/panel/admin/constraints/:id', function(req,res){
	User.get_constraints(req.params.id,function(data){
		res.render("single-constraint", {cons:data});
	});
});

app.post("/panel/admin/constraint/", function(req,res){
	var type = req.param("constraint",null);
	var params = [];
	for ( var i = 0; i < 5; i++){
		var value = req.param("" + i, null);
		if ( value){
			params.push({user:i,type:type, value:value});
		}
	}
	async.map(params, function(i,callback){
		User.set_constraint(i.type, i.value, i.user, function(data){
			callback(null,"ok");
		})}, function(err,results){
			res.send("ok");
		});
});

app.get("/panel/normal/reserve/:item", function(req,res){
	Item.reserve(req.session.UserID, req.params.item, function(count){
		res.send(count.toString()); // Integer types must be converted to string, othwerise integers are interpereded as HTTP status codes
	});
});

app.get("/panel/normal/reserve/delete/:item", function(req,res){
	User.delete_reserve(req.session.UserID, req.params.item, function(data){
		res.send("ok");
	})
});

app.get("/panel/admin/statistics/age", function(req,res){
	User.stats.members_by_year(function(data){
		res.send(data);
	});
});

app.get("/panel/admin/stats/staff", function(req,res){
	User.getStaffStatistics(function(result){
		res.send(result);
	});
});

app.get("/panel/admin/delete-staff/:id", function(req,res){
	User.deactivate_staff(req.params.id, function(data){
		res.send("ok");
	})
});

app.post("/panel/normal/post-comment", function(req,res){
	var user = req.session.UserID;
	var item = req.param("item", null);
	var rating = req.param("rating",null);
	var msg = req.param("msg",null); 
	Item.add_comment(user,item,msg,rating,function(data){
		res.send("ok");
	})
});

app.get("/panel/staff/rooms", function(req,res){
	Room.today(function(data){
		for ( var i = 0; i < data.length; i++){
			data[i].StartTime =  moment(data[i].StartTime).format("HH:mm");
			data[i].ValidUntil =  moment(data[i].ValidUntil).format("HH:mm");			
		}
		res.render("rooms",{rooms:data});
	});
});

app.post("/panel/normal/reserve-room-action", function(req,res){
	var user = req.session.UserID;
	var room = req.param("type");
	var start = req.param("time");
	var duration = req.param("duration");	
	Room.availability(room,user,start,duration,function(data){
		res.send(data);
	})
});

app.get("/404", function(req,res){
	res.render("404");
});

app.get("/401", function(req,res){
	res.render("404");
});

app.get("*", function(req,res){
	res.redirect("/404");
});

app.listen(3000);