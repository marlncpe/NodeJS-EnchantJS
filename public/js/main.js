enchant();

var socket = io.connect();

var myid = null;

var tanks = new Array();

socket.on()

socket.on('message:join', function (data) {
    var game = enchant.Game.instance;
    var pr = data.player;
    var ps = data.players;
    if (pr.id != myid) {
        var tank = new Enemy(pr.id, pr.x, pr.y);
        tanks.push(tank);
        game.rootScene.addChild(tank);
    } else {
        for (i = 0; i < ps.length; i++) {
            var p = ps[i];
            if (p.id == myid) {
                var tank = new Player(p.id, p.x, p.y);
                tanks.push(tank);
                game.rootScene.addChild(tank);
            } else {
                var tank = new Enemy(p.id, p.x, p.y);
                tanks.push(tank);
                game.rootScene.addChild(tank);
            }
        }
    }
});

socket.on('message:receive', function (data) {
    var game = enchant.Game.instance;
    if (data.message == 'move') {
        if (data.player.id != myid) {
            for (i = 0; i < tanks.length; i++) {
                if (tanks[i].uid == data.player.id) {
                    tanks[i].setpos(data.player.x, data.player.y);
                    break;
                }
            }
        }
    }
});

function login() {
    myid = String(parseInt(Math.random() * 1000000));
    socket.emit('message:login', { id:myid, x:160, y:160 });
}

function send_move(x,y) {
    socket.emit('message:send', { message: 'move', player:{id:myid, x:x, y:y} });
}

function send_shoot() {
    socket.emit('message:send', { message: 'shoot' });
}

var target = null;

Target = enchant.Class.create({
    initialize: function(x,y) {
        this.x = x;
        this.y = y;
    }
});

Tank = enchant.Class.create(Sprite, {
    initialize: function(uid,x,y) {
        Sprite.call(this, 32, 32);
        var game = enchant.Game.instance;
        this.image = game.assets['img/chara3.png'];
        this.speed = 10;
        this.uid = uid;
        this.setpos(x,y);
        this.toUp();
    },
    move: function(x,y) {
        var cx = this.getx();
        var cy = this.gety();
        var vx = Math.abs(cx - x);
        var vy = Math.abs(cy - y);
        vx = (vx > this.speed) ? this.speed : vx;
        vy = (vy > this.speed) ? this.speed : vy;
        vx = (cx < x) ? vx : -vx;
        vy = (cy < y) ? vy : -vy;
        if (vx != 0 || vy != 0) {
          this.setpos(cx + vx, cy + vy);
          send_move(this.getx(), this.gety());
        }
    },
    getx: function() {
        return this.x + (this.width / 2);
    },
    gety: function() {
        return this.y + (this.height / 2);
    },
    setpos: function(x,y) {
        var tx = x - (this.width / 2);
        var ty = y - (this.height / 2);
        if (tx > this.x) {
            this.toRight();
        } else if (tx < this.x) {
            this.toLeft();
        } else if (ty > this.y) {
            this.toDown();
        } else if (ty < this.y) {
            this.toUp();
        }
        this.x = tx;
        this.y = ty;
    }
});

Player = enchant.Class.create(Tank, {
    initialize: function(uid,x,y) {
        Tank.call(this, uid, x, y);
        this.addEventListener('enterframe', function(){
            this.frame = this.ff + (this.age % this.fm);
            this.move(target.x, target.y);
        });
        this.addEventListener('touchstart', function(){
            send_shoot();
        });
    },
    toDown: function() {
      this.ff = 0;
      this.fm = 3;
      this.frame = this.ff;
    },
    toLeft: function() {
      this.ff = 6;
      this.fm = 3;
      this.frame = this.ff;
    },
    toRight: function() {
      this.ff = 12;
      this.fm = 3;
      this.frame = this.ff;
    },
    toUp: function() {
      this.ff = 18;
      this.fm = 3;
      this.frame = this.ff;
    }
});

Enemy = enchant.Class.create(Tank, {
    initialize: function(uid,x,y) {
        Tank.call(this, uid, x, y);
        this.addEventListener('enterframe', function(){
            this.frame = this.ff + (this.age % this.fm);
        });
    },
    toDown: function() {
      this.ff = 3;
      this.fm = 3;
      this.frame = this.ff;
    },
    toLeft: function() {
      this.ff = 9;
      this.fm = 3;
      this.frame = this.ff;
    },
    toRight: function() {
      this.ff = 15;
      this.fm = 3;
      this.frame = this.ff;
    },
    toUp: function() {
      this.ff = 21;
      this.fm = 3;
      this.frame = this.ff;
    }
});

window.onload = function(){
    var game = new Game(320, 320);
    game.fps = 15;
    game.preload('img/chara1.png', 'img/chara3.png');
    game.onload = function(){
        target = new Target(160, 160);
        game.rootScene.backgroundColor = "#cc0";
        game.rootScene.addEventListener('touchstart', function(e){
            target.x = e.x;
            target.y = e.y;
        })
        game.rootScene.addEventListener('touchmove', function(e){
            target.x = e.x;
            target.y = e.y;
        })
        login();
    };
    game.start();
};
