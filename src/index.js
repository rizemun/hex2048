import './styles.less'
import {Field} from '@/Field'
import {Server} from "@/Server"

const fieldElement = document.getElementById('field')
const serverUrl = 'https://68f02c80-3bed-4e10-a747-4ff774ae905a.pub.instances.scw.cloud/2';
const field = new Field(fieldElement, 4, 50)
const server = new Server(serverUrl);


server.getData();

field.render();

window.field = field;

