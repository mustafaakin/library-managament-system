var MySQLPool = require("mysql-pool").MySQLPool;
var pool = new MySQLPool({
	poolSize: 90,
	user:     'library',
	password: '123',
	database: 'library'
});
var async = require("async");

// Helper function
function getConstraint(name, userType, callback){
	pool.query("SELECT value, explanation from Constraints, ConstraintTable WHERE constraintType = type " +
		" AND userType = ? AND ConstraintTable.name = ?", [userType,name],function(err,rows,fields){
		if ( err)
			throw err;
		if ( rows[0])
			callback(rows[0]);
		else 
			callback(null);
	});
}

module.exports.User = {
	check_login : function(user, pass, callback){
		pool.query("SELECT User.UserID, UserTable.name FROM User, UserTable, MembershipHistory WHERE User.email = ? AND User.password = MD5(?) " + 
			" AND UserTable.type = User.type AND User.UserID = MembershipHistory.UserID AND (ExpireDate is null OR ExpireDate >= CurDate()) ORDER BY ExpireDate DESC LIMIT 0,1", [user, pass], function(err,rows,fields){
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
	}, 
	register: function(name,email,password,birth,type,callback){
		getConstraint("MembershipDue", type, function(due){
			// date_add(curdate(),INTERVAL 35 Day)
			pool.query("INSERT INTO User(Password,Name, Type,DateOfBirth,email) VALUES(MD5(?),?,?,?,?)",
			 [password, name, type, birth, email], function(err,rows,fields){
				var id = rows.insertId;
				getConstraint("MembershipPeriod", type, function(period){
					pool.query("INSERT INTO MembershipHistory(UserId, Charge, StartDate, ExpireDate) VALUES(?,?, CURDATE()," +
					  " DATE_ADD(CURDATE(), INTERVAL ? DAY))", [id, due.value, period.value], function(err,rows,fields){
						callback("ok");
					});
				});
			});
		});
	},
	membership_dues : function(callback){
		pool.query("select UserTable.type, UserTable.name, Constraints.value from UserTable, Constraints, ConstraintTable " + 
			"WHERE ConstraintTable.type = Constraints.constraintType AND UserTable.type = Constraints.userType " + 
			"AND UserTable.type >= 3 AND ConstraintTable.name = 'MembershipDue'", function(err, rows, fields){
				callback(rows);
		});
	},
	statistics: function(id,globalCallback){
		async.parallel({
			membership: function(callback) {
				pool.query("SELECT User.Name, DateOfBirth, StartDate, ExpireDate FROM User, UserTable, MembershipHistory " + 
				  "WHERE User.UserID = ? AND UserTable.type = User.type AND User.UserID = MembershipHistory.UserID" + 
				  " ORDER BY ExpireDate DESC LIMIT 0, 1", [id], function(err,rows,fields){
				  	callback(null,rows);
				});
			},
			current_books: function(callback) {
				pool.query("SELECT COUNT(*) AS count FROM Borrow WHERE UserID = ? AND charge IS NULL", [id], function(err,rows,fields){
					callback(null, rows);
				});
			}, 
			books_so_far : function(callback){
				pool.query("SELECT COUNT(*) AS count FROM Borrow WHERE UserID = ?", [id], function(err,rows,fields){
					callback(null, rows);
				});				
			},
			rooms_so_far: function(callback){
				pool.query("SELECT COUNT(*) AS count FROM RoomReservation WHERE UserID = ?", [id], function(err,rows,fields){
					callback(null, rows);
				});
			}, 
			reserves: function(callback){
				pool.query("SELECT COUNT(*) AS count FROM Reserve WHERE UserID = ?", [id], function(err,rows,fields){
					callback(null, rows);
				});
			}
		}, function(err, results){
			globalCallback(results);
		});
	},
	user_items: function(userID, callback){
		pool.query("SELECT Item.ItemID, Title, BorrowDate FROM Item, Borrow WHERE Item.ItemID = Borrow.ItemID AND UserID = ? AND charge IS NULL ORDER BY BorrowDate",
		  [userID], function(err,rows,fields){
		  	callback(rows);
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
	check_in: function(userID, itemID, globalCallback){
		async.parallel({
			checkoutCheck: function(callback){
				pool.query("SELECT Value >= COUNT(ItemID) AS CanBorrow FROM UserConstraints, Borrow WHERE name = 'MaxBorrowCount' " +
					" AND Borrow.UserID = ? AND UserConstraints.UserID = ? GROUP BY Borrow.UserID", [userID, userID], function(err,rows,fields){
				  	if ( err)
				  		throw err;
				  	if ( !rows[0] || rows[0].CanBorrow == 1 || rows[0].CanBorrow == null){
				  		callback(null,true);
				  	} else {
				  		callback("user-limit");
				  	}
				});
			},
			isBorrowable: function(callback){
				pool.query("SELECT (SELECT count * Borrowable FROM Item WHERE ItemID = ?) AS total," +
				  "(SELECT COUNT(ItemID) From Borrow WHERE ItemID = ? AND charge IS NULL) AS borrowed", [itemID, itemID], function(err,rows,fields){
				  	if ( rows[0] && rows[0].total > rows[0].borrowed){
				  		callback(null,true);
				  	} else {
				  		callback("not-borrowable");
				  	}
				});
			}
		},
		function(err,results){
			if ( err){
				globalCallback(err)
			} else {
				pool.query("INSERT INTO Borrow(UserID, ItemID, BorrowDate, ExtensionCount, Charge) VALUES(?,?, CURDATE(),0,NULL)", 
				  [userID, itemID], function(err,rows,fields){
					globalCallback("ok");
				});
			}
		});		
	},
	addBook : function(title, location, isBorrowable, count, ISBN, author, publisher, year, category, callback){
		isBorrowable = isBorrowable ? 0 : 1; // converting it from null to 1 or 0 for MySQL
		pool.query("INSERT INTO Item(Borrowable,Location,Title,Count) VALUES (?,?,?,?)", [isBorrowable, location, title,count], function(err,rows, fields){
			var id = rows.insertId;
			pool.query("INSERT INTO Book(ItemID,ISBN,Author,Publisher,PublicationYear,CategoryID) VALUES(?,?,?,?,?,?)", 
			  [id, ISBN, author, publisher, year, category], function(err,rows,fields){
			  	if ( err)
			  		throw err;
			  	callback("ok");
			});
		});
	},
	addVideo : function(title, location, isBorrowable, count, director, year, producer, duration, callback){
		isBorrowable = isBorrowable ? 0 : 1; // converting it from null to 1 or 0 for MySQL
		pool.query("INSERT INTO Item(Borrowable,Location,Title) VALUES (?,?,?,?)", [isBorrowable, location, title, count], function(err,rows, fields){
			var id = rows.insertId;
			pool.query("INSERT INTO Video(ItemID,Director,ProductionYear,Producer,Duration) VALUES(?,?,?,?,?)", 
			  [id, director, year, producer, duration], function(err,rows,fields){
			  	callback("ok");
			});
		});
	},
	addAudio : function(title, location, isBorrowable, count, year, artist, callback){
		isBorrowable = isBorrowable ? 0 : 1; // converting it from null to 1 or 0 for MySQL
		pool.query("INSERT INTO Item(Borrowable,Location,Title) VALUES (?,?,?,?)", [isBorrowable, location, title, count], function(err,rows, fields){
			var id = rows.insertId;
			pool.query("INSERT INTO Audio(ItemID,ProductionYear,Artist) VALUES(?,?,?)", 
			  [id, year, artist], function(err,rows,fields){
			  	callback("ok");
			});
		});
	},
	addEmaterial : function(title, location, isBorrowable,URL, callback){
		isBorrowable = isBorrowable ? 0 : 1; // converting it from null to 1 or 0 for MySQL
		pool.query("INSERT INTO Item(Borrowable,Location,Title) VALUES (?,?,?)", [isBorrowable, location, title], function(err,rows, fields){
			var id = rows.insertId;
			pool.query("INSERT INTO EMaterial(ItemID,URL) VALUES(?,?)", 
			  [id, URL], function(err,rows,fields){
			  	callback("ok");
			});
		});
	},
};