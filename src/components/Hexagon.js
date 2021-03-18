export class Hexagon {
  constructor({radius, coordinates}) {
    this.radius = radius;
    this.coordinates = coordinates;
    this._neighbours = {};
  }

  get neighbours() {
    return this._neighbours;
  }

  set neighbours(newNeighbours) {
    this._neighbours = newNeighbours;
  }

  drawCoordinates() {
    this.$innerEl.innerText = `[${this.coordinates.x}:${this.coordinates.y}:${this.coordinates.z}]`
  }

  drawText(text) {
    this.$innerEl.innerText = text;
  }

  render() {
    this.$el = document.createElement('div')
    this.$el.classList.add('hexagon')
    this.$el.classList.add('hexagon_outer')
    this.$el.innerHTML = `<div class="hexagon hexagon_inner"></div>`
    this.$innerEl = this.$el.children[0];
    return this.$el
  }
}
