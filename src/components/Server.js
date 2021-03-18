export class Server {
  constructor(url) {
    this.url = url;
  }

  _onResponce(response) {
    const event = new CustomEvent("serverResponse", {
      detail: response
    });
    document.dispatchEvent(event);
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


