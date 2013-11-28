// Creates a websocket with socket.io
// Make sure to install socket.io: terminal, goto /var/lib/cloud9 and enter: npm install socket.io
// Installing this takes a few minutes; wait until the installation is complete

var app = require('http').createServer(handler),
    io = require('socket.io').listen(app),
    fs = require('fs'),
    i2c = require('i2c'),
    five = require('johnny-five');
    
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
var Light = false;
var RobotPower = false;
var CameraPower = false;


board = new five.Board({ port: "/dev/ttyAMA0" });

board.on("ready", function() {
   console.log("Board ready");
   led = new five.Led({
      pin: 2
   });
   var EA = 9;
   var EB = 10;
   var IN1 = 8;
   var IN2 = 11;
   var IN3 = 12;
   var IN4 = 13;
   this.pinMode(EA, five.Pin.PWM);
   this.pinMode(EB, five.Pin.PWM);
   this.pinMode(IN1, five.Pin.OUTPUT);
   this.pinMode(IN2, five.Pin.OUTPUT);
   this.pinMode(IN3, five.Pin.OUTPUT);
   this.pinMode(IN4, five.Pin.OUTPUT);
   
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
          board.digitalWrite(IN1, 1 ); //Establishes backward direction of Channel A
          board.digitalWrite(IN2, 0 );  
          board.analogWrite(EA, throttle);   //Spins the motor on Channel A at half speed
          board.digitalWrite(IN4, 1 ); //Establishes backward direction of Channel A
          board.digitalWrite(IN3, 0 );  
          board.analogWrite(EB, throttle);   //Spins the motor on Channel A at half speed
       }
     });
     // Stop mode
       socket.on('Stop', function (data) {
       console.log("Stop " + data);
       // switch mode
       if (data == 'on') {
              //stop
          board.digitalWrite(IN1, 0 );
          board.digitalWrite(IN2, 0 );
          board.digitalWrite(IN4, 0 );
          board.digitalWrite(IN3, 0 );
       }
     });
     // Reverse mode
       socket.on('Reverse', function (data) {
       console.log("Rev " + data);
       // switch mode
       if (data == 'on') {
          board.digitalWrite(IN1, 0 ); //Establishes backward direction of Channel A
          board.digitalWrite(IN2, 1 );  
          board.analogWrite(EA, throttle);   //Spins the motor on Channel A at half speed
          board.digitalWrite(IN4, 0 ); //Establishes backward direction of Channel A
          board.digitalWrite(IN3, 1 );  
          board.analogWrite(EB, throttle);   //Spins the motor on Channel A at half speed
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
          Light = true;
          led.on();
          //serialPort.write("G " + '1' + '\n');
       } else if (data == 'off') {
          Light = false;
          led.off();
          //serialPort.write("G " + '0' + '\n');
       }
     });
     // Robot Power mode
       socket.on('RobotPower', function (data) {
       console.log("P " + data);
       // switch mode
       if (data == 'on') {
          RobotPower = true;
          //serialPort.write("P " + '1' + '\n');
       } else if (data == 'off') {
          RobotPower = false;
          //serialPort.write("P " + '0' + '\n');
       }
     });
     // Camera Power mode
       socket.on('CameraPower', function (data) {
       console.log("I " + data);
       // switch mode
       if (data == 'on') {
          CameraPower = true;
          //serialPort.write("I " + '1' + '\n');
       } else if (data == 'off') {
          CameraPower = false;
          //serialPort.write("I " + '0' + '\n');
       }
     });
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
 
