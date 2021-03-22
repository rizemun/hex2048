import './styles.less'
import {Field} from '@/Field'
import {Keyboard} from  '@/Keyboard';
import {Server} from "@/Server"

const fieldElement = document.getElementById('field')
const serverUrl = 'https://68f02c80-3bed-4e10-a747-4ff774ae905a.pub.instances.scw.cloud/2';
const field = new Field(fieldElement, 2, 50)
const keyboard = new Keyboard();
const server = new Server(serverUrl);




keyboard.onKeyDown('KeyQ', () => {field.makeStep('north-west');console.log(field.dataToSend);})
keyboard.onKeyDown('KeyW', () => {field.makeStep('north');server.getData(field.dataToSend)})
keyboard.onKeyDown('KeyE', () => {field.makeStep('north-east');server.getData(field.dataToSend)})
keyboard.onKeyDown('KeyA', () => {field.makeStep('south-west');server.getData(field.dataToSend)})
keyboard.onKeyDown('KeyS', () => {field.makeStep('south');server.getData(field.dataToSend)})
keyboard.onKeyDown('KeyD', () => {field.makeStep('south-east');server.getData(field.dataToSend)})


server.getData();
field.render();
field.updateAllNeighbours();

console.log(field.table);
console.log(field.allHexagons);

