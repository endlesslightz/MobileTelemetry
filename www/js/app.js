var myDB = null;
var GG = null;
var dataCH=null;

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
  nilai = Math.floor(Math.random() * (10 - 1 + 1)) + 1;
  transaction.executeSql('INSERT INTO data ( `nilai`, `pos`, `waktu`, `status`) VALUES (?,?,?,?)', [nilai, '1', tgl, 'pending'], 
  function (tx, results) {
    alert('Data berhasil disimpan'); 
  },
  function(error) {
    alert("Ups, terjadi kesalahan pada update info!");
    console.log('nama ga update');
  });
  });
}

function sendReq(){
   myDB=window.sqlitePlugin.openDatabase({name: "mySQLite.db", location: 'default'});
        myDB.transaction(function(transaction) {
        transaction.executeSql("SELECT * FROM data WHERE status='pending' ORDER BY waktu desc", [], 
        function (tx, results) {
        var len = results.rows.length;    
        for (var i=0; i<len; ++i) {
           var tgl = tanggal();
            $.ajax({
              dataType:'html',
              url:'http://saddang.com/insert/test?ksens=7&nilai='+results.rows.item(i).nilai+'&waktu='+results.rows.item(i).waktu +'&realtime='+tgl+'',
              success:function(data) {
              console.log('Data berhasil dikirim'); 
              }
            }); 
        }
          if (len==0){
          alert("Tidak ada data yang terkirim!");
        } else {
          alert("Data berhasil dikirim!");
        }
        },
        function(error) {
          alert("Tidak ada data yang terkirim!");
          console.log('data tidak update');
        });
        });
        ubahStatus();
}

