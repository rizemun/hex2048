import {Hexagon} from "@/Hexagon"

const DIRECTIONS = {
  north: 'north',
  northEast: 'north-east',
  northWest: 'north-west',
  south: 'south',
  southEast: 'south-east',
  southWest: 'south-west'
}

export class Field {
  constructor($el, size, radius) {
    this.$el = $el;
    this.reinit(size, radius);
  }

  reinit(size, radius) {
    this.size = size;
    this.tableSize = size * 2 - 1;
    this.radius = radius;
    this.table = {}
    this.allHexagons = [];
    this._bindEvents();
    this._addStyles();
    this.render();
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
      this.table[x][y][z].$el.dataset.value = cell.value
    })

    if(this.isGameOver()) {
      const event = new CustomEvent("game:end",{});
      document.dispatchEvent(event);
    }
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
      {x: x + 1, y: y - 1, z, direction: DIRECTIONS.southEast},
      {x: x - 1, y: y + 1, z, direction: DIRECTIONS.northWest},
      {x, y: y + 1, z: z - 1, direction: DIRECTIONS.north},
      {x, y: y - 1, z: z + 1, direction: DIRECTIONS.south},
      {x: x + 1, y, z: z - 1, direction: DIRECTIONS.northEast},
      {x: x - 1, y, z: z + 1, direction: DIRECTIONS.southWest}
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
    this.$el.innerHTML = '';
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
      'north-west': DIRECTIONS.southEast,
      'north': DIRECTIONS.south,
      'north-east': DIRECTIONS.southWest,
      'south-west': DIRECTIONS.northEast,
      'south': DIRECTIONS.north,
      'south-east': DIRECTIONS.northWest,
    }

    return opposiziteDirections[direction]
  }

  makeStep(direction) {
    if(this.isMoving) {
      return
    }

    this.isMoving = true;
    const sources = this._getMovementSource(direction)
    let isMoved = false

    this.allHexagons.forEach(cell => {
      cell.oldValue = cell.value;
    })

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
          currentCell.$el.dataset.value = 0;
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
      const calculated = arrForLogic.reduce((acc, number) => {
        if (acc[acc.length - 1] === number) {
          acc[acc.length - 1] = number * 2;
        } else {
          acc.push(number)
        }

        return acc;
      }, [])

      cell.numbersToUse = [];
      cell.calcuatedRow = calculated;

      const oppDirection = this._getOpposizeDirection(direction);
      cell.calcuatedRow.forEach((number, i) => {
        let cellToUpdate = cell;

        for (let j = 0; j < i; j++) {
          cellToUpdate = cellToUpdate.neighbours[oppDirection]
        }

        //todo: possible bug! sometimes cellToUpdate is undefined
        if(!cellToUpdate) {
          return
        }

        cellToUpdate.value = number;
        cellToUpdate.$el.dataset.value = number;
      })
      cell.calcuatedRow = [];
    })

    this.allHexagons.forEach(cell => {
      if(cell.oldValue !== cell.value) {
        isMoved = true;
      }
    })

    this.isMoving = false;
    return isMoved
  }

  isGameOver() {
    const directionsToCheck = [
      DIRECTIONS.northWest,
      DIRECTIONS.north,
      DIRECTIONS.northEast
    ]

    let isOver = true

    directionsToCheck.forEach(direction => {
      const sources = this._getMovementSource(direction);
      let oldCell = '';
      sources.forEach(cell => {
        let currentValue = 0;
        let currentCell = cell;
        let needToStopGoingNeighbours = false;
        do {
          if(currentValue === currentCell.value) {
            isOver = false;
          }
          if(currentCell.value === 0) {
            isOver = false;
          }
          currentValue = currentCell.value;

          if(!currentCell.neighbours[direction]) {
            needToStopGoingNeighbours = true;
          }

          oldCell = currentCell;
          currentCell = currentCell.neighbours[direction]
        } while (!needToStopGoingNeighbours)
      })
    })

    return isOver
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
