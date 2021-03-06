import '../css/main.css'

import { write404ErrorToFakeConsole } from './fake-console'

// Scripts for 404.html

console.info('*****************************************')
console.info('* ColorSpace Developer Portfolio / 404  *')
console.info('*****************************************')

const textFor404Page = [
  '\t\t\t_\t\t_\t\t\t\t___\t\t_\t\t_\t\t\t',
  '\t\t|\t||\t|\t\t/\t_\t\\|\t||\t|\t\t',
  '\t\t|\t||\t|_|\t|\t|\t|\t||\t|_\t',
  '\t\t|__\t\t\t_|\t|\t|\t|__\t\t\t_|',
  '\t\t\t\t\t|\t|\t|\t|_|\t|\t\t|\t|\t\t',
  '\t\t\t\t|_|\t\t\\___/\t\t\t|_|\t',
  '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t_\t\t\t\t\t\t\t\t\t\t\t\t',
  '._\t\t_.\t_\t\t_\t\t._\t\t__|_\t_|__\t\t\t\t._\t\t_|\t',
  '|_)(_|(_|(/_\t|\t|(_)|_\t\t|(_)|_||\t|(_|\t',
  '\t|\t\t\t\t\t\t_|\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t'
]

write404ErrorToFakeConsole('fake-console', textFor404Page, 1)

const header = document.getElementsByClassName('header')[0]
header.addEventListener('click', () => { window.location.href = './index.html' })
