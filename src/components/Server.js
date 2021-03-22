export class Server {
  constructor(url, fieldSize) {
    this.url = url;
    this.fieldSize = fieldSize;
  }

  _onResponce(response) {
    const event = new CustomEvent("serverResponse", {
      detail: response
    });
    document.dispatchEvent(event);
  }

  getData(body='[]') {
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


