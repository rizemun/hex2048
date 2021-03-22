import {Hexagon} from "@/Hexagon"

export class Field {
  constructor($el, size, radius) {
    this.$el = $el;
    this.size = size;
    this.tableSize = size * 2 - 1;
    this.radius = radius;
    this.table = {}
    this.allHexagons = [];
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
      this.table[x][y][z].value = cell.value
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
      this.allHexagons.push(hexCell);
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

  _getMovementSource(direction) {
    const corner = this.size - 1;
    const sources = {
      'north-west': {
        x: corner,
        y: -corner
      },
      'north': {
        z: corner,
        y: -corner
      },
      'north-east': {
        x: -corner,
        z: corner
      },
      'south-west': {
        x: corner,
        z: -corner
      },
      'south': {
        y: corner,
        z: -corner
      },
      'south-east': {
        x: -corner,
        y: corner
      },
    }
    const cornerData = sources[direction]

    return this.allHexagons.filter(cell => {
      const coords = cell.coordinates;
      const {x, y, z} = cornerData;

      if (x && coords.x === x) {
        return true;
      }
      if (y && coords.y === y) {
        return true;
      }
      if (z && coords.z === z) {
        return true;
      }

      return false
    })
  }

  _getMovementDestination(direction) {
    const corner = this.size - 1;
    const destinations = {
      'north-west': {
        x: -corner,
        y: corner
      },
      'north': {
        z: -corner,
        y: corner
      },
      'north-east': {
        x: corner,
        z: -corner
      },
      'south-west': {
        x: -corner,
        z: corner
      },
      'south': {
        y: -corner,
        z: corner
      },
      'south-east': {
        x: corner,
        y: -corner
      },
    }
    const cornerData = destinations[direction]

    return this.allHexagons.filter(cell => {
      const coords = cell.coordinates;
      const {x, y, z} = cornerData;

      if (x && coords.x === x) {
        return true;
      }
      if (y && coords.y === y) {
        return true;
      }
      if (z && coords.z === z) {
        return true;
      }

      return false
    })
  }

  _getOpposizeDirection(direction) {
    const opposiziteDirections = {
      'north-west': 'south-east',
      'north': 'south',
      'north-east': 'south-west',
      'south-west': 'north-east',
      'south': 'north',
      'south-east': 'north-west',
    }

    return opposiziteDirections[direction]
  }

  makeStep(direction) {
    console.log({direction})
    const sources = this._getMovementSource(direction)

    sources.forEach(cell => {
      let currentCell = cell;
      let nextCell = currentCell.neighbours[direction];

      while (currentCell) {
        nextCell = currentCell.neighbours[direction];
        const value = currentCell.value;
        const numbersToUse = currentCell.numbersToUse;

        if (!value && !numbersToUse.length) {
          currentCell = nextCell
          if (!currentCell) {
            break
          }
          continue
        }

        if (nextCell) {
          nextCell.numbersToUse.push(...numbersToUse)
          if (value) {
            nextCell.numbersToUse.push(value);
          }
          currentCell.numbersToUse = [];
          currentCell.value = 0;
        } else {
          if (value) {
            currentCell.numbersToUse.push(value);
          }
        }
        currentCell = nextCell;


      }
    })


    const destinations = this._getMovementDestination(direction)
    destinations.forEach(cell => {

      if (!cell.numbersToUse.length) {
        return;
      }

      const arrForLogic = cell.numbersToUse.reverse();
      const calculated = arrForLogic.reduce((acc, number, index) => {
        if (acc[acc.length - 1] === number) {
          acc[acc.length - 1] = number * 2;
        } else {
          acc.push(number)
        }

        return acc;
      }, [])

      cell.numbersToUse = [];
      cell.calcuatedRow = calculated;

      console.log('%ccalculated: ', 'color: rebeccapurple; font-style: italic', calculated);

      const oppDirection = this._getOpposizeDirection(direction);
      // console.log({oppDirection})
      cell.calcuatedRow.forEach((number, i) => {
        let cellToUpdate = cell;

        for (let j = 0; j < i; j++) {
          cellToUpdate = cellToUpdate.neighbours[oppDirection]
        }

        if (!cellToUpdate) {
          console.log(cell)
          console.log(direction)
          console.log(calculated)
          debugger
        }

        cellToUpdate.value = number;
      })
      cell.calcuatedRow = [];


    })


  }

  get dataToSend() {
    return JSON.stringify(this.allHexagons
      .filter(cell => cell.value)
      .map(cell => {
        return {
          x: cell.coordinates.x,
          y: cell.coordinates.y,
          z: cell.coordinates.z,
          value: cell.value
        }

      })
    )
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
