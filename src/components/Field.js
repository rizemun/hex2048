import {Hexagon} from "@/Hexagon"

export class Field {
  constructor($el, size, radius) {
    this.$el = $el;
    this.size = size;
    this.tableSize = size * 2 - 1;
    this.radius = radius;
    this.fieldTable = {}

    this._addStyles();
  }

  _saveCell(data, {x, y, z}) {
    function exist(obj, field) {
      return !!obj[field];
    }

    if (!exist(this.fieldTable, x)) {
      this.fieldTable[x] = {};
    }
    if (!exist(this.fieldTable[x], y)) {
      this.fieldTable[x][y] = {};
    }
    if (!exist(this.fieldTable[x][y], z)) {
      this.fieldTable[x][y][z] = '';
    }

    this.fieldTable[x][y][z] = data;
  }

  _calcHexSizes() {
    this.innerRadius = Math.sqrt(3) / 2 * this.radius;
    return {
      tallerSize: this.radius,
      widerSize:  2 * this.innerRadius,
    }
  }

  _createColumnTemplate(count, columnIndex) {
    const getZCoordinate = (indexInColumn) => {
      return columnIndex > 0
        ? indexInColumn - this.size + 1
        : indexInColumn - columnIndex - this.size + 1
    }
    const getYCoordinate = (indexInColumn) => {
      return -columnIndex - getZCoordinate(indexInColumn)
    }

    const radius = this.radius;
    const $column = document.createElement('div');

    $column.classList.add('field__column');
    for (let i = 0; i < count; i++) {
      const coordinates = {x: columnIndex, y: getYCoordinate(i), z: getZCoordinate(i)};
      const hexCell = new Hexagon({radius, coordinates})

      $column.append(hexCell.render());
      this._saveCell(hexCell, coordinates)
    }

    return $column
  }

  _addStyles() {
    const existStyle = document.getElementById('field-styles');
    const hexSizes = this._calcHexSizes();
    const style = `.field__column {margin-left: ${this.radius/2}px;}.hexagon_outer {width: ${hexSizes.tallerSize}px;height: ${hexSizes.widerSize}px;}`

    if (existStyle) {
      existStyle.innerText = style;
    } else {
      const newStyle = document.createElement('style')
      newStyle.id = 'field-styles';
      newStyle.innerText = style;
      document.head.append(newStyle);
    }
  }

  render() {
    for (let i = 0; i < this.tableSize; i++) {
      const calculatedCount = this.tableSize - Math.abs(this.size - 1 - i);
      this.$el.append(this._createColumnTemplate(calculatedCount, i - this.size + 1));
    }
  }
}