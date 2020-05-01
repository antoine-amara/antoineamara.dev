import '../css/main.css'

import { write404ErrorToFakeConsole } from './fake-console'

// Scripts for 404.html

console.info('*****************************************')
console.info('* ColorSpace Developer Portfolio / 404  *')
console.info('*****************************************')

const textFor404Page = [
  'John Doe Subsystem --- Linux Kernel 4.x --- GNU GPL v3 Licence',
  'Searching...',
  '404 - Page Not Found',
  'Kernel Panic',
  'Don t panic and go to the home page'
]

write404ErrorToFakeConsole('fake-console', textFor404Page)
