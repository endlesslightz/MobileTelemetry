var myDB = null;
var GG = null;
$(document).on('pagebeforeshow', '[data-role="page"]', function(){       
    $.mobile.activePage.find('[data-role="panel"]').load("panel.html", function(){ 
        $(this).parent().trigger('pagecreate');
    });
});
$(document).on("pageinit", function() {
    $(".nav-menu li a").on("click", function(e) {
        $("#mypanel").panel("close");
    });
});
//-----------------------------------------------------------------//

function cekNama(){
  myDB=window.sqlitePlugin.openDatabase({name: "mySQLite.db", location: 'default'});
  myDB.transaction(function(transaction) {
  transaction.executeSql('SELECT * FROM user', [], 
  function (tx, results) {
    console.log(" ID = " + results.rows.item(0).id + " Data =  " + results.rows.item(0).nama);
    document.getElementById("nama").innerHTML = results.rows.item(0).nama;
    document.getElementById("pos").innerHTML = "Pos "+results.rows.item(0).pos;
  },
  function(error) {
    alert("Ups, terjadi kesalahan pada update nama!");
    console.log('nama ga update');
  });
  });
}

function updateInfo(){
  var user_data = {
                  nama: $('#infonama').val(),
                  pos: $('#infopos').val(),
              };;
  myDB=window.sqlitePlugin.openDatabase({name: "mySQLite.db", location: 'default'});
  myDB.transaction(function(transaction) {
  transaction.executeSql('UPDATE user SET `nama`=?, `pos`=? WHERE id=?', [user_data.nama, user_data.pos,'1'], 
  function (tx, results) {
    alert('Update informasi berhasil'); 
  },
  function(error) {
    alert("Ups, terjadi kesalahan pada update info!");
    console.log('nama ga update');
  });
  });

  cekNama();
}

//-----------------------------------------------------------------//

function keluar()
  {
    navigator.app.exitApp();
  }

function onOnline() {
	// $.ajax({
	// 	dataType:'html',
	// 	url:'http://www.google.co.id',
	// 	success:function(data) {
	// 		$('#ajax').html($(data).children());   
	// 	}
	// });
    console.log("regained connection");
    var url = window.location.pathname;
    var filename = url.substring(url.lastIndexOf('/')+1);
     if (filename=='dashboard.html'){
     document.getElementById("ajax").innerHTML = "ONLINE";    
     }
     // cekNama();

}

function onOffline() {
    console.log("lost connection");
    alert('Device berada dalam posisi Offline');
     document.getElementById("ajax").innerHTML = "OFFLINE";
}

//------------------------------------------------------------------//



function getReq(){
 var tgl = tanggal();
  myDB=window.sqlitePlugin.openDatabase({name: "mySQLite.db", location: 'default'});
  myDB.transaction(function(transaction) {
  transaction.executeSql('INSERT INTO data ( `nilai`, `pos`, `waktu`) VALUES (?,?,?)', ['0.5', 'Pos 1', tgl], 
  function (tx, results) {
    alert('Data berhasil disimpan'); 
  },
  function(error) {
    alert("Ups, terjadi kesalahan pada update info!");
    console.log('nama ga update');
  });
  });
}

function sendReq() {
 var tgl = tanggal();
	$.ajax({
		dataType:'html',
		url:'http://saddang.com/insert/test?ksens=7&nilai=10&waktu=2018-01-28%2011:15:10&realtime='+tgl+'',
		success:function(data) {
			alert('Data berhasil dikirim'); 
		}
	});  
}

function tanggal(){
    now = new Date();
    year = "" + now.getFullYear();
    month = "" + (now.getMonth() + 1); if (month.length == 1) { month = "0" + month; }
    day = "" + now.getDate(); if (day.length == 1) { day = "0" + day; }
    hour = "" + now.getHours(); if (hour.length == 1) { hour = "0" + hour; }
    minute = "" + now.getMinutes(); if (minute.length == 1) { minute = "0" + minute; }
    second = "" + now.getSeconds(); if (second.length == 1) { second = "0" + second; }
    return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
}

function getData(){
    var url = window.location.pathname;
    var filename = url.substring(url.lastIndexOf('/')+1);
     if (filename=='riwayat.html'){
        myDB=window.sqlitePlugin.openDatabase({name: "mySQLite.db", location: 'default'});
        myDB.transaction(function(transaction) {
        transaction.executeSql('SELECT * FROM data', [], 
        function (tx, results) {
          alert('data berhasil diambil');
            GG = '[{"id":"1","nilai":"DwijPM","pos":"2012-05-03","waktu":"2012-05-20"},{"id":"2","nilai":"AnoDB","pos":"2012-04-11","waktu":"2012-05-03"}]';
            data2 = GG;
            logs = JSON.parse(data2);
            $table = $("#data-table");
            for(var i=0; i<logs.length;i++) {
              var log = logs[i];
              $table.append("<tr><td>"+log.id+"</td><td>"+log.nilai+"</td><td>"+log.pos+"</td><td>"+log.waktu+"</td></tr>")
            }
        },
        function(error) {
          alert("Ups, terjadi kesalahan pada pengambilan data!");
          console.log('nama ga update');
        });
        });
    }
}
//------------------------------------------------------------------//

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
  getData();
	document.addEventListener("online", onOnline, false);
	document.addEventListener("offline", onOffline, false);
	onOnline();
  cekNama();
 }

