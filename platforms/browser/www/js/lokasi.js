  var geocoder = new google.maps.Geocoder();
  var weatherIcons = {
  "200": {
    "label": "thunderstorm with light rain",
    "icon": "storm-showers"
  },

  "201": {
    "label": "thunderstorm with rain",
    "icon": "storm-showers"
  },

  "202": {
    "label": "thunderstorm with heavy rain",
    "icon": "storm-showers"
  },

  "210": {
    "label": "light thunderstorm",
    "icon": "storm-showers"
  },

  "211": {
    "label": "thunderstorm",
    "icon": "thunderstorm"
  },

  "212": {
    "label": "heavy thunderstorm",
    "icon": "thunderstorm"
  },

  "221": {
    "label": "ragged thunderstorm",
    "icon": "thunderstorm"
  },

  "230": {
    "label": "thunderstorm with light drizzle",
    "icon": "storm-showers"
  },

  "231": {
    "label": "thunderstorm with drizzle",
    "icon": "storm-showers"
  },

  "232": {
    "label": "thunderstorm with heavy drizzle",
    "icon": "storm-showers"
  },

  "300": {
    "label": "light intensity drizzle",
    "icon": "sprinkle"
  },

  "301": {
    "label": "drizzle",
    "icon": "sprinkle"
  },

  "302": {
    "label": "heavy intensity drizzle",
    "icon": "sprinkle"
  },

  "310": {
    "label": "light intensity drizzle rain",
    "icon": "sprinkle"
  },

  "311": {
    "label": "drizzle rain",
    "icon": "sprinkle"
  },

  "312": {
    "label": "heavy intensity drizzle rain",
    "icon": "sprinkle"
  },

  "313": {
    "label": "shower rain and drizzle",
    "icon": "sprinkle"
  },

  "314": {
    "label": "heavy shower rain and drizzle",
    "icon": "sprinkle"
  },

  "321": {
    "label": "shower drizzle",
    "icon": "sprinkle"
  },

  "500": {
    "label": "light rain",
    "icon": "rain"
  },

  "501": {
    "label": "moderate rain",
    "icon": "rain"
  },

  "502": {
    "label": "heavy intensity rain",
    "icon": "rain"
  },

  "503": {
    "label": "very heavy rain",
    "icon": "rain"
  },

  "504": {
    "label": "extreme rain",
    "icon": "rain"
  },

  "511": {
    "label": "freezing rain",
    "icon": "rain-mix"
  },

  "520": {
    "label": "light intensity shower rain",
    "icon": "showers"
  },

  "521": {
    "label": "shower rain",
    "icon": "showers"
  },

  "522": {
    "label": "heavy intensity shower rain",
    "icon": "showers"
  },

  "531": {
    "label": "ragged shower rain",
    "icon": "showers"
  },

  "600": {
    "label": "light snow",
    "icon": "snow"
  },

  "601": {
    "label": "snow",
    "icon": "snow"
  },

  "602": {
    "label": "heavy snow",
    "icon": "snow"
  },

  "611": {
    "label": "sleet",
    "icon": "sleet"
  },

  "612": {
    "label": "shower sleet",
    "icon": "sleet"
  },

  "615": {
    "label": "light rain and snow",
    "icon": "rain-mix"
  },

  "616": {
    "label": "rain and snow",
    "icon": "rain-mix"
  },

  "620": {
    "label": "light shower snow",
    "icon": "rain-mix"
  },

  "621": {
    "label": "shower snow",
    "icon": "rain-mix"
  },

  "622": {
    "label": "heavy shower snow",
    "icon": "rain-mix"
  },

  "701": {
    "label": "mist",
    "icon": "sprinkle"
  },

  "711": {
    "label": "smoke",
    "icon": "smoke"
  },

  "721": {
    "label": "haze",
    "icon": "day-haze"
  },

  "731": {
    "label": "sand, dust whirls",
    "icon": "cloudy-gusts"
  },

  "741": {
    "label": "fog",
    "icon": "fog"
  },

  "751": {
    "label": "sand",
    "icon": "cloudy-gusts"
  },

  "761": {
    "label": "dust",
    "icon": "dust"
  },

  "762": {
    "label": "volcanic ash",
    "icon": "smog"
  },

  "771": {
    "label": "squalls",
    "icon": "day-windy"
  },

  "781": {
    "label": "tornado",
    "icon": "tornado"
  },

  "800": {
    "label": "clear sky",
    "icon": "sunny"
  },

  "801": {
    "label": "few clouds",
    "icon": "cloudy"
  },

  "802": {
    "label": "scattered clouds",
    "icon": "cloudy"
  },

  "803": {
    "label": "broken clouds",
    "icon": "cloudy"
  },

  "804": {
    "label": "overcast clouds",
    "icon": "cloudy"
  },


  "900": {
    "label": "tornado",
    "icon": "tornado"
  },

  "901": {
    "label": "tropical storm",
    "icon": "hurricane"
  },

  "902": {
    "label": "hurricane",
    "icon": "hurricane"
  },

  "903": {
    "label": "cold",
    "icon": "snowflake-cold"
  },

  "904": {
    "label": "hot",
    "icon": "hot"
  },

  "905": {
    "label": "windy",
    "icon": "windy"
  },

  "906": {
    "label": "hail",
    "icon": "hail"
  },

  "951": {
    "label": "calm",
    "icon": "sunny"
  },

  "952": {
    "label": "light breeze",
    "icon": "cloudy-gusts"
  },

  "953": {
    "label": "gentle breeze",
    "icon": "cloudy-gusts"
  },

  "954": {
    "label": "moderate breeze",
    "icon": "cloudy-gusts"
  },

  "955": {
    "label": "fresh breeze",
    "icon": "cloudy-gusts"
  },

  "956": {
    "label": "strong breeze",
    "icon": "cloudy-gusts"
  },

  "957": {
    "label": "high wind, near gale",
    "icon": "cloudy-gusts"
  },

  "958": {
    "label": "gale",
    "icon": "cloudy-gusts"
  },

  "959": {
    "label": "severe gale",
    "icon": "cloudy-gusts"
  },

  "960": {
    "label": "storm",
    "icon": "thunderstorm"
  },

  "961": {
    "label": "violent storm",
    "icon": "thunderstorm"
  },

  "962": {
    "label": "hurricane",
    "icon": "cloudy-gusts"
  }
}


