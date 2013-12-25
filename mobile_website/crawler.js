// Creates a websocket with socket.io
// Make sure to install socket.io: terminal, goto /var/lib/cloud9 and enter: npm install socket.io
// Installing this takes a few minutes; wait until the installation is complete

var app = require('http').createServer(handler),
    io = require('socket.io').listen(app),
    fs = require('fs'),
    i2c = require('i2c'),
    gpio = require('gpio'),
    sys = require('sys'),
    exec = require('child_process').exec;

function puts(error, stdout, stderr) { sys.puts(stdout) }

var gpio22, gpio23;
gpio22 = gpio.export(22, {
   ready: function() {
      gpio22.set();
      gpio22.reset();
   }
});
gpio23 = gpio.export(23, {
   ready: function() {
      gpio23.set();
      gpio23.reset();
   }
});

app.listen(7000);
console.log('Crawler Server running on: http://' + getIPAddress() + ':7000');

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }
 
    res.writeHead(200);
    res.end(data);
  });
}

var address = 0x04;
var wire = new i2c(address, {device: '/dev/i2c-1', debug: false}); // point to your i2c address, debug provides REPL interface
wire.scan(function(err, data) {
  // result contains an array of addresses
});

var throttle = 0;
var LeftRight = 0;
var Reverse = false;
var SuperSpeed = false;
var Claw = false;
var Light = 200;
var CameraPower = false;
var ServoPower = false;
var EscValue = 150;

io.sockets.on('connection', function (socket) {
   console.log("Socket connected");
   // listen to sockets and send values to arduino
   // Throttle data
   socket.on('throttle', function (data) {
     console.log("T " + data);
     throttle = data;
   });
   // Left and Right data
   socket.on('LeftRight', function (data) {
     console.log("LR " + data);
     wire.writeByte(data, function(err) {});
   });
   // Forward mode
   socket.on('Forward', function (data) {
     console.log("Fwd " + data);
     // switch mode
     if (data == 'on') {
       EscValue = (throttle - 0) + 150; 
       exec("echo P1-7=" + EscValue + " > /dev/servoblaster", puts);
       console.log("EscValue =" + EscValue); 
     }
   });
   // Stop mode
   socket.on('Stop', function (data) {
     console.log("Stop " + data);
     // switch mode
     if (data == 'on') {
       //stop
       exec("echo P1-7=150 > /dev/servoblaster", puts);
       console.log("EscValue = 150");
     }
   });
   // Reverse mode
   socket.on('Reverse', function (data) {
     console.log("Rev " + data);
     // switch mode
     if (data == 'on') {
       EscValue = 150 - throttle; 
       exec("echo P1-7=" + EscValue + " > /dev/servoblaster", puts);
       console.log("EscValue =" + EscValue); 
     }
   });
   // Super Speed mode
   socket.on('SuperSpeed', function (data) {
     console.log("S " + data);
     // switch mode
     if (data == 'on') {
       SuperSpeed = true;
       //serialPort.write("S " + '1' + '\n');
     } else if (data == 'off') {
        SuperSpeed = false;
        //serialPort.write("S " + '0' + '\n');
     }
   });
   // Claw mode
   socket.on('Claw', function (data) {
     console.log("C " + data);
     // switch mode
     if (data == 'on') {
       Claw = true;
       //serialPort.write("C " + '1' + '\n');
     } else if (data == 'off') {
       Claw = false;
       //serialPort.write("C " + '0' + '\n');
     }
   });
   // Light mode
   socket.on('Light', function (data) {
     console.log("G " + data);
     // switch mode
     console.log("Clicked");
     if (data == 'on') {
       Light = (201 - 0);
       wire.writeByte(Light, function(err) {});
       //serialPort.write("G " + '1' + '\n');
     } else if (data == 'off') {
       Light = (200 - 0);
       wire.writeByte(Light, function(err) {});
     //serialPort.write("G " + '0' + '\n');
     }
   });
   // Camera Power mode
   socket.on('CameraPower', function (data) {
     console.log("P " + data);
     // switch mode
     if (data == 'on') {
       CameraPower = true;
       gpio22.reset();
       //serialPort.write("P " + '1' + '\n');
     } else if (data == 'off') {
       CameraPower = false;
       gpio22.set();
       //serialPort.write("P " + '0' + '\n');
     }
   });
   // Servo Power mode
   socket.on('ServoPower', function (data) {
     console.log("I " + data);
     // switch mode
     if (data == 'on') {
       ServoPower = true;
       gpio23.reset();
       //serialPort.write("I " + '1' + '\n');
     } else if (data == 'off') {
       ServoPower = false;
       gpio23.set();
       //serialPort.write("I " + '0' + '\n');
     }
   });
   socket.on('disconnect', function () {
     console.log('Client disconnected! OMG!!! Stop the motors!!!!');
     // OMG Stop the motors
     exec("echo P1-7=150 > /dev/servoblaster", puts);
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
 
