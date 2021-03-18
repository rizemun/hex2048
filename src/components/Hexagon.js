export class Hexagon {
  constructor({radius, coordinates}) {
    this.radius = radius;
    this.coordinates = coordinates;

    this._calcSizes();
  }

  _calcSizes() {
    this.innerRadius = Math.sqrt(3) / 2 * this.radius;
    this.tallerSize = this.radius;
    this.widerSize =  2 * this.innerRadius;
  }

  render() {
    this.$el = document.createElement('div')
    this.$el.classList.add('hexagon')
    this.$el.classList.add('hexagon_outer')

    this.$el.innerHTML = `
    <div class="hexagon hexagon_inner">
      [${this.coordinates.x}:${this.coordinates.y}:${this.coordinates.z}]
    </div> 
    `
    return this.$el
  }
}