function ubahStatus(){
  myDB=window.sqlitePlugin.openDatabase({name: "mySQLite.db", location: 'default'});
  myDB.transaction(function(transaction) {
  transaction.executeSql('UPDATE data SET `status`=? WHERE status=?', ['terkirim','pending'], 
  function (tx, results) {
     console.log('Update status berhasil'); 
  },
  function(error) {
    alert("Ups, terjadi kesalahan pada update info!");
    console.log('nama ga update');
  });
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

/*------------------------------------------------------------------------*/

function getData(){
    var arraydata = [];
    var url = window.location.pathname;
    var filename = url.substring(url.lastIndexOf('/')+1);
     if (filename=='riwayatCH.html'||filename=='riwayatTMA.html'){
        getDataCH();
        getDataTMA();
        myDB=window.sqlitePlugin.openDatabase({name: "mySQLite.db", location: 'default'});
        myDB.transaction(function(transaction) {
          transaction.executeSql('SELECT * FROM data ORDER BY waktu desc', [], 
          function (tx, results) {
          var len = results.rows.length;
              for (var i=0; i<len; ++i) {
                  arraydata.push ({id: results.rows.item(i).id, nilai: results.rows.item(i).nilai, status: results.rows.item(i).status, waktu: results.rows.item(i).waktu });
              } 
              data = JSON.stringify(arraydata);
              logs = JSON.parse(data);
              $table = $("#data-table");
              for(var i=0; i<logs.length;i++) {
                var log = logs[i];
                $table.append("<tr><td>"+log.id+"</td><td>"+log.nilai+"</td><td>"+log.status+"</td><td>"+log.waktu+"</td></tr>")
              }
          },
          function(error) {
            alert("Ups, terjadi kesalahan pada pengambilan data!");
            console.log('nama ga update');
          });
        });
    }
}

function getDataCH(){
    var arraydata = [];
    var url = window.location.pathname;
    var filename = url.substring(url.lastIndexOf('/')+1);
     if (filename=='riwayatCH.html'){
        myDB=window.sqlitePlugin.openDatabase({name: "mySQLite.db", location: 'default'});
        myDB.transaction(function(transaction) {
        transaction.executeSql('SELECT * FROM data ORDER BY waktu asc', [], 
        function (tx, results) {
            var len = results.rows.length;
            for (var i=0; i<len; ++i) {
                  arraydata.push ([parseFloat(Date.parse(results.rows.item(i).waktu)),parseFloat(results.rows.item(i).nilai)]);
            }
            Highcharts.chart('container', {
            chart: {
                type: 'column',
                zoomType:'x'
            },
            title: {
                text: 'Grafik Curah Hujan'
            },
            subtitle: {
                text: document.ontouchstart === undefined ?
                        'Sentuh dan tarik area grafik untuk memperbesar' :
                        'Sentuh dan tarik area grafik untuk memperbesar'
            },
            xAxis: {
                type: 'datetime'
            },
            yAxis: {
                title: {
                    text: 'Nilai Curah Hujan (mm)'
                },
                lineWidth: 2,
                min: 0
            },
            tooltip: {
                pointFormat: 'Curah Hujan : {point.y:,.0f} mm'
            },
            legend: {
                enabled: false
            },
            credits: {
                enabled: false
            },
            plotOptions: {
                area: {
                    fillColor: {
                        linearGradient: {x1: 0, y1: 0, x2: 0, y2: 1},
                        stops: [
                            [0, Highcharts.getOptions().colors[0]],
                            [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                        ]
                    },
                    marker: {
                        radius: 2
                    },
                    lineWidth: 1,
                    states: {
                        hover: {
                            lineWidth: 1
                        }
                    },
                    threshold: null
                }
            },
            series: [{
                name: 'Curah Hujan',
                lineWidth: 2,
                data: arraydata
            }]
        }); 
        },
        function(error) {
          alert("Ups, terjadi kesalahan pada pengambilan data!");
          console.log('nama ga update');
        });
      });   
    }
}


function getDataTMA(){
    var arraydata = [];
    var url = window.location.pathname;
    var filename = url.substring(url.lastIndexOf('/')+1);
     if (filename=='riwayatTMA.html'){
        myDB=window.sqlitePlugin.openDatabase({name: "mySQLite.db", location: 'default'});
        myDB.transaction(function(transaction) {
        transaction.executeSql('SELECT * FROM data ORDER BY waktu asc', [], 
        function (tx, results) {
            var len = results.rows.length;
            for (var i=0; i<len; ++i) {
                  arraydata.push ([parseFloat(Date.parse(results.rows.item(i).waktu)),parseFloat(results.rows.item(i).nilai)]);
            }
            Highcharts.chart('container', {
                    chart: {
                        type: 'area',
                        zoomType: 'x'
                    },
                    title: {
                        text: 'Grafik Tinggi Muka Air'
                    },
                    subtitle: {
                        text: document.ontouchstart === undefined ?
                                'Sentuh dan tarik area grafik untuk memperbesar' :
                                'Pinch the chart to zoom in'
                    },
                    xAxis: {
                        type: 'datetime'
                    },
                    yAxis: {
                        title: {
                            text: 'Nilai Ketinggian (meter)'
                        },
                        lineWidth: 2,
                        min: 0
                    },
                    tooltip: {
                        pointFormat: 'Tinggi Muka Air : {point.y:,.0f} meter'
                    },
                    legend: {
                        enabled: false
                    },
                    credits: {
                        enabled: false
                    },
                    plotOptions: {
                        area: {
                            fillColor: {
                                linearGradient: {x1: 0, y1: 0, x2: 0, y2: 1},
                                stops: [
                                    [0, Highcharts.getOptions().colors[0]],
                                    [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                                ]
                            },
                            marker: {
                                radius: 2
                            },
                            lineWidth: 1,
                            states: {
                                hover: {
                                    lineWidth: 1
                                }
                            },
                            threshold: null
                        }
                    },
                    series: [{
                        name: 'Tinggi Muka Air',
                        lineWidth: 2,
                        data: arraydata
                    }]
                }); 
        },
        function(error) {
          alert("Ups, terjadi kesalahan pada pengambilan data!");
          console.log('nama ga update');
        });
      });   
    }
} 
//------------------------------------------------------------------//

function getDataKalender(){
    var arraydata = [];
    var url = window.location.pathname;
    var filename = url.substring(url.lastIndexOf('/')+1);
     if (filename=='kalender.html'){
        myDB=window.sqlitePlugin.openDatabase({name: "mySQLite.db", location: 'default'});
        myDB.transaction(function(transaction) {
          transaction.executeSql('SELECT * FROM data ORDER BY waktu desc', [], 
          function (tx, results) {
          var len = results.rows.length;
              for (var i=0; i<len; ++i) {
                  arraydata.push ({title: "data TMA", start: results.rows.item(i).waktu, backgroundColor : "#225588" });
              } 
              dataKalender = JSON.stringify(arraydata);
              var date = new Date();
              var d = date.getDate();
              var m = date.getMonth();
              var y = date.getFullYear();

              $('#calendar').fullCalendar({
                  height: 500,
                  defaultView: 'month',
                  defaultDate: date,
                  editable: false,
                  eventLimit: true, 
                  timeFormat: 'H:mm',        
                  eventTextColor: '#ffffff',
                  events: arraydata
              });
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
  getDataKalender();
	document.addEventListener("online", onOnline, false);
	document.addEventListener("offline", onOffline, false);
	onOnline();
  cekNama();
 }

