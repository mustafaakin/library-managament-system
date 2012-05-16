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

module.exports.Room = {
	today: function(callback){
		pool.query("SELECT RoomName, U.UserID, Name, StartTime, Duration, DATE_ADD(StartTime, INTERVAL Duration MINUTE) AS ValidUntil FROM RoomReservation RR, User U WHERE U.UserID = RR.UserID AND StartTime > NOW() AND StartTime < DATE_ADD(CURDATE(), INTERVAL 1 DAY) ORDER BY StartTime", function(err,rows,fields){
			callback(rows);
		});
	},
	availability: function(room,user,start,duration,globalCallback){
		async.parallel( {
			place: function(callback){
				pool.query("SELECT (SELECT count FROM Room R WHERE R.RoomName = ?) > (SELECT COUNT(*) FROM RoomReservation RR WHERE StartTime > ? AND StartTime < DATE_ADD(?,INTERVAL ? MINUTE) ) AS IsAvailable", [room,start,start,duration], function(err,rows,fields){
					if ( err)
						throw err;
					if ( rows[0].IsAvailable == 1)
						callback(null,true);
					else
						callback("not-available");
				});
			}, 
		 	limit: function(callback){
		 		pool.query("SELECT value < ? AS NOTOK FROM UserConstraints WHERE name = 'MaxRoomDuration' AND UserID = ?", [duration,user],
		 		  function(err,rows,fields){
		 		  	if ( rows[0].NOTOK == 0){
		 		  		callback(null,true);
		 		  	} else {
		 		  		callback("limit");
		 		  	}
			 	});
		 	}
		}, function(err,results){
			if ( err){
				globalCallback(err);
			} else {
				console.log(start);
				pool.query("INSERT INTO RoomReservation VALUES(?,?,?,?)", [room,user,start,duration], function(err,rows,fields){
					if ( err)
						throw err;
					globalCallback("ok");
				});
			}
		});
	},
	types: function(callback){
		pool.query("SELECT * FROM Room", function(err,rows,fields){
			callback(rows);
		});
	}
}

