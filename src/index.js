import './styles.less'
import {Field} from '@/Field'
import {Keyboard} from  '@/Keyboard';
import {Server} from "@/Server"

const fieldElement = document.getElementById('field')
const serverUrl = 'https://68f02c80-3bed-4e10-a747-4ff774ae905a.pub.instances.scw.cloud/2';
const field = new Field(fieldElement, 4, 50)
const keyboard = new Keyboard();
const server = new Server(serverUrl);


keyboard.onKeyDown('KeyQ', () => console.log('key Q pressed'))
keyboard.onKeyDown('KeyW', () => console.log('key W pressed'))
keyboard.onKeyDown('KeyE', () => console.log('key E pressed'))

server.getData();

field.render();

window.field = field;

