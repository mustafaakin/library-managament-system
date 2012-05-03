var MySQLPool = require("mysql-pool").MySQLPool;
var pool = new MySQLPool({
	poolSize: 90,
	user:     'library',
	password: '123',
	database: 'library'
});
var async = require("async");

module.exports.User = {
	check_login : function(user, pass, callback){
		pool.query("SELECT UserID, UserTable.name FROM User, UserTable WHERE User.name = ? AND User.password = ? AND UserTable.type = User.type", [user, pass], function(err,rows,fields){
			if ( err)
				throw err;
			if ( rows && rows[0]){
				callback(rows[0]);
			} else {
				callback(null);
			}
		});
	},
	add_staff : function(name,password, birthday, callback){
		pool.query("INSERT INTO User(name, password, DateOfBirth, type) VALUES(?,?,?,?)", 
		  [name,password, birthday,2], function(err,rows, fields){
			callback(rows);
		});
	},
	get_user_list : function(type,callback){
		pool.query("SELECT * FROM User WHERE type = ?", [type], function(err,rows,fields){
			callback(rows);
		});
	},
	user_details : function(id,callback){
		pool.query("SELECT name, DateOfBirth FROM User WHERE UserID = ?", [id], function(err, rows, fields){
			if ( err)
				throw err;
			if ( rows && rows[0])
				callback(rows[0]);
			else
				callback(null);
		});
	}
};

module.exports.Item = {
	item_search: function(keyword, callback) {
		var SQL = "SELECT Item.ItemID, Title, 'Book' AS 'category' FROM Item, Book WHERE Item.ItemID = Book.ItemID AND title LIKE ? UNION ";
		SQL += "SELECT Item.ItemID, Title, 'Audio' AS 'category' FROM Item, Audio WHERE Item.ItemID = Audio.ItemID AND title LIKE ? UNION ";
		SQL += "SELECT Item.ItemID, Title, 'Video' AS 'category' FROM Item, Video WHERE Item.ItemID = Video.ItemID AND title LIKE ? UNION ";
		SQL += "SELECT Item.ItemID, Title, 'EMaterial' AS 'category' FROM Item, EMaterial WHERE Item.ItemID = EMaterial.ItemID AND title LIKE ?";
		var searchKey = "%" + keyword + "%";
		pool.query(SQL, [searchKey, searchKey,searchKey,searchKey], function(err,rows, fields){
			callback(rows);
		});
	}, 
	item_details_category: function(id, category, callback){
		var SQL = "SELECT * FROM Item, " + category + " WHERE Item.ItemID = " + category + ".ItemID AND Item.ItemID = ?";
		pool.query(SQL,[id], function(err,rows, fields){
			if ( rows[0])
				callback(rows[0]);
		});
	},
	item_details: function(id, callback){
		var SQL = "SELECT * FROM Item WHERE ItemID = ?";
		pool.query(SQL,[id], function(err,rows, fields){
			if ( rows[0])
				callback(rows[0]);
			else
				callback(null);
		});
	},
	check_in: function(userID, itemID, callback){
		pool.query("INSERT INTO Borrow VALUES(?,?, CURDATE(),0,0)", [userID, itemID], function(err,rows,fields){
			callback(rows);
		});
	},
	addBook : function(title, location, isBorrowable, ISBN, author, publisher, year, category, callback){
		isBorrowable = isBorrowable ? 0 : 1; // converting it from null to 1 or 0 for MySQL
		pool.query("INSERT INTO Item(Borrowable,Location,Title) VALUES (?,?,?)", [isBorrowable, location, title], function(err,rows, fields){
			if ( err)
				throw err;
			var id = rows.insertId;
			pool.query("INSERT INTO Book(ItemID,ISBN,Author,Publisher,PublicationYear,CategoryID) VALUES(?,?,?,?,?,?)", 
			  [id, ISBN, author, publisher, year, category], function(err,rows,fields){
			  	callback("ok");
			});
		});
	},
	addVideo : function(title, location, isBorrowable, director, year, producer, duration, callback){
		isBorrowable = isBorrowable ? 0 : 1; // converting it from null to 1 or 0 for MySQL
		pool.query("INSERT INTO Item(Borrowable,Location,Title) VALUES (?,?,?)", [isBorrowable, location, title], function(err,rows, fields){
			if ( err)
				throw err;
			var id = rows.insertId;
			pool.query("INSERT INTO Video(ItemID,Director,ProductionYear,Producer,Duration) VALUES(?,?,?,?,?)", 
			  [id, director, year, producer, duration], function(err,rows,fields){
			  	callback("ok");
			});
		});
	},
	addAudio : function(title, location, isBorrowable, year, artist, callback){
		isBorrowable = isBorrowable ? 0 : 1; // converting it from null to 1 or 0 for MySQL
		pool.query("INSERT INTO Item(Borrowable,Location,Title) VALUES (?,?,?)", [isBorrowable, location, title], function(err,rows, fields){
			if ( err)
				throw err;
			var id = rows.insertId;
			pool.query("INSERT INTO Audio(ItemID,ProductionYear,Artist) VALUES(?,?,?)", 
			  [id, year, artist], function(err,rows,fields){
			  	if ( err)
			  		throw err;
			  	callback("ok");
			});
		});
	},
	addEmaterial : function(title, location, isBorrowable,URL, callback){
		isBorrowable = isBorrowable ? 0 : 1; // converting it from null to 1 or 0 for MySQL
		pool.query("INSERT INTO Item(Borrowable,Location,Title) VALUES (?,?,?)", [isBorrowable, location, title], function(err,rows, fields){
			if ( err)
				throw err;
			var id = rows.insertId;
			pool.query("INSERT INTO EMaterial(ItemID,URL) VALUES(?,?)", 
			  [id, URL], function(err,rows,fields){
			  	if ( err)
			  		throw err;
			  	callback("ok");
			});
		});
	},
};