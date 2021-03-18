export class Keyboard {
  constructor() {
    this.events = {};
    document.addEventListener('keydown', this.onKeyDownTaskManager.bind(this))
  }

  onKeyDownTaskManager(event) {
    if (!this.events[event.code]) {
      return
    }

    this.events[event.code]()
  }

  onKeyDown(code, callback) {
    this.events[code] = callback
  }

  offKeyDown(code) {
    this.events[code] = '';
  }
}
