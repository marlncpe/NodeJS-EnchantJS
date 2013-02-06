
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , io = require('socket.io');

var app = express() 
  , server = require('http').createServer(app)
  , io = io.listen(server);

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

server.listen(app.get('port'))

var players = new Array();

io.sockets.on('connection', function(socket) {
  socket.on('message:login', function(player) {
    players.push(player);
    io.sockets.emit('message:join', { player: player, players: players });
  });
  socket.on('message:send', function(data) {
    if (data.message == 'move') {
      for (i = 0; i < players.length; i++) {
        if (players[i].id == data.player.id) {
          players[i].x = data.player.x;
          players[i].y = data.player.y;
          break;
        }
      }
      io.sockets.emit('message:receive', { message: data.message, player: data.player });
    }
    else if (data.message == 'shoot') {
      io.sockets.emit('message:receive', { message: data.message });
    }
  });
});