if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(successFunction, errorFunction, {timeout:30000});
} 

function successFunction(position) {
    var lat = position.coords.latitude;
    var lng = position.coords.longitude;
    codeLatLng(lat, lng);
    iconCuaca(lat, lng);
    // alert(lat+' '+lng);
}

function errorFunction(){
    alert("Memuat geolocoder");
}


function iconCuaca(lat, lng){
  var dorn= "";
  rq =$.getJSON("http://api.openweathermap.org/data/2.5/weather?units=metric&lon="+lng+"&lat="+lat+"&APPID=eb6701c088d5ee37d66b9038e981a1c1");
  rq.then(function(rsp){
      var prefix = "wi wi-";
      var today = new Date();
      var hour = today.getHours();

      if (hour > 6 && hour < 20) {
          //Day time
         dorn = "day-";
      } else {
          //Night time
         dorn ="night-";
      }
         console.log(dorn);
         var code = rsp.weather[0].id;
         var icon = weatherIcons[code].icon;
         iconD = prefix +dorn+ icon;
         // alert(iconD);
         document.getElementById("iconcuaca").className = iconD;
      });
}

function codeLatLng(lat, lng) {
    var latlng = new google.maps.LatLng(lat, lng);
    geocoder.geocode({'latLng': latlng}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
      console.log(results)
        if (results[1]) {
         //alamat
          $.getJSON("http://api.openweathermap.org/data/2.5/weather?units=metric&lon="+lng+"&lat="+lat+"&APPID=eb6701c088d5ee37d66b9038e981a1c1",function(json){
              // alert(json[0][0]);
            document.getElementById("cuaca").innerHTML = json["weather"]["0"]["main"];
            document.getElementById("suhu").innerHTML = json["main"]["temp"]+"&deg; C";  
            document.getElementById("angin").innerHTML = json["wind"]["speed"]+" Km/jam";  
          });
         document.getElementById("daerah").innerHTML = results[0].formatted_address
         // alert(results[0].formatted_address)
        //negara
             for (var i=0; i<results[0].address_components.length; i++) {
            for (var b=0;b<results[0].address_components[i].types.length;b++) {
            //there are different types that might hold a city admin_area_lvl_1 usually does in come cases looking for sublocality type will be more appropriate
                if (results[0].address_components[i].types[b] == "administrative_area_level_1") {
                    //this is the object you are looking for
                    city= results[0].address_components[i];
                    break;
                }
            }
        }
        // alert(city.short_name + " " + city.long_name)
        } else {
          alert("No results found");
        }
      } else {
        alert("Geocoder failed due to: " + status);
      }
    });
  }

function updateLokasi(){
    navigator.geolocation.getCurrentPosition(successFunction, errorFunction);
    alert('Lokasi Anda diperbarui');
  }

