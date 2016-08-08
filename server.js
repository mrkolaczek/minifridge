var express = require('express');
var app = express();
var path = require('path');
var io = require('socket.io')(app.listen(3000));
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
    socket.on('fire', function () {
      servo.back.to(180);
      board.wait(1500, function () {
        servo.back.to(90);
      });

      servo.front.to(180);
      board.wait(3000, function () {
        servo.front.to(90);
      });

      relay.pump.close();
      board.wait(28000, function() {
        relay.pump.open();
        board.wait(1000, function() {
          relay.valve.open();
        });
        relay.valve.close();
      });
    });
  });
});
