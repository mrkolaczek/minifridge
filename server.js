var express = require('express');
var app = express();
var path = require('path');
var io = require('socket.io')(app.listen(3000));
var five = require('johnny-five');
var passport = require('passport');
var strategy = require('./server/setup-passport');
var cookieParser = require('cookie-parser');
var session = require('express-session');

//Auth0 Setup
app.use(cookieParser());
app.use(session({ secret: '7rQMJ18B2EklEq_7wg1-oKXHoHMd-7I-NGkcMVhsbfjXe6_cJJRghn3bwuIgtY6D', resave: false,  saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

//Setting the path to static assets
app.use(express.static(__dirname + '/web'));

// Auth0 callback handler
app.get('/callback',
  passport.authenticate('auth0', { failureRedirect: '/url-if-something-fails' }),
  function(req, res) {
    if (!req.user) {
      throw new Error('user null');
    }
    res.redirect("/user");
  });

app.get('/user', function (req, res) {
  res.sendFile(path.join(__dirname + '/web/launch.html'), {
    user : req.user
  });
});

var board = new five.Board({
    repl: false
});

board.on('ready', function () {
    var speed, commands, motors;
    motors = {
        a: new five.Motor([3, 12]),
        b: new five.Motor([11, 13])
    };

    commands = null;
    speed = 255;

    io.on('connection', function (socket) {
        socket.on('stop', function () {
            motors.a.stop();
            motors.b.stop();
        });

        socket.on('start', function () {
            speed = 150;
            motors.a.fwd(speed);
            motors.b.fwd(speed);
        });

        socket.on('reverse', function () {
            speed = 120;
            motors.a.rev(speed);
            motors.b.rev(speed);
        });

        socket.on('left', function () {
            var aSpeed = 220;
            var bSpeed = 50;
            motors.a.fwd(aSpeed);
            motors.b.rev(bSpeed);
        });

        socket.on('right', function () {
            var aSpeed = 50;
            var bSpeed = 220;
            motors.a.rev(aSpeed);
            motors.b.fwd(bSpeed);
        });
    });
});
