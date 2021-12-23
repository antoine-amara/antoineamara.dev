import '../css/main.css'
import Menu from './menu'
import FullscreenPanel from './fullscreen-panel'
import { iconLoader, fetcher, loadConfigFile } from './utils'
import { renderMyWorkElements } from './renderer/my-work.render'
import { manageFakeShell } from './fake-console'
import { submitContactForm } from './contact-form'
import apiUrlsConfig from './config/api-urls.json'

const { history } = window

// Scripts for index.html page

let menu = null
let panels = null

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
  const contactSubmitButton = document.getElementsByClassName('submit-contact')[0]
  contactSubmitButton.addEventListener('click', submitContactForm)
}

function _initDesktopScripts () {
  if (menu) {
    menu.destroyListeners()
    menu = null
  }

  panels = new FullscreenPanel('website-content')
  panels.createAndInsertMenu('desktop-menu')

  /* manage contact form submission */
  const contactSubmitButton = document.getElementsByClassName('submit-contact')[0]
  contactSubmitButton.addEventListener('click', submitContactForm)

  // elements scrolling management
  const blogPostContainer = document.getElementsByClassName('blog-post__container')[0]
  blogPostContainer.addEventListener('wheel', (e) => { e.stopPropagation() })

  const projectsContainer = document.getElementsByClassName('projects')[0]
  projectsContainer.addEventListener('wheel', (e) => { e.stopPropagation() })

  // auto focus on fake console
  const fakeShellElement = document.getElementsByClassName('fake-terminal__commands')[0]
  fakeShellElement.focus()

  // fake shell scrolling management
  fakeShellElement.addEventListener('wheel', (e) => { e.stopPropagation() })

  // avoid browser auto scroll on refresh
  history.scrollRestoration = 'manual'
}

const desktopMediaQuery = window.matchMedia('(min-width: 992px)')
_onMediaChange(desktopMediaQuery)
desktopMediaQuery.addListener(_onMediaChange)

// manage the fake shell for about-me section
manageFakeShell('fake-terminal__commands')

async function loadAsyncContents () {
  const apiUrls = await loadConfigFile(apiUrlsConfig)

  // manage my work loader
  iconLoader(
    'my-work',
    {
      render: renderMyWorkElements,
      message: 'loading content from github.',
      errorMessage: 'Cannot retrieve the content, click on the logo to see my projects on github.',
      errorOnClick: () => { window.open(MY_GITHUB_PROFILE_URL, '_blank') }
    },
    {
      fetcher,
      apiUrl: apiUrls.get_github_profile_https_url
    }
  )
}

loadAsyncContents()
