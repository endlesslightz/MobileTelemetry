var list = [
  permissions.CAMERA,
  permissions.GET_ACCOUNTS,
  permissions.ACCESS_CHECKIN_PROPERTIES,
    permissions.ACCESS_COARSE_LOCATION ,
    permissions.ACCESS_FINE_LOCATION,
permissions.ACCESS_LOCATION_EXTRA_COMMANDS
];

permissions.hasPermission(list, callback, null);

function error() {
  console.warn('Permission belum dinyalakan');
}

function success( status ) {
  if( !status.hasPermission ) {
  
    permissions.requestPermissions(
      list,
      function(status) {
        if( !status.hasPermission ) error();
      },
      error);
  }
}