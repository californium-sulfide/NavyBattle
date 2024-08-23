import io from 'socket.io-client';
import style from './style.css';
const MapC = require('./map.js');
const socket = io();
function st() {
    document.getElementById("enter-room-box").classList.remove('hidden');
    document.getElementById("outside-option-box").classList.add('hidden');
    map.gameStart();
}
const map = new MapC(socket);
map.init();
document.getElementById("room-id-confirm").addEventListener('click', () => {

    let roomid = document.getElementById("room-id-input").value;
    roomid = roomid.replace(/\W/g, '');
    let username = document.getElementById("username").value;
    username = username.replace(/\W/g, '');
    if (roomid === '' || username === '') {
    } else {
        socket.emit('join game', roomid, username);
        socket.on('join success', () => {
            document.getElementById("room-option").classList.remove('hidden');
            document.getElementById("enter-room-box").classList.add('hidden');
        })
    }
});
socket.on('game start', st)