import '../css/main.css'
import Menu from './menu'
import FullscreenPanel from './fullscreen-panel'
import { iconLoader, fetcher } from './utils'
import { renderMyWorkElements } from './renderer/my-work.render'

// Scripts for index.html page

let menu = null
let panels = null

const GET_GITHUB_PROFILE_URL = 'https://north-fr-antoinedev.cloudfunction.localhost/github-profile'
const MY_GITHUB_PROFILE_URL = 'https://github.com/antoine-amara'

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

  // stop wheel event when scrolling the project card content.
  const cards = document.getElementsByClassName('project-card__description')
  Array.from(cards).forEach(card => card.addEventListener('wheel', event => event.stopPropagation()))

  panels = new FullscreenPanel('website-content')
  panels.createAndInsertMenu('desktop-menu')

  /* manage contact form submission */
  const contactSubmitButton = document.getElementsByClassName('button')[0]
  contactSubmitButton.addEventListener('click', e => e.preventDefault())
}

const desktopMediaQuery = window.matchMedia('(min-width: 992px)')
_onMediaChange(desktopMediaQuery)
desktopMediaQuery.addListener(_onMediaChange)

// manage my work loader
iconLoader(
  'my-work',
  {
    render: renderMyWorkElements,
    message: 'loading content from github.',
    errorMessage: 'Cannot retrieve the content, click on the logo to see my projects on github.',
    errorOnClick: () => { window.open(MY_GITHUB_PROFILE_URL, '_black') }
  },
  {
    fetcher,
    apiUrl: GET_GITHUB_PROFILE_URL
  }
)
