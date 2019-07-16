import { throttle } from './utils'

export default class FullscreenPanel {
  constructor (containerClassname) {
    this.SCROLL_DIRECTIONS = {
      up: 'up',
      down: 'down'
    }
    this.scrollInProgress = false
    this.currentPanelIndex = 1

    this.containerClassname = containerClassname
    const container = document.getElementsByClassName(containerClassname)[0]
    container.style.transform = 'translateY(0)'

    this.totalNumberOfPanels = document.querySelectorAll('section').length
    this.hasMenu = false

    this.createAndInsertMenu = this.createAndInsertMenu.bind(this)
    this._updateMenuOnScroll = this._updateMenuOnScroll.bind(this)
    this._determineScrollDirection = this._determineScrollDirection.bind(this)
    this._onScroll = this._onScroll.bind(this)
    this._onClickMenu = this._onClickMenu.bind(this)
    this._scroll = this._scroll.bind(this)
    this.destroyListeners = this.destroyListeners.bind(this)

    container.addEventListener('wheel', throttle(this._onScroll, 1000))
  }

  createAndInsertMenu (menuClassName) {
    const sections = Array.from(document.querySelectorAll('section'))
    const menuContainer = document.getElementsByClassName(menuClassName)[0]

    if (!sections.length) throw new Error('[createAndInsertMenu] cannot find website sections, cannot create the menu')
    if (!menuContainer) throw new Error(`[createAndInsertMenu] cannot find the menu container element, try to retrieve element with classname: ${menuClassName}`)

    sections.forEach((section, index) => {
      const menuItem = document.createElement('DIV')
      menuItem.classList.toggle('desktop-menu__item')
      menuItem.setAttribute('title', section.getAttribute('name'))
      if (index === 0) {
        menuItem.classList.toggle('desktop-menu__item--active')
        sections[index].isActive = !sections[index].isActive
      }
      menuItem.addEventListener('click', this._onClickMenu)
      menuContainer.appendChild(menuItem)
    })

    this.hasMenu = true
  }

  _updateMenuOnScroll (nbPanelToScroll, scrollDirection) {
    const menuElements = document.getElementsByClassName('desktop-menu__item')
    const elementIndex = this.currentPanelIndex - 1
    if (!nbPanelToScroll || nbPanelToScroll < 1 || nbPanelToScroll > this.totalNumberOfPanels) {
      throw new Error(`[_updateMenuOnScroll] the number of panel to scroll has to be between 1 and ${this.totalNumberOfPanels}, got ${nbPanelToScroll}`)
    }
    if (!scrollDirection || (scrollDirection !== this.SCROLL_DIRECTIONS.down && scrollDirection !== this.SCROLL_DIRECTIONS.up)) {
      throw new Error(`[_scroll] invalid scroll direction, it can be ${this.SCROLL_DIRECTIONS.up} or ${this.SCROLL_DIRECTIONS.down}, got ${scrollDirection}`)
    }
    if (!menuElements.length) {
      throw new Error('[_updateMenuOnScroll] cannot find the menu elements')
    }

    const newActiveElement = scrollDirection === this.SCROLL_DIRECTIONS.down
      ? menuElements[elementIndex - nbPanelToScroll]
      : menuElements[elementIndex + nbPanelToScroll]
    const currentActiveElement = menuElements[elementIndex]

    newActiveElement.classList.toggle('desktop-menu__item--active')
    currentActiveElement.classList.toggle('desktop-menu__item--active')
  }

  _determineScrollDirection (deltaY) {
    if (isNaN(deltaY)) throw new Error(`[_determineScrollDirection] the parameter has to be a number, got ${deltaY}`)

    return deltaY < 0 ? this.SCROLL_DIRECTIONS.up : this.SCROLL_DIRECTIONS.down
  }

  _onScroll (event) {
    const { deltaY } = event
    const scrollDirection = this._determineScrollDirection(deltaY)
    event.stopPropagation()
    this._scroll(1, scrollDirection)
  }

  _onClickMenu (event) {
    const menuElements = Array.from(document.getElementsByClassName('desktop-menu__item'))
    const sections = document.querySelectorAll('section')
    const indexTargetElement = menuElements.indexOf(event.currentTarget)
    const elementIndex = this.currentPanelIndex - 1
    let direction = this.SCROLL_DIRECTIONS.down

    if (!menuElements.length) {
      throw new Error('[_onClickMenu] cannot find the menu elements')
    }
    if (!sections.length) {
      throw new Error('[_onClickMenu] cannot find website sectons')
    }
    if (indexTargetElement < 0) {
      throw new Error('[_onClickMenu] cannot find the clicked target element')
    }
    if (indexTargetElement === elementIndex) return

    const nbScrollToDo = indexTargetElement - elementIndex

    nbScrollToDo < 0 ? direction = this.SCROLL_DIRECTIONS.up : direction = this.SCROLL_DIRECTIONS.down

    this._scroll(Math.abs(nbScrollToDo), direction)
  }

  _scroll (nbPanelToScroll, scrollDirection = this.SCROLL_DIRECTIONS.up) {
    const currentPanel = document.getElementsByClassName(this.containerClassname)[0]

    if (!currentPanel) throw new Error(`[_scroll] cannot retrieve the current panel from the DOM, got currentPanel = ${currentPanel}`)
    if (scrollDirection !== this.SCROLL_DIRECTIONS.up && scrollDirection !== this.SCROLL_DIRECTIONS.down) {
      throw new Error(`[_scroll] invalid scroll direction, it can be ${this.SCROLL_DIRECTIONS.up} or ${this.SCROLL_DIRECTIONS.down}, got ${scrollDirection}`)
    }
    if (typeof nbPanelToScroll !== 'number') throw new Error(`[_scroll] the nbPanelToScroll has to be a number, got ${typeof nbPanelToScroll}`)

    let scrollSize = parseInt(currentPanel.style.transform.replace('translateY(', ''))
    const scrollValue = 100 * nbPanelToScroll

    if (
      (scrollDirection === this.SCROLL_DIRECTIONS.down && this.currentPanelIndex >= this.totalNumberOfPanels) ||
      (scrollDirection === this.SCROLL_DIRECTIONS.up && this.currentPanelIndex <= 1)
    ) {
      return
    }

    scrollDirection === this.SCROLL_DIRECTIONS.down
      ? scrollSize = scrollSize - scrollValue
      : scrollSize = scrollSize + scrollValue

    if (!this.scrollInProgress) {
      this.scrollInProgress = true
      currentPanel.style.transform = `translateY(${scrollSize}vh)`
      scrollDirection === this.SCROLL_DIRECTIONS.down
        ? this.currentPanelIndex += nbPanelToScroll
        : this.currentPanelIndex -= nbPanelToScroll

      if (this.hasMenu) this._updateMenuOnScroll(nbPanelToScroll, scrollDirection)
      setTimeout(() => { this.scrollInProgress = false }, 1000)
    }
  }

  destroyListeners () {
    const container = document.getElementsByClassName(this.containerClassname)[0]
    container.removeEventListener('wheel', this._onScroll)
  }
}
