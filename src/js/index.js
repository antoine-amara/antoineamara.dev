import '../css/main.css'
// import './menu'
import { write404ErrorToFakeConsole } from './fake-console'

console.info('**********************************************')
console.info('* Welcome to ColorSpace Developer Portfolio *')
console.info('**********************************************')

// const contactSubmitButton = document.getElementsByClassName('button')[0]
// contactSubmitButton.addEventListener('click', e => e.preventDefault())

const textFor404Page = [
  'John Doe Subsystem --- Linux Kernel 4.x --- GNU GPL v3 Licence',
  'Searching...',
  '404 - Page Not Found',
  'Kernel Panic',
  'Don t panic and go to the home page'
]

write404ErrorToFakeConsole('fake-shell', textFor404Page)
