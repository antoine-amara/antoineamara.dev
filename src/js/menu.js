import { smoothScroll } from './smooth-scroll'
import { getCurrentScrollPosition, throttle, extractTargetIdFromElementHref } from './utils'

const HTMLElement = window.HTMLElement

class Menu {
  constructor () {
    this.menu = document.getElementsByClassName('mobile-menu__bars')[0]
    this.overlay = document.getElementsByClassName('mobile-menu-overlay')[0]
    this.menuItems = Array.from(
      document.getElementsByClassName('mobile-menu-overlay__element')
    )
    this.activeClassModifier = 'mobile-menu-overlay__element--active'
    // the inactive elements have a blur effect
    this.inactiveClassModifier = 'mobile-menu-overlay__element--blur'

    if (!this.menu) throw new Error(`[menu] the menu element is not found, got ${this.menu}`)
    if (!this.overlay) throw new Error(`[menu] the overlay element is not found, got ${this.overlay}`)

    this.setEventListener = this.setEventListener.bind(this)
    this.destroyListeners = this.destroyListeners.bind(this)
    this._toogleMenu = this._toogleMenu.bind(this)
    this._determineMenuElementClickEvent = this._determineMenuElementClickEvent.bind(this)
    this._scrollChangeActiveElement = this._scrollChangeActiveElement.bind(this)
    this._throttledScrollChangeActiveElement = throttle(this._scrollChangeActiveElement, 500, false, true)
    this._onMobileMenuElementPageClickEvent = this._onMobileMenuElementPageClickEvent.bind(this)
    this._onMobileMenuElementAnchorClickEvent = this._onMobileMenuElementAnchorClickEvent.bind(this)
    this._extractAndUpdateActiveElement = this._extractAndUpdateActiveElement.bind(this)
    this._updateActiveElement = this._updateActiveElement.bind(this)
  }

  setEventListener (scrollUpdate = false) {
    if (!this.menuItems.length) {
      throw new Error('[setEventListener] cannot initialize your menu eventListener because it has 0 elements')
    }

    // click event to open the menu and display the content.
    this.menu.addEventListener('click', this._toogleMenu)
    if (scrollUpdate) document.addEventListener('scroll', this._throttledScrollChangeActiveElement)
    // click event to change the active element from the menu.
    this.menuItems.forEach(element => {
      const onCLickCallback = this._determineMenuElementClickEvent(element)
      element.addEventListener('click', onCLickCallback)
    })
  }

  destroyListeners () {
    document.removeEventListener('scroll', this._throttledScrollChangeActiveElement)
    this.menu.removeEventListener('click', this._toogleMenu)
    this.menuItems.forEach(item => {
      item.removeEventListener('click', this._onMobileMenuElementAnchorClickEvent)
      item.removeEventListener('click', this._onMobileMenuElementPageClickEvent)
    })
  }

  _toogleMenu () {
    this.menu.classList.toggle('mobile-menu__bars--open')
    this.overlay.classList.toggle('mobile-menu-overlay--open')
    document.body.classList.toggle('body--no-scroll')
  }

  _determineMenuElementClickEvent (element) {
    const menuHref = element.href.split('/')
    const menuTarget = menuHref[menuHref.length - 1]

    const htmlFileRegex = /[a-zA-Z0-9]+.html/
    const anchorRegex = /^#[a-z0-9]*$/
    const filenameWithanchorRegex = /[a-zA-Z0-9]+.html#[a-z0-9]*$/

    if (anchorRegex.test(menuTarget) || filenameWithanchorRegex.test(menuTarget)) {
      return this._onMobileMenuElementAnchorClickEvent
    }

    if (htmlFileRegex.test(menuTarget)) {
      return this._onMobileMenuElementPageClickEvent
    }

    throw new Error(`[_determineMenuElementClickEvent] invalid menu element href, it has to be an anchor or an html filepath, got ${menuHref}`)
  }

  _scrollChangeActiveElement () {
    let lastAnchorElement = null
    this.menuItems.forEach(element => {
      const currentScrollPosition = getCurrentScrollPosition()
      const targetId = extractTargetIdFromElementHref(element)

      // if the menu element is not an anchor, return
      if (targetId === '') return

      const domElement = document.getElementById(extractTargetIdFromElementHref(element))
      if (domElement) lastAnchorElement = element
      if (domElement && currentScrollPosition >= domElement.offsetTop && currentScrollPosition < domElement.offsetTop + domElement.clientHeight) {
        this._updateActiveElement(element)
      }

      // the last element will be triggered if scroll is at the bottom of the page to be sure it will be trigerred corectly
      if ((window.innerHeight + currentScrollPosition + 200) >= document.body.offsetHeight) {
        this._updateActiveElement(lastAnchorElement)
      }
    })
  }

  _onMobileMenuElementPageClickEvent (event) {
    const { target } = event

    this._extractAndUpdateActiveElement(event)

    setTimeout(() => {
      this._toogleMenu()
      window.location.href = target.href
    }, 900)
  }

  _onMobileMenuElementAnchorClickEvent (event) {
    this._extractAndUpdateActiveElement(event)

    setTimeout(() => {
      this._toogleMenu()
      smoothScroll(event, 'ease', 900)
    }, 900)
  }

  _extractAndUpdateActiveElement (event) {
    const { target } = event

    event.preventDefault()

    this._updateActiveElement(target)
  }

  _updateActiveElement (newElementActive) {
    if (!newElementActive || !(newElementActive instanceof HTMLElement)) {
      throw new Error(`[_updateActiveElement] the new active element has to be a DOM element, got ${typeof newElementActive}`)
    }
    this.menuItems.map(
      element =>
        element.className.includes(this.activeClassModifier) &&
          (element.classList.toggle(this.activeClassModifier) ||
          element.classList.toggle(this.inactiveClassModifier))
    )

    newElementActive.classList.toggle(this.inactiveClassModifier)
    newElementActive.classList.toggle(this.activeClassModifier)
  }
}

export default Menu
