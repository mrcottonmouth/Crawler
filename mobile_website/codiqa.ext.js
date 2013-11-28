// Creates a websocket with socket.io
// Make sure to install socket.io: terminal, goto /var/lib/cloud9 and enter: npm install socket.io
// Installing this takes a few minutes; wait until the installation is complete

var app = require('http').createServer(handler);
var io = require('socket.io').listen(app);
var fs = require('fs');
var b = require('bonescript');

app.listen(7000);
// socket.io options go here
io.set('log level', 2);   // reduce logging - set 1 for warn, 2 for info, 3 for debug
io.set('browser client minification', true);  // send minified client
io.set('browser client etag', true);  // apply etag caching logic based on version number

console.log('Server running on: http://' + getIPAddress() + ':7000');

var SerialPort = require("serialport").SerialPort
var serialPort = new SerialPort("/dev/ttyO1", {
  baudrate: 9600
});
var throttle = 0;
var Reverse = false;
var SuperSpeed = false;
var Claw = false;
var Light = false;
var RobotPower = false;
var CameraPower = false;

function handler (req, res) {
  if (req.url == "/favicon.ico"){   // handle requests for favico.ico
  res.writeHead(200, {'Content-Type': 'image/x-icon'} );
  res.end();
  console.log('favicon requested');
  return;
  }
  fs.readFile('index.html',    // load html file
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }
    res.writeHead(200);
    res.end(data);
  });
}
 
io.sockets.on('connection', function (socket) {
  // listen to sockets and send values to arduino
  socket.on('throttle', function (data) {
    serialPort.write("F:" + data);
    console.log('F:' + data);
  });
  socket.on('Reverse', function (data) {
    console.log('R:' + data);
    // switch mode
    if (data == 'on') {
       Reverse = true;
       serialPort.write("R:" + data);
    } else if (data == 'off') {
       Reverse = false;
       led(1,1,1);
    }
  });
});

// Get server IP address on LAN
function getIPAddress() {
  var interfaces = require('os').networkInterfaces();
  for (var devName in interfaces) {
    var iface = interfaces[devName];
    for (var i = 0; i < iface.length; i++) {
      var alias = iface[i];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
        return alias.address;
    }
  }
  return '0.0.0.0';
}
 