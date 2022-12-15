export class Server {
    constructor(url, fieldSize) {
        this.url = url;
        this.fieldSize = fieldSize;
    }

    _onResponce(response) {
        const event = new CustomEvent('serverResponse', {
            detail: response
        });
        document.dispatchEvent(event);
    }

    getData(body = '[]') {
        fetch(`${this.url}/${this.fieldSize}`, {
            method: 'post',
            body
        })
            .then(res => res.json())
            .then(this._onResponce.bind(this));
    }

    setUrl(newUrl) {
        this.url = newUrl;
    }

    setFieldSize(newFieldSize) {
        this.fieldSize = newFieldSize;
    }
}


export class ServerLess extends Server {
    constructor(url, fieldSize) {
        super(url, fieldSize);
        this.emptyField = this._getCellCoords();
    }

    setFieldSize(newFieldSize) {
        super.setFieldSize(newFieldSize);
        this.emptyField = this._getCellCoords();
    }

    _getCellCoords() {
        console.log('%cthis.fieldSize:', 'font-style:italic; color:#ce93d8', this.fieldSize);

        const field = [];
        for (let i = -this.fieldSize + 1; i < this.fieldSize; i++) {
            for (let j = -this.fieldSize + 1; j < this.fieldSize; j++) {
                for (let k = -this.fieldSize + 1; k < this.fieldSize; k++) {
                    if (!field.find(coords => coords.x === i && coords.y === j && coords.z === k) && i + j + k === 0) {
                        field.push({x: i, y: j, z: k});
                    }
                }
            }
        }
        return field;
    }

    getData(body = '[]') {
        function getRandomIndex(max) {
            return Math.floor(Math.random() * field.length);
        }
        function getCellData(field, index) {
            const res = field[index];
            res.value = Math.random() > .9 ? 4 : 2;
            return res;
        }

        const arr = JSON.parse(body);
        const res = [];
        console.log('%cthis.emptyField:', 'font-style:italic; color:#ce93d8', this.emptyField);

        const field = this.emptyField
            .filter(({x: fieldX, y: fieldY, z: fieldZ}) => {
                return !arr.find(({x: cellX, y: cellY, z: cellZ}) => {
                    return fieldX === cellX && fieldY === cellY && fieldZ === cellZ;
                });
            });
        let index = getRandomIndex(field.length);
        res.push(getCellData(field, index))

        if(body ==='[]') {
            field.splice(index, 1);
            index = getRandomIndex(field.length);
            res.push(getCellData(field, index));

            field.splice(index, 1);
            index = getRandomIndex(field.length);
            res.push(getCellData(field, index));
        }

        this._onResponce(res);
    }
}
