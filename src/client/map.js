const TileC = require('./tile.js');
const STATUS_TYPES={
    BEFORE_START:'a1',
    WAIT:'a2',
    PLACE:'b1',
    HIT:'c1',
    WIN:'d1',
    LOSE:'d2',
    DRAW:'d3'
}
class MapC {
    constructor(socket) {
        this.socket = socket;
        this.status = STATUS_TYPES.BEFORE_START;
        this.tiles = [];
        this.placingshipindex = [];
        this.nextTurnButton=document.getElementById("next-turn-button");
    }
    init(){
        this.nextTurnButton.addEventListener('click', () => {
            this.nextTurn()
        });
        this.socket.on('place-result', result => {
            if (result === 'accepted') {
                this.status = STATUS_TYPES.WAIT;
            } else {
                this.status = STATUS_TYPES.PLACE;
            }
            this.updateButton(this.status);
        })
        this.socket.on('your-turn', () => {
            this.status = STATUS_TYPES.HIT;
            this.updateButton(this.status);
        })
        this.socket.on('hit-result', (result, player, positions) => {

            if (result === 'accepted') {
                if (player === this.socket.id) {
                    player = 'self';
                    this.status = STATUS_TYPES.WAIT;
                    this.updateButton(this.status);
                } else {
                    player = 'opponent';
                }
                positions.forEach(pos => {
                    this.tiles[pos[0]][pos[1]].onhit(player);
                })

            } else {
                this.status = STATUS_TYPES.HIT;
                this.updateButton(this.status);
            }
        });
        this.socket.on('ship-result', (type, owner, pos) => {
            if (owner === this.socket.id) {
                owner = 'self';
            } else {
                owner = 'opponent';
            }
            this.tiles[pos[0]][pos[1]].showShip(type, owner);
        });
        this.socket.on('game-end', result => {
            if (result === 'win'||result==='draw') {
                window.alert('you win');
                
            this.status = STATUS_TYPES.WIN;
            } else {
                window.alert('you lose')
                
            this.status = STATUS_TYPES.LOSE;
            }
            this.updateButton(this.status);
        });
    }
    createAxisLabel(label, type) {
        let axis = document.createElement('div');
        let axistext = document.createTextNode(label)
        axis.appendChild(axistext);
        axis.classList.add('map-axis-label', type + '-axis-label');
        return axis;
    }
    gameStart() {
        this.tiles = [];
        let maphtml = document.createElement('div');
        document.getElementById('game-container').replaceChild(maphtml,document.getElementById('game-map'));
        maphtml.id='game-map';
        let labelList = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
        maphtml.appendChild(this.createAxisLabel('', 'corner'));
        for (let i = 0; i < 10; i++) {
            maphtml.appendChild(this.createAxisLabel(labelList[i], 'horizontal'));
        }
        maphtml.appendChild(this.createAxisLabel('', 'corner'));
        for (let i = 0; i < 10; i++) {
            this.tiles.push([]);

            maphtml.appendChild(this.createAxisLabel(i + 1, 'vertical'));

            for (let j = 0; j < 10; j++) {

                let td = document.createElement('div');
                td.addEventListener('click', () => { this.handleTileClick(i, j) })
                td.classList.add('tile')
                maphtml.appendChild(td);
                this.tiles[i].push(new TileC(i, j, td));
            }

            maphtml.appendChild(this.createAxisLabel(i + 1, 'vertical'));

        }
        maphtml.appendChild(this.createAxisLabel('', 'corner'));
        for (let i = 0; i < 10; i++) {
            maphtml.appendChild(this.createAxisLabel(labelList[i], 'horizontal'));
        }
        maphtml.appendChild(this.createAxisLabel('', 'corner'));
        this.status = STATUS_TYPES.PLACE;
        this.updateButton(this.status);
        this.placingshipindex = [1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4];
    }
    handleTileClick(i, j) {
        if (this.status === STATUS_TYPES.PLACE) {
            if (this.tiles[i][j].selected === true) {
                this.placingshipindex.unshift(this.tiles[i][j].unplace());
            } else {
                if (this.placingshipindex.length > 0) {
                    this.tiles[i][j].place(this.placingshipindex.shift());
                }
            }
        }
        if (this.status === STATUS_TYPES.HIT) {
            if (this.tiles[i][j].selected === false) {
                this.tiles[i][j].select();
            } else {
                this.tiles[i][j].unselect();
            }
        }
    }
    nextTurn() {
        console.log('next turn')
        if (this.status === STATUS_TYPES.PLACE) {
            if (this.placingshipindex.length == 0) {
                let placedships = [[], [], [], [], []];
                for (let i = 0; i < 10; i++) {
                    for (let j = 0; j < 10; j++) {
                        if (this.tiles[i][j].selfship > 0) {
                            placedships[this.tiles[i][j].selfship].push([i, j]);
                        }
                        if (this.tiles[i][j].selected) {
                            this.tiles[i][j].unselect();
                        }
                    }
                }
                this.socket.emit('placed-ships', placedships);
                this.status = STATUS_TYPES.WAIT;
                this.updateButton(this.status);
            }
        }
        if (this.status === STATUS_TYPES.HIT) {
            let hittiles = [];
            for (let i = 0; i < 10; i++) {
                for (let j = 0; j < 10; j++) {
                    if (this.tiles[i][j].selected) {
                        this.tiles[i][j].unselect();
                        hittiles.push([i, j]);
                    }
                }
            }
            if (hittiles.length <= 3 && hittiles.length > 0) {
                this.socket.emit('hit-tiles', hittiles);
                this.status = STATUS_TYPES.WAIT;
                this.updateButton(this.status);
            }
        }
        if(this.status===STATUS_TYPES.WIN||this.status===STATUS_TYPES.LOSE||this.status===STATUS_TYPES.DRAW){
            document.getElementById("outside-option-box").classList.remove('hidden');
            document.getElementById("room-option").classList.add('hidden');
        }
    }
    updateButton(status){
        this.nextTurnButton.classList.remove('button-active','button-check','button-wait','button-win','button-lose')
        if(status===STATUS_TYPES.WAIT){
            this.nextTurnButton.classList.add('button-wait');
            this.nextTurnButton.innerText='等待中'
        }else if(status===STATUS_TYPES.PLACE||status===STATUS_TYPES.HIT){
            this.nextTurnButton.classList.add('button-active');
            this.nextTurnButton.innerText='结束回合'
        }else if(status===STATUS_TYPES.WIN){
            this.nextTurnButton.classList.add('button-win');
            this.nextTurnButton.innerText='你赢了,再来一局'
        }else if(status===STATUS_TYPES.LOSE){
            this.nextTurnButton.classList.add('button-lose');
            this.nextTurnButton.innerText='你输了，再来一局'
        }
    }
}
module.exports = MapC;