#include <SoftwareSerial.h>
SoftwareSerial mySerial(6, 7); // RX, TX

#include <SerialCommand.h>

SerialCommand sCmd;     // The demo SerialCommand object

//=====[ PINS ]=================================================================
const int pinI1=8;//define I1 interface
const int pinI2=11;//define I2 interface 
const int speedpinA=9;//enable motor A
const int pinI3=12;//define I3 interface 
const int pinI4=13;//define I4 interface 
const int speedpinB=10;//enable motor B
const int led = 7;
const int IRcameraPin = A0;

//=====[ VARIABLES ]============================================================
int Throttle = 0;
int Steering = 50;
int Forward = 0;
int Stop = 1;
int Reverse = 0;
int RobotPower = 0;
int LiGht;
int IRcamera;
unsigned long currentMillis = millis();
unsigned long previousMillis = 0; // last time update
long interval = 2000; // interval at which to do something (milliseconds)
int AliveFlag = 0;
char RunningMode = 'S';

//=====[ SETUP ]================================================================
void setup() {
  pinMode(pinI1,OUTPUT);
  pinMode(pinI2,OUTPUT);
  pinMode(speedpinA,OUTPUT);
  pinMode(pinI3,OUTPUT);
  pinMode(pinI4,OUTPUT);
  pinMode(speedpinB,OUTPUT);
  pinMode(led, OUTPUT);
  digitalWrite(led, LOW);
  digitalWrite(speedpinA,LOW);// Unenble the pin, to stop the motor. this should be done to avid damaging the motor. 
  digitalWrite(speedpinB,LOW);
  mySerial.begin(115200);
  Serial.begin(115200);
  // Setup callbacks for SerialCommand commands
  sCmd.addCommand("T",     processThrottle);
  sCmd.addCommand("V",     processSteering);
  sCmd.addCommand("F",     processForward);
  sCmd.addCommand("S",     processStop);
  sCmd.addCommand("R",     processReverse);
  sCmd.addCommand("P",     processRobotPower);
  sCmd.addCommand("G",     processLiGht);
  sCmd.addCommand("I",     processIRcamera);
  sCmd.setDefaultHandler(unrecognized);      // Handler for command that isn't matched  (says "What?")
  Serial.println("Crawler Ready");
}

//=====[ LOOP ]================================================================
void loop() {
  sCmd.readSerial();     // We don't do much, just process serial commands
  currentMillis = millis();
  if(currentMillis - previousMillis > interval) {
      AliveFlag = 0;
  }     
  if (AliveFlag == 1)  {
    Motivate();
  }
  else {
    Stopppp();
  }
}

//=====[ FUNCTIONS ]============================================================
void Motivate()  {
  if (RobotPower != 0)  {
    if (Forward == 1)  {
       RunningMode = 'F';
    }
    else if (Reverse == 1)  {
       RunningMode = 'R';
    }
    else if (Stop == 1)  {
       RunningMode = 'S';
    }
    switch (RunningMode)  {
      case 'S':
        Serial.println("Stop");
        Stopppp();
        break;
      case 'F':
        Serial.println("Fwd");
        digitalWrite(pinI4,HIGH);//turn DC Motor B move
        digitalWrite(pinI3,LOW);
        digitalWrite(pinI2,LOW);//turn DC Motor A move
        digitalWrite(pinI1,HIGH);
        analogWrite(speedpinA, Throttle);//input a value to set the speed
        analogWrite(speedpinB, Throttle);
        break;
      case 'R':  //Reverse enabled
        Serial.println("Rev");
        digitalWrite(pinI4,LOW);//turn DC Motor B move
        digitalWrite(pinI3,HIGH);
        digitalWrite(pinI2,HIGH);//turn DC Motor A move
        digitalWrite(pinI1,LOW);
        analogWrite(speedpinA, Throttle);//input a value to set the speed
        analogWrite(speedpinB, Throttle);
        break;
    }
  }
  else  {
      Stopppp();
  }
}

void Alive()  {
      previousMillis = currentMillis;
      AliveFlag = 1;
}

void Stopppp()  {
    analogWrite(speedpinA,0);// Unenble the pin, to stop the motor. this should be done to avid damaging the motor. 
    analogWrite(speedpinB,0);
    AliveFlag = 0;
}

void processThrottle() {
  char *arg;
  Serial.println("Throttle");
  arg = sCmd.next();
  if (arg != NULL) {
    Throttle = atoi(arg);    // Converts a char string to an integer
      Serial.print("T Value: ");
      Serial.println(Throttle);
    Alive();
  }
  else {
      Serial.println("No arguments");
  }
}

void processSteering() {
  char *arg;
    Serial.println("Steering");
  arg = sCmd.next();
  if (arg != NULL) {
    Steering = atoi(arg);    // Converts a char string to an integer
    mySerial.print("V ");
    mySerial.println(arg);
    Alive();
  }
  else {
      Serial.println("No arguments");
  }
}

void processForward() {
  char *arg;
    Serial.println("Forward");
  arg = sCmd.next();
  if (arg != NULL) {
    Forward = atoi(arg);    // Converts a char string to an integer
      Serial.print("R Value: ");
      Serial.println(Reverse);
    if (Forward == 1)  {
      Stop = 0;
      Reverse = 0;
    }
    Alive();
  }
  else {
    Serial.println("No arguments");
  }
}
void processStop() {
  char *arg;
    Serial.println("Stop");
  arg = sCmd.next();
  if (arg != NULL) {
    Stop = atoi(arg);    // Converts a char string to an integer
    if (Stop == 1)  {
      Forward = 0;
      Reverse = 0;
    }
    Alive();
  }
  else {
    Serial.println("No arguments");
  }
}
void processReverse() {
  char *arg;
    Serial.println("Reverse");
  arg = sCmd.next();
  if (arg != NULL) {
    Reverse = atoi(arg);    // Converts a char string to an integer
    if (Reverse == 1)  {
      Forward = 0;
      Stop = 0;
    }
    Alive();
  }
  else {
    Serial.println("No arguments");
  }
}

void processRobotPower() {
  char *arg;
    Serial.println("RobotPower");
  arg = sCmd.next();
  if (arg != NULL) {
    RobotPower = atoi(arg);    // Converts a char string to an integer
    Alive();
  }
  else {
      Serial.println("No arguments");
  }
}

void processLiGht() {
  char *arg;
    Serial.println("LiGht");
  arg = sCmd.next();
  if (arg != NULL) {
    LiGht = atoi(arg);    // Converts a char string to an integer
      Serial.print("G Value: ");
      Serial.println(LiGht);
    if (LiGht == 1)  {
      digitalWrite(led, HIGH);
//      Serial.println("LiGht On");
    }
    else if (LiGht == 0)  {
      digitalWrite(led, LOW);
//      Serial.println("LiGht Off");
    }
  }
  else {
      Serial.println("No arguments");
  }
}

void processIRcamera() {
  char *arg;
    Serial.println("IRcamera");
  arg = sCmd.next();
  if (arg != NULL) {
    IRcamera = atoi(arg);    // Converts a char string to an integer
      Serial.print("I Value: ");
      Serial.println(IRcamera);
//    if (IRcamera == 0)  {
//      digitalWrite(IRcameraPin, LOW);
//      Serial.println("Camera Off");
//    }
//    else if (IRcamera == 1)  {
//      digitalWrite(IRcameraPin, HIGH);
//      Serial.println("Camera On");
//    }
  }
  else {
      Serial.println("No arguments");
  }
}

// This gets set as the default handler, and gets called when no other command matches.
void unrecognized(const char *command) {
    Serial.println("What?");
}

/*
void LED_on() {
  Serial.println("LED on");
  digitalWrite(arduinoLED, HIGH);
}

void LED_off() {
  Serial.println("LED off");
  digitalWrite(arduinoLED, LOW);
}

void sayHello() {
  char *arg;
  arg = sCmd.next();    // Get the next argument from the SerialCommand object buffer
  if (arg != NULL) {    // As long as it existed, take it
    Serial.print("Hello ");
    Serial.println(arg);
  }
  else {
    Serial.println("Hello, whoever you are");
  }
}

void processCommand() {
  int aNumber;
  char *arg;

  Serial.println("We're in processCommand");
  arg = sCmd.next();
  if (arg != NULL) {
    aNumber = atoi(arg);    // Converts a char string to an integer
    Serial.print("First argument was: ");
    Serial.println(aNumber);
  }
  else {
    Serial.println("No arguments");
  }

  /*arg = sCmd.next();
  if (arg != NULL) {
    aNumber = atol(arg);
    Serial.print("Second argument was: ");
    Serial.println(aNumber);
  }
  else {
    Serial.println("No second argument");
  }
}
*/



