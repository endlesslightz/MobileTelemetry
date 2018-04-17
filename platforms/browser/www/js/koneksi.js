var myDB = null;

function initUserTable() {
myDB=window.sqlitePlugin.openDatabase({name: "mySQLite.db", location: 'default'});
myDB.transaction(function(transaction) {
transaction.executeSql('CREATE TABLE IF NOT EXISTS user (id integer primary key, nama varchar(100), username varchar(100), password varchar(50), pos varchar(100))', [],
	function(tx, result) {
		// alert("Table created successfully");
	},
	function(error) {
		alert("Error occurred while creating the table user.");
	});
});
}


function initDataTable() {
myDB=window.sqlitePlugin.openDatabase({name: "mySQLite.db", location: 'default'});
myDB.transaction(function(transaction) {
transaction.executeSql('CREATE TABLE IF NOT EXISTS data ( id integer primary key , nilai double, pos varchar(100), waktu datetime)', [],
	function(tx, result) {
		// alert("Table created successfully");
	},
	function(error) {
		alert("Error occurred while creating the table data.");
	});
});
}


function cekAdmin(){
	myDB.transaction(function(transaction) {
	transaction.executeSql('SELECT * FROM user WHERE username=?', ['Admin'], 
	function (tx, results) {
	var len = results.rows.length, i;
		if (len<1){
		    initAdmin();	
		} 
	},
	function(error) {
		alert("Ups, terjadi kesalahan pada database!");
		window.location.reload(true);
	});
	});
}


function initAdmin() {
myDB.transaction(function(transaction) {
transaction.executeSql('INSERT INTO user ( `nama`, `username`, `password`, `pos`) VALUES (?,?,?,?)', ['Administrator','Admin','admin','Pos XXXX'],
	function(tx, result) {
		// alert("Data created successfully");
	},
	function(error) {
		alert("Error occurred while creating the data.");
	});
});
}


function login(){
		    // $.mobile.changePage("dashboard.html");	
 	var form_data = {
                    username: $('#username').val(),
                    password: $('#password').val(),
                };
	myDB.transaction(function(transaction) {
	transaction.executeSql('SELECT * FROM user WHERE username=? and password=?', [form_data.username, form_data.password], 
	function (tx, results) {
	var len = results.rows.length, i;
		if (len>=1){
		    // $.mobile.defaultPageTransition = 'slideup';
		    // $.mobile.changePage("dashboard.html", { reloadPage: true });

			$(location).attr('href',"dashboard.html");			
		} else {
 			alert("Username atau password salah!");
			window.location.reload(true);
		}
	},
	function(error) {
		alert("Ups, terjadi kesalahan pada database!");
		window.location.reload(true);
	});
	});
}

document.addEventListener('deviceready', function() {
	initUserTable();
	initDataTable();
  	cekAdmin();
});