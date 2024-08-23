const express = require('express');
const socketio = require('socket.io');
const { join } = require('node:path');
const Game = require('./game.js');

const app = express();
const server = app.listen(80);
console.log(`Server listening on port ${8080}`);

const io = socketio(server);
app.use(express.static('./dist'));
/*
app.get('/',(req,res)=>{r
    res.sendFile(join(__dirname,"index.html"));
});*/
let rooms={};
io.on('connection', socket => {
    console.log('Connected', socket.id);
    socket.on('chat message', msg => { 
        console.log('message: ' + msg);
        io.emit('chat message', msg);
    });
    socket.on('join game',joinGame);
    socket.on('disconnect',onDisconnect);
});

function joinGame(roomid,username){
    if(rooms[roomid]===undefined||rooms[roomid].end===true){
        let game=new Game(roomid);
        rooms[roomid]=game;
        game.addPlayer(this,username)
    }else{
        let game=rooms[roomid];
        game.addPlayer(this,username)
    }
}
function onDisconnect(){
    
}