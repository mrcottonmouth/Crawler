#include <Wire.h>
#include <Servo.h>
#include <ServoEaser.h>
const int servoPin = 9;
const int arduinoLED = 13;
int lights = 12;

#define SLAVE_ADDRESS 0x04
int number = 0;
int state = 0;

int servoFrameMillis = 20;  // minimum time between servo updates

Servo servo1; 
ServoEaser servoEaser;

void setup() {
    pinMode(arduinoLED, OUTPUT);
    pinMode(lights, OUTPUT);
    digitalWrite(arduinoLED,HIGH);    // default to LED on
    digitalWrite(lights,HIGH);
    servo1.attach( servoPin );
    servoEaser.begin( servo1, servoFrameMillis ); 
    servoEaser.easeTo( 90, 2000);
    digitalWrite(arduinoLED,LOW);
    Serial.begin(9600);         // start serial for output
    // initialize i2c as slave
    Wire.begin(SLAVE_ADDRESS);
    // define callbacks for i2c communication
    Wire.onReceive(receiveData);
    Wire.onRequest(sendData);
    Serial.println("Ready!");
}
 
void loop() {
    servoEaser.update();
    if( servoEaser.hasArrived() ) { 
       digitalWrite(arduinoLED,LOW);
    }
}
 
// callback for received data
void receiveData(int byteCount){
    int pos;
    while(Wire.available()) {
        number = Wire.read();
        Serial.print("data received: ");
        Serial.println(number);
        if (number == 201)  {
          digitalWrite(lights,HIGH);
        }
        else if (number == 200) {
          digitalWrite(lights,LOW);
        }
        else if ((number >= 0) && (number <= 180))  {
          pos = map(number,0, 100, 0, 180);
          pos = constrain(pos, 0, 180);
          servoEaser.easeTo( pos, 500 );
          digitalWrite(arduinoLED,HIGH);
        }
/*        if (number == 999){
           Serial.println("Code 999 Received");
        }
     */
     }
}
 
// callback for sending data
void sendData(){
    Wire.write(number);
}

