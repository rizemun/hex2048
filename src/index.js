import './styles.less'
import {Field} from "@/Field"

const fieldElement = document.getElementById('field')
const field = new Field(fieldElement,4, 50)

field.render();
