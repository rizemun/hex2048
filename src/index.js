import './styles.less'
import {Field} from '@/Field'
import {Keyboard} from  '@/Keyboard';
import {Server} from "@/Server"

const fieldElement = document.getElementById('field')
let serverUrl = document.getElementById('url-server').value;
let field = {};
const keyboard = new Keyboard();
let cellCount = 0;
const $range = document.getElementById('count-range')
const $buttons = document.querySelectorAll('[data-count-button]')
const $status = document.querySelector('[data-status]')

if(window.location.hash) {
  switch(window.location.hash) {
    case '#test2': {
      cellCount = 2;
      break;
    }
    case '#test3': {
      cellCount = 3;
      break;
    }
    case '#test4': {
      cellCount = 4;
      break;
    }
  }
} else {
  cellCount = 2;
}

$range.value = cellCount;
field = new Field(fieldElement, cellCount, calcCellSize(cellCount))

const server = new Server(serverUrl, cellCount);


keyboard.onKeyDown('KeyQ', () => {field.makeStep('north-west') && server.getData(field.dataToSend);})
keyboard.onKeyDown('KeyW', () => {field.makeStep('north')&& server.getData(field.dataToSend)})
keyboard.onKeyDown('KeyE', () => {field.makeStep('north-east') && server.getData(field.dataToSend)})
keyboard.onKeyDown('KeyA', () => {field.makeStep('south-west') && server.getData(field.dataToSend)})
keyboard.onKeyDown('KeyS', () => {field.makeStep('south') && server.getData(field.dataToSend)})
keyboard.onKeyDown('KeyD', () => {field.makeStep('south-east') && server.getData(field.dataToSend)})

//for tests correct launch
setTimeout(() => {server.getData()}, 200);
field.updateAllNeighbours();

document.addEventListener('game:end', () => {
  document.querySelector('[data-status]').dataset['status'] = 'game-over';
  document.querySelector('[data-status]').innerText = 'game-over';
})

document
  .getElementById('url-server')
  .addEventListener('change', (ev) => {
    server.setUrl(ev.target.value);
  })


function globalReinit(count) {
  field.reinit(count, calcCellSize(count))
  field.updateAllNeighbours();
  server.setFieldSize(count);
  server.getData();
  $status.dataset['status'] = 'playing';
  $status.innerText = 'playing';
}

function calcCellSize(count) {
  const maxFieldHeight = window.innerHeight;
  const maxCellheight = 100;
  const realCount = count * 2 - 1

  return Math.min(maxCellheight, maxFieldHeight/realCount/2)
}

$range.addEventListener('input', (ev) => {
  let count = ev.target.value;
  globalReinit(count)
})

$buttons.forEach(button => {
  button.addEventListener('click', (ev) => {
    const count = ev.target.dataset.countButton;
    globalReinit(count);
    $range.value = count;
  })
})
