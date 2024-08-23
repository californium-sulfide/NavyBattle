
class TileC {
    constructor(i, j, element) {
        this.x = i;
        this.y = j;
        this.selected = false;
        this.ships = [];
        this.hit = '';
        this.html = element;
        this.selfship = 0;
        this.opponentship = 0;
    }
    select() {
        this.selected = true;
        this.html.classList.add('selected');
    }
    unselect() {
        this.selected = false;
        this.html.classList.remove('selected');
    }
    place(index) {
        this.selfship = index;
        let image = document.createElement('img');
        image.src = require('./image/blue_ship.png');
        image.classList.add('tile-image');
        image.setAttribute('tag', 'self-ship');
        this.html.appendChild(image);
        let label = document.createElement('span');
        label.innerText = index;
        label.classList.add('self-ship-label');
        this.html.appendChild(label);
        this.select()
    }
    unplace() {
        this.unselect();
        this.html.removeChild(this.html.querySelector('img[tag=self-ship]'));
        this.html.removeChild(this.html.querySelector('span.self-ship-label'));
        let temp = this.selfship;
        this.selfship = 0;
        return temp;
    }
    onhit(player) {
        this.hit = player;
        if (player === 'self') {
            let image = document.createElement('img');
            image.src = require('./image/blue_shot.png');
            image.classList.add('tile-image');
            this.html.appendChild(image);
        }
        if (player === 'opponent') {
            let image = document.createElement('img');
            image.src = require('./image/red_shot.png');
            image.classList.add('tile-image');
            this.html.appendChild(image);
        }
    }
    showShip(type, owner) {
        if (owner === 'self') {
            if (type === 'sink') {
                let image = document.createElement('img');
                image.src = require('./image/blue_sink_ship.png');
                image.classList.add('tile-image');
                this.html.replaceChild(image, this.html.querySelector('img[tag=self-ship]'));
            }
        }
        if (owner === 'opponent') {
            let image = document.createElement('img');
            if (type === 'sink') {
                image.src = require('./image/red_sink_ship.png');
            }else{
                image.src = require('./image/red_ship.png');
            }
            image.classList.add('tile-image');
            this.html.appendChild(image);
        }
    }
}
module.exports = TileC