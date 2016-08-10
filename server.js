var express = require('express');
var path = require('path');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var five = require('johnny-five');
var passport = require('passport');
var strategy = require('./server/setup-passport');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var requiresLogin = require('./server/requiresLogin');

//Auth0 Setup
app.use(cookieParser());
app.use(session({ secret: '7rQMJ18B2EklEq_7wg1-oKXHoHMd-7I-NGkcMVhsbfjXe6_cJJRghn3bwuIgtY6D', resave: false,  saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

//Setting the path to static assets
app.use(express.static(__dirname + '/web'));

// Auth0 callback handler
app.get('/callback',
  passport.authenticate('auth0', { failureRedirect: '/' }),
  function(req, res) {
    if (!req.user) {
      throw new Error('user null');
    }
    res.redirect("/user");
  });

app.get('/user', requiresLogin, function (req, res) {
  res.sendFile(path.join(__dirname + '/web/launch.html'), {
    user : req.user
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

var board = new five.Board({
    repl: false
});

board.on('ready', function () {
  var servo, relay;
  servo = {
    front: new five.servo({pin: 7, startAt: 90}),
    back:  new five.servo({pin: 8, startAt: 90})
  };

  relay = {
    pump: new five.relay({pin: 5, type: "NO"}),
    valve: new five.relay({pin: 6, type: "NO"})
  };

  io.on('connection', function (socket) {
    console.log('Socket IO connection established');
    socket.on('fire', function (time) {
      console.log('time left: ' + time);
      servo.back.to(180);
      board.wait(1500, function () {
        servo.back.to(90);
      });

      servo.front.to(180);
      board.wait(3000, function () {
        servo.front.to(90);
      });

      relay.pump.close();
      board.wait((time * 1000), function() {
        relay.pump.open();
        board.wait(1000, function() {
          relay.valve.open();
        });
        relay.valve.close();
      });
    });
  });
});
