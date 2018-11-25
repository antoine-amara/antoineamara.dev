console.info('hello menu')
const menu = document.getElementsByClassName('mobile-menu__bars')[0]
const menuOverlay = document.getElementsByClassName('mobile-menu__overlay')[0]
const menuElements = Array.from(
  document.getElementsByClassName('mobile-menu__element')
)

const activeClassModifier = 'mobile-menu__element--active'
// the inactive elements have a blur effect
const inactiveClassModifier = 'mobile-menu__element--blur'

// click event to open the menu and display the content.
menu.addEventListener('click', evt => {
  menu.classList.toggle('mobile-menu__bars--open')
  menuOverlay.classList.toggle('mobile-menu__overlay--open')
})
// click event to change the active element from the menu.
menuElements.map(element =>
  element.addEventListener('click', _onMobileMenuElementClickEvent)
)

function _onMobileMenuElementClickEvent (event) {
  const { target } = event

  menuElements.map(
    element =>
      element.className.includes(activeClassModifier)
        ? element.classList.toggle(activeClassModifier) ||
          element.classList.toggle(inactiveClassModifier)
        : null
  )
  target.classList.toggle(inactiveClassModifier)
  target.classList.toggle(activeClassModifier)
}
