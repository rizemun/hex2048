export class Server {
  constructor(url) {
    this.url = url;
  }

  _onResponce(responce) {
    const table = window.field.fieldTable;

    responce.forEach(cell => {
      const {x, y, z, value} = cell;
      table['' + x]['' + y]['' + z].drawText(value)
    })
  }

  getData(body='[]') {
    fetch(this.url, {
      method: 'post',
      body
    })
      .then(res => res.json())
      .then(this._onResponce.bind(this));
  }
}


