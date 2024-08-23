class Game {
    constructor(roomId) {
        this.sockets = {};
        this.id = roomId;
        this.players = {};
        this.tiles = [];
        this.finishPlacing = 0;
        this.startPlayer = '';
        this.socketHistory=[];
        for (let i = 0; i < 10; i++) {
            this.tiles.push([]);
            for (let j = 0; j < 10; j++) {
                this.tiles[i].push(new TileS(i, j));
            }
        }
        this.end=false;
    }
    addPlayer(socket, username) {
        if (Object.keys(this.players).length >= 2) {
            return;
        }
        this.sockets[socket.id] = socket;
        this.players[socket.id] = new Player(socket.id, username, socket);
        console.log(username,'(',socket.id,') join room:',this.id);
        socket.emit('join success');
        if (Object.keys(this.players).length == 2) {
            this.players[Object.keys(this.sockets)[0]].nextPlayer = Object.keys(this.sockets)[1];
            this.players[Object.keys(this.sockets)[1]].nextPlayer = Object.keys(this.sockets)[0];
            this.startPlayer = Object.keys(this.sockets)[0];
            this.gameStart();
        }
    }
    gameStart() {
        Object.values(this.sockets).forEach(socket => {
            socket.emit('game start');
            socket.on('placed-ships', (ships) => {//ships是二维数组
                if (this.checkPlace(ships)) {
                    socket.emit('place-result', 'accepted');
                    this.handlePlace(ships, socket.id);
                    this.finishPlacing += 1;
                    if (this.finishPlacing === 2) {
                        this.sockets[this.startPlayer].emit('your-turn');
                    }
                    console.log(socket.id,'finish placing');
                } else {
                    socket.emit('place-result', 'rejected');
                }
            })
            socket.on('hit-tiles', (targets) => {
                for (let i = 0; i < targets.length; i++) {
                    let target = this.tiles[targets[i][0]][targets[i][1]];
                    if (target.hit !== '') {
                        socket.emit('hit-result', 'rejected');
                        return;
                    }
                }
                Object.values(this.sockets).forEach(tosocket => {
                    tosocket.emit('hit-result', 'accepted', socket.id, targets);
                });
                for (let i = 0; i < targets.length; i++) {
                    let target = this.tiles[targets[i][0]][targets[i][1]];
                    target.hit = socket.id;

                    Object.keys(target.ships).forEach(owner => {
                        this.players[owner].army[target.ships[owner]].alive-=1;
                        if(this.players[owner].army[target.ships[owner]].alive===0){
                            
                            Object.values(this.sockets).forEach(tosocket => {
                                tosocket.emit('ship-result', 'sink',owner, [target.x,target.y]);
                            });
                        }else if (owner !== socket.id) {
                            Object.values(this.sockets).forEach(tosocket => {
                                tosocket.emit('ship-result','normal', owner, [target.x,target.y]);
                            });
                        }
                    })
                }
                let death1=this.checkDeath(socket.id),death2=this.checkDeath(this.players[socket.id].nextPlayer);
                this.sockets[this.players[socket.id].nextPlayer].emit('your-turn');
                if(death1===1||death2===1){
                    let result=[['not end','win'],['lose','draw']];
                    socket.emit('game-end',result[death1][death2]);
                    this.sockets[this.players[socket.id].nextPlayer].emit('game-end',result[death2][death1]);
                    this.end=true;
                }
            });
        });
    }
    checkDeath(id){
        if(this.players[id].army[1].alive+this.players[id].army[2].alive+this.players[id].army[3].alive+this.players[id].army[4].alive===0){
            return 1;
        }else{
            return 0;
        }
    }
    handlePlace(ships, id) {
        for (let i = 1; i <= 4; i++) {
            this.players[id].army[i] = {
                alive: 4,
                ships: ships[i],
            };
            for (let j = 0; j < 4; j++) {
                let pos = ships[i][j];
                this.tiles[pos[0]][pos[1]].ships[id] = i;
            }
        }
    }
    checkPlace(ships) {
        return 1;
    }
}
class Player {
    constructor(id, username, socket) {
        this.id = id;
        this.username = username;
        this.socket = socket;
        this.army = [];
        this.nextPlayer = '';
    }
}
class TileS {
    constructor(i, j) {
        this.x = i;
        this.y = j;
        this.ships = {};
        this.hit = '';
    }
}
module.exports = Game