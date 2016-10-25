# minifridge
The minifridge launcher uses an Arduino to control the hardware that handles dispensing a can.  A Rasberry Pi is connected to the Arduino which uses a NodeJS library JohnnyFive for interfacing directly with the Arduino.  The Pi has a webserver running NodeJS as the backend and Auth0 for authentication.  After logging in, the user can select the distance, and launch the can.  A demo of the minifridge can be found below.

# setup
Software Setup:
 - npm install
 - configure an Auth0 account, and change the parameters to match your secret key
   - note: in a perfect world I would include the secret key in a config file, but you will have to change it in two places.  The login.html and the server.js file ened to have Auth0 parameters updated.   
 - depending on how your arduino is configured, the pins may need to be changed in the server.js file
 - node server.js
 
Hardware Setup:
 - The Arduino needs to connect to The Rasberry Pi via USB cable
 - Personally, I used two relays, two servos, a tire pump, and a sprinkler valve in order to control the dispensing of the can.  A visual explanation can be seen in the demo video.
   - note: I should upload a schematic detailing the hardware side.
