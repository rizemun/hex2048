import {Hexagon} from "@/Hexagon"

export class Field {
  constructor($el, size, radius) {
    this.$el = $el;
    this.size = size;
    this.tableSize = size * 2 - 1;
    this.radius = radius;
    this.table = {}
    this._bindEvents();
    this._addStyles();
  }

  _bindEvents() {
    this._onServerResponse = this._onServerResponse.bind(this)
    document.removeEventListener('serverResponse', this._onServerResponse);
    document.addEventListener('serverResponse', this._onServerResponse)
  }

  _onServerResponse(ev) {
    const response = ev.detail;

    response.forEach(cell => {
      const {x, y, z} = convertCoordinatesToStrings(cell);
      this.table[x][y][z].drawText(cell.value)
    })
  }

  _cellExist({x, y, z}) {
    return fieldExistInObject(this.table, x)
      && fieldExistInObject(this.table[x], y)
      && fieldExistInObject(this.table[x][y], z)
  }

  _addCell({x, y, z}) {
    if (!fieldExistInObject(this.table, x)) {
      this.table[x] = {};
    }
    if (!fieldExistInObject(this.table[x], y)) {
      this.table[x][y] = {};
    }
    if (!fieldExistInObject(this.table[x][y], z)) {
      this.table[x][y][z] = '';
    }
  }

  _saveCell(data, coordinates) {
    let {x, y, z} = coordinates;

    if (!this._cellExist(coordinates)) {
      this._addCell(coordinates)
    }
    this.table[x][y][z] = data;
  }

  _getCell({x, y, z}) {
    return this.table[x][y][z]
  }

  _findNeighbours(coordinates) {
    const {x, y, z} = convertCoordinatesToNumbers(coordinates)
    const neigboursCoorinates = [
      {x: x + 1, y: y - 1, z, direction: 'south-east'},
      {x: x - 1, y: y + 1, z, direction: 'north-west'},
      {x, y: y + 1, z: z - 1, direction: 'north'},
      {x, y: y - 1, z: z + 1, direction: 'south'},
      {x: x + 1, y, z: z - 1, direction: 'north-east'},
      {x: x - 1, y, z: z + 1, direction: 'south-west'}
    ];

    return neigboursCoorinates
      .filter(this._cellExist.bind(this))
      .reduce((acc, coords) => {
        acc[coords.direction] = this._getCell(coords);
        return acc
      }, {})
  }

  _updateNeighbours(coordinates) {
    this._getCell(coordinates).neighbours = this._findNeighbours(coordinates)
  }

  _calcHexSizes() {
    this.innerRadius = Math.sqrt(3) / 2 * this.radius;
    return {
      tallerSize: this.radius,
      widerSize: 2 * this.innerRadius,
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
    const style = `.field__column {margin-left: ${this.radius / 2}px;}.hexagon_outer {width: ${hexSizes.tallerSize}px;height: ${hexSizes.widerSize}px;}`

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

  updateAllNeighbours() {
    for (let x in this.table) {
      const listX = this.table[x];
      for (let y in listX) {
        const listY = listX[y];
        for (let z in listY) {
          this._updateNeighbours({x, y, z})
        }
      }
    }
  }
}

function fieldExistInObject(obj, field) {
  return !!obj[field];
}

function convertCoordinatesToNumbers(coordinates) {
  return {
    x: Number(coordinates.x),
    y: Number(coordinates.y),
    z: Number(coordinates.z)
  }
}

function convertCoordinatesToStrings(coordinates) {
  return {
    x: String(coordinates.x),
    y: String(coordinates.y),
    z: String(coordinates.z)
  }
}
