import '../css/main.css'
import Menu from './menu'
import FullscreenPanel from './fullscreen-panel'

// Scripts for index.html page

let menu = null
let panels = null

console.info('**********************************************')
console.info('* Welcome to ColorSpace Developer Portfolio  *')
console.info('**********************************************')

function _onMediaChange (desktopMediaQuery) {
  !desktopMediaQuery.matches
    ? _initMobileScripts()
    : _initDesktopScripts()
}

function _initMobileScripts () {
  if (panels) {
    panels.destroyListeners()
    panels = null
  }

  /* init menu */
  menu = new Menu()
  menu.setEventListener(true)

  /* manage contact form submission */
  const contactSubmitButton = document.getElementsByClassName('button')[0]
  contactSubmitButton.addEventListener('click', e => e.preventDefault())
}

function _initDesktopScripts () {
  if (menu) {
    menu.destroyListeners()
    menu = null
  }

  panels = new FullscreenPanel('website-content')
  panels.createAndInsertMenu('desktop-menu')

  /* manage contact form submission */
  const contactSubmitButton = document.getElementsByClassName('button')[0]
  contactSubmitButton.addEventListener('click', e => e.preventDefault())
}

const desktopMediaQuery = window.matchMedia('(min-width: 992px)')
_onMediaChange(desktopMediaQuery)
desktopMediaQuery.addListener(_onMediaChange)