module.exports.User = {
	check_login : function(user, pass, callback){
		pool.query("SELECT UserID, UserType FROM LoginCheck WHERE email = ? AND Password = MD5(?) AND IsExpired = 1", [user, pass], function(err,rows,fields){
			if ( err)
				throw err;
			if ( rows && rows[0]){
				callback(rows[0]);
			} else {
				callback(null);
			}
		});
	},
	extend_item: function(user, item, callback){
		pool.query("SELECT * FROM BorrowCheck WHERE UserID = ? AND ItemID = ?", [user, item], function(err,rows,fields){
			if ( rows[0] && (rows[0].IsPassed == 1 || rows[0].MaxExtensionBreached == 1)){
				callback("no-more-extensions");
			} else {
				pool.query("UPDATE Borrow SET ExtensionCount = ExtensionCount + 1 WHERE UserID = ? AND ItemID = ?", [user,item], function(err,rows,fields){
					callback("ok");
				});
			}
		});
	},
	get_all_constraints : function(callback){
		pool.query("SELECT * FROM ConstraintTable", function(err,rows,fields){
			callback(rows);
		});
	},
	get_constraints: function(type,callback){
		pool.query("SELECT * FROM UserTypeConstraints WHERE TYPE = ?", [type], function(err,rows,fields){
			callback(rows);
		});
	},
	set_constraint: function(type,value,user, callback){
		pool.query("UPDATE Constraints SET value = ? WHERE constraintType = ? AND userType = ?",
		  [value,type,user], function(err,rows,fields){
		  	if ( err)
		  		throw err;
		  	callback("ok");
		});
	},
	add_staff : function(name,password, birthday, callback){
		pool.query("INSERT INTO User(name, password, DateOfBirth, type) VALUES(?,?,?,?)", 
		  [name,password, birthday,2], function(err,rows, fields){
		  	if ( err)
		  		throw err;
			callback(rows);
		});
	},
	get_staff : function(callback){
		pool.query("SELECT UserID, email, Username FROM LoginCheck WHERE IsExpired = 1 AND UserType = 'staff'", function(err,rows,fields){
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
			pool.query("INSERT INTO User(Password,Name, Type,DateOfBirth,email) VALUES(MD5(?),?,?,?,?)",
			 [password, name, type, birth, email], function(err,rows,fields){
			 	if ( err){
			 		callback("email");
			 	} else {
					var id = rows.insertId;
					getConstraint("MembershipPeriod", type, function(period){
						pool.query("INSERT INTO MembershipHistory(UserId, Charge, StartDate, ExpireDate) VALUES(?,?, CURDATE()," +
						  " DATE_ADD(CURDATE(), INTERVAL ? DAY))", [id, due.value, period.value], function(err,rows,fields){
							callback("ok");
						});
					});
				}
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
				pool.query("SELECT COUNT(*) AS count FROM Borrow WHERE UserID = ?", [id], function(err,rows,fields){
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
	user_items: function(user, callback){
		pool.query("SELECT * FROM UserHoldings WHERE UserID = ? ORDER BY BorrowDate",
		  [user], function(err,rows,fields){
		  	callback(rows);
		});
	}, 
	borrow_charge: function(user, item, callback){
		pool.query("SELECT Price FROM LateCheckouts WHERE UserID = ? AND ItemID = ?", [user, item], function(err,rows,fields){
			callback( rows[0].Price);
		});
	},
	checkout: function(user,item, staff, callback){
		pool.query("SELECT Price FROM LateCheckouts WHERE UserID = ? AND ItemID = ?", [user, item], function(err,rows,fields){
			if ( err)
				throw err;
			var price = rows[0].Price;
			pool.query("INSERT INTO Returns(UserID, ItemID, StaffID, date, amount) VALUES(?,?,?, CURRENT_TIMESTAMP(),?)",
			  [user,item,staff,price], function(err,rows,fields){
				pool.query("DELETE FROM Borrow WHERE UserID = ? AND ItemID = ?", [user,item], function(err,rows,fields){
					callback("ok");
				});
			});
		});		
	}, 
	extend_membership_due: function(user, callback){
		pool.query("SELECT value FROM UserConstraints WHERE UserID = ? AND Name = 'MembershipDue'", [user], function(err,rows,fields){
			callback(rows[0].value);
		});
	},
	extend_mebmership: function(user, callback){
		pool.query("SELECT UC.value AS due, UC2.value AS period FROM UserConstraints UC, UserConstraints UC2 WHERE UC.UserID = ? AND UC2.UserID = ? "
			+ "AND UC.name = 'MembershipDue' AND UC2.name = 'MembershipPeriod'", [user,user], function(err,rows,fields){
			var due = rows[0].due;
			var period = rows[0].period;
			pool.query("INSERT INTO MembershipHistory(UserID,Charge,StartDate,ExpireDate) VALUES (?,?,CURDATE(), DATE_ADD(CURDATE(), INTERVAL ? DAY))",
			  [user,due,period], function(err,rows,fields){
			  	if ( err)
			  		throw err;
			  	callback("ok");
			});
		});
	},
	reserves: function(user, callback){
		pool.query("SELECT I.ItemID, Title, ValidUntil FROM ReserveQueue RQ, Item I WHERE RQ.ItemID = I.ItemID AND UserID = ? AND RQ.StillValid = 1", [user], 
		  function(err,rows,fields){
		  	callback(rows);
		 });
	},
	delete_reserve: function(user,item,callback){
		pool.query("DELETE FROM Reserve WHERE ItemID = ? AND UserID = ? AND "
			+ "NOW() < DATE_ADD(putTime,INTERVAL (SELECT value FROM UserConstraints UC WHERE UC.name = 'ReservePeriod' AND UC.UserID = ?) DAY)", 
		[item,user,user], function(err,rows,fields){
			if ( err)
				throw err;
			callback("ok");
		});
	},
	stats: {
		members_by_year: function(callback){
			var yearSpan = 10;				
			pool.query("SELECT ? AS YearSpan, COUNT(*) AS Total,ROUND ( DATEDIFF(CURDATE(),DateOfBirth) / 365 / ?) AS YearRange FROM User GROUP BY YearRange", 
			[yearSpan, yearSpan], function(err,rows,fields){
				if ( err)
					throw err;
				callback(rows);
			});
		},
		numbers: function(globalCallback){
			async.parallel({
				age: function(callback){
					pool.query("SELECT MAX(ROUND ( DATEDIFF(CURDATE(),DateOfBirth) / 365)) AS Oldest," 
					  + "MIN(ROUND ( DATEDIFF(CURDATE(),DateOfBirth) / 365)) As Youngest,"
					  + "AVG(ROUND ( DATEDIFF(CURDATE(),DateOfBirth) / 365)) As Average,"
					  + "COUNT(*) AS Total FROM User", function(err,rows,fields){
					  	if ( err)
					  		throw err;
						callback(null,rows[0]);
					});
				},
				item: function(callback){
					pool.query("SELECT (SELECT COUNT(*) FROM Borrow) AS CurrentlyOut, (SELECT COUNT(*) FROM Returns) AS Borrows,(SELECT COUNT(*) FROM Reserve) AS Reserves",
					  function(err,rows,fields){
					  	if ( err)
					  		throw err;
					  	callback(null,rows[0]);
					});
				},
				category: function(callback){
					pool.query("SELECT (SELECT COUNT(*) FROM Book B) AS Book, (SELECT COUNT(*) FROM Audio) AS Audio, (SELECT COUNT(*) FROM Video) AS Video,	(SELECT COUNT(*) FROM EMaterial) AS EMaterial", function(err,rows,fields){
						if ( err)
							throw err;
						callback(null,rows[0]);
					})
				}
			},
			function(err,results){
				globalCallback(results);
			});
		},
	},
	deactivate_staff: function(staff,callback){
		pool.query("UPDATE MembershipHistory SET ExpireDate = DATE_SUB(CURDATE(),INTERVAL 1 DAY) WHERE UserID = ?", [staff],
		  function(err,rows,fields){
		  	if ( err)
		  		throw err;
		  	callback("ok");
		});
	},
	getStaffStatistics: function(callback){
		pool.query("SELECT * FROM StaffStatistics", function(err,rows,fields){
			callback(rows);
		});
	}
};

module.exports.Item = {
	comments: function(item, callback){
		pool.query("SELECT U.name, U.userID, message,date,rating FROM CommentAndRate C, User U, Item I" + 
			" WHERE U.UserID = C.UserID AND I.ItemID = C.ItemID AND I.itemID = ?", [item], function(err,rows,fields){
				if ( err)
					throw err;
				callback(rows);
		});
	},
	add_comment: function(user,item,msg,rating,callback){
		pool.query("INSERT INTO CommentAndRate(userID, itemID, message, rating, date) VALUES(?,?,?,?, CURDATE())", 
		  [user,item,msg,rating], function(err,rows,fields){
		  	callback("ok");
		});
	},
	reserve: function(user,item,callback){
		pool.query("INSERT INTO Reserve(ItemID,UserID,putTime,isTaken) VALUES(?,?,CURRENT_TIMESTAMP,0)", [item,user], function(err,rows,fields){
		  	pool.query("SELECT value FROM UserConstraints WHERE Name = 'ReservePeriod' AND UserID = ?", [user], function(err,rows,fields){
		  		callback(rows[0].value);
		  	});
		});
	},
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
			checkinCheck: function(callback){
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
				var SQL = "SELECT (SELECT count * Borrowable FROM Item I WHERE I.ItemID = ?) > ((SELECT COUNT(*) FROM BorrowCheck BC WHERE BC.ItemID = ?) " 
					+ "+ (SELECT COUNT(*) FROM ReserveQueue RQ WHERE RQ.ItemID = ? AND RQ.StillValid = 1)) AS IsAnyRemaining," + 
					"(SELECT UserID = ? FROM ReserveQueue WHERE StillValid = 1 AND ItemID = ? LIMIT 0,1) AS IsTopUserMe";
				pool.query(SQL, [itemID,itemID,itemID,userID,itemID], function(err,rows,fields){
					if ( err)
						throw err;
					if ( rows[0].IsAnyRemaining == 1){
						callback(null,true);
					} else if ( rows[0].IsTopUserMe == 1) {
						callback(null,{markTopUser:true});
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
				if ( results.isBorrowable.markTopUser){
					// TODO: Implement Later
				}
				pool.query("INSERT INTO Borrow(UserID, ItemID, BorrowDate, ExtensionCount) VALUES(?,?, CURDATE(),0)", 
				  [userID, itemID], function(err,rows,fields){
					globalCallback("ok");
				});
			}
		});		
	},
	addBook : function(title, location, isBorrowable, count, ISBN, author, publisher, year, callback){
		isBorrowable = isBorrowable ? 0 : 1; // converting it from null to 1 or 0 for MySQL
		pool.query("INSERT INTO Item(Borrowable,Location,Title,Count) VALUES (?,?,?,?)", [isBorrowable, location, title,count], function(err,rows, fields){
			var id = rows.insertId;
			pool.query("INSERT INTO Book(ItemID,ISBN,Author,Publisher,PublicationYear) VALUES(?,?,?,?,?)", 
			  [id, ISBN, author, publisher, year], function(err,rows,fields){
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