/**
  Reid Kolaczek
  
  Controls the minifridge and listens to the node server
**/

#include <SPI.h>
#include <Ethernet.h>
#include <Servo.h>

byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };   //physical mac address
byte ip[] = { 192, 168, 1, 178 };                      // ip in lan (that's what you need to use in your browser. ("192.168.1.178")
byte gateway[] = { 192, 168, 1, 1 };                   // internet access via router
byte subnet[] = { 255, 255, 255, 0 };                  //subnet mask
EthernetServer server(80);                             //server port     

String readString;

int valveRelay = 6;
int pumpRelay = 5;

Servo servoFront;
Servo servoBack;
Servo servoTurn;

void setup() {
 // Open serial communications and wait for port to open:
  Serial.begin(9600);
  
  servoFront.attach(7);
  servoBack.attach(8);
  servoTurn.attach(3);
  
  servoFront.write(90);
  servoBack.write(90);
  servoTurn.write(90);
  
  pinMode(valveRelay, OUTPUT);
  pinMode(pumpRelay, OUTPUT); 
  digitalWrite(pumpRelay, HIGH);
  // start the Ethernet connection and the server:
  Ethernet.begin(mac, ip, gateway, subnet);
  server.begin();
  Serial.print("server is at ");
  Serial.println(Ethernet.localIP());
}


void loop() {
  if (Serial.available()){
    
    char ch = Serial.read();
    /**if (ch == 'f') {
      
       servoBack.write(180);
       delay(1500);
       servoBack.write(90);
       delay(500);
       servoFront.write(180);
       delay(3000);
       servoFront.write(90);
       
       Serial.println("Filling the pump!");
       digitalWrite(pumpRelay, LOW);
       delay(28000);
       digitalWrite(pumpRelay, HIGH);
      
       digitalWrite(valveRelay,HIGH);
       delay(1000);
       digitalWrite(valveRelay,LOW);
    }**/
    
    if (ch == 'a') {
      servoTurn.write(0);
      Serial.println("180 degree turn.");
    }
  }
  
  // Create a client connection
  EthernetClient client = server.available();
  if (client) {
    while (client.connected()) {   
      if (client.available()) {
        char c = client.read();
     
        //read char by char HTTP request
        if (readString.length() < 100) {
          //store characters to string
          readString += c;
          Serial.print(c);
         }

         //if HTTP request has ended
         if (c == '\n') {          
           Serial.println(readString); //print to serial monitor for debuging
     
           client.println("HTTP/1.1 200 OK"); //send new page
           client.println("Content-Type: text/html");
           client.println();     
           client.println("<HTML>");
           client.println("<meta name=viewport content='width=300'>");
           client.println("<title>Minifridge Launcher</title>");
           client.println("<body bgcolor='#5E5E5E'>");
           client.println("<p align='center'>");
           //client.println("<input style=\"color:green;font-size:200%;\" type=\"button\" value=\" <-- \" onmousedown=\"location.href=('/?left');\"/>");
           //client.println("<input style=\"color:orange;font-size:200%;\" type=\"button\" value=\" --> \" onmousedown=\"location.href=('/?right');\"/>");
           //client.println("<input style=\"color:green;font-size:200%;\" type=\"button\" value=\" FILL \" onmousedown=\"location.href=('/?fill');\" onclick=\"alert('Filling the air tank!')\"/>");
           client.println("<br><br><br><br>");
           client.println("<input style=\"color:red;font-size:200%;\" type=\"button\" value=\" FIRE \" onmousedown=\"location.href=('/?fire');\" onclick=\"alert('Drink will dispense 5 seconds after the air pump stops!')\"/>");
           client.println("<p align='center' style=\"color:white;\">Made by Reid Kolaczek 2015</p>");
           client.println("</p>");
           client.println("</body>");
           client.println("</HTML>");
     
           delay(1);
           //stopping client
           client.stop();
           
           //controls the Arduino if you press the buttons
           if (readString.indexOf("?left") > 0){
               //TODO: MAKE SERVO GO LEFT ON BUTTON PRESS
             }
           
           if (readString.indexOf("?right") > 0){
               //TODO: MAKE SERVO GO RIGHT ON BUTTON PRESS
           }
           
           if (readString.indexOf("?fill") > 0){
              //TODO: ADD CODE FOR TRIGGERING RELAY TO FILL AIR CHAMBER
           }
           
           if (readString.indexOf("?fire") > 0){
               
               servoBack.write(180);
               delay(1500);
               servoBack.write(90);
               delay(500);
               servoFront.write(180);
               delay(3000);
               servoFront.write(90);
               
               digitalWrite(valveRelay, HIGH);
               delay(100);
               digitalWrite(valveRelay, LOW);
           }
           //clearing string for next read
           readString="";  
           
         }
       }
    }
  }
}
