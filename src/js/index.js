import '../css/main.css'
import Menu from './menu'

// Scripts for index.html page

console.info('**********************************************')
console.info('* Welcome to ColorSpace Developer Portfolio  *')
console.info('**********************************************')

/* init menu */
const menu = new Menu()
menu.setEventListener(true)

/* manage contact form submission */
const contactSubmitButton = document.getElementsByClassName('button')[0]
contactSubmitButton.addEventListener('click', e => e.preventDefault())
