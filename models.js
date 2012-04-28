var MySQLPool = require("mysql-pool").MySQLPool;
var pool = new MySQLPool({
	poolSize: 30,
	user:     'root',
	password: 'root',
	database: 'test'
});

module.exports.User = {
	check_login : function(user, pass){
		console.log(user + "-" + pass);
		if (user == "mustafa" && pass == "123") return "admin";
		if (user == "semih" && pass == "123") return "staff";
		if (user == "didem" && pass == "123") return "normal";
		return null;		
	}	
};

module.exports.Item = {

};