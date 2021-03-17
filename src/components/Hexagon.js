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
    return `
      <div class="hexagon hexagon__outer" style="width:${this.tallerSize}px; height:${this.widerSize}px;">
        <div class="hexagon hexagon__inner">
          [${this.coordinates.x}:${this.coordinates.y}:${this.coordinates.z}]
        </div>
      </div> 
    `
  }
}
