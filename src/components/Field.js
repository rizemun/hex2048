import {Hexagon} from "@/Hexagon"

export class Field {
  constructor($el, size, radius) {
    this.$el = $el;
    this.size = size;
    this.tableSize = size * 2 - 1;
    this.radius = radius;
    this.fieldTable = []
  }

  _createColumnTemplate(count, columnIndex) {
    const getZCoordinate = (indexInColumn) => {
      return columnIndex > 0
        ? indexInColumn - this.size + 1
        : indexInColumn - columnIndex - this.size + 1
    }
    const getYCoordinate = (indexInColumn) => {
      return - columnIndex - getZCoordinate(indexInColumn)
    }

    const radius = this.radius;
    let innerPart = '';

    for (let i = 0; i < count; i++) {
      const hexCell = new Hexagon({radius, coordinates: {x: columnIndex, y: getYCoordinate(i), z: getZCoordinate(i)}})
      innerPart += hexCell.render();
      this.fieldTable.push(hexCell)
    }
    return `<div class="field__column" style="margin-left:${radius / 2}px">${innerPart}</div>`
  }

  _createTemplate() {
    let result = '';

    for (let i = 0; i < this.tableSize; i++) {
      const calculatedCount =  this.tableSize - Math.abs(this.size - 1 - i);
      result += this._createColumnTemplate(calculatedCount, i - this.size + 1);
    }

    return result;
  }

  render() {
    this.$el.innerHTML = this._createTemplate();
  }
}
