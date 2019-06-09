const Event = window.Event
const body = document.body

export function _getCurrentPosition () {
  if (!isNaN(window.pageYOffset)) {
    return window.pageYOffset
  }

  if (document.documentElement && !isNaN(document.documentElement.scrollTop)) {
    return document.documentElement.scrollTop
  }

  if (document.body && !isNaN(document.body.scrollTop)) {
    return document.body.scrollTop
  }

  throw new Error('[_getCurrentPosition] cannot determine your current scroll position into the DOM')
}

export function _exractTargetFromEvent (event) {
  if (!(event instanceof Event)) {
    throw new Error(`[_exractTargetFromEvent] the parameter is not an instance of an Event, got ${event}`)
  }

  const extractedTarget = event.target.hash.substr(1)

  if (!extractedTarget) {
    throw new Error('[_exractTargetFromEvent] cannot retrieve the target from the event')
  }

  return extractedTarget
}

export function _getTargetPosition (targetId) {
  if (!targetId || typeof targetId !== 'string') {
    throw new Error(`[_getTargetPosition] the target have to be a string, got ${typeof targetID} type`)
  }

  const targetHtmlElement = document.getElementById(targetId)

  if (!targetHtmlElement) {
    throw new Error('[_getTargetPosition] cannot find your target element in the DOM')
  }

  return targetHtmlElement.offsetTop
}

export function smoothScroll (event, animationType, animationDuration) {
  if (!event || !animationType || !animationDuration) {
    throw new Error(`[smoothScroll] wrong parameter, one of your parameter is undefined, got event=${event}, animationType=${animationType}, animationDuration=${animationDuration}`)
  }

  const currentPositionInTheDOM = _getCurrentPosition()
  const targetElementId = _exractTargetFromEvent(event)
  const targetElementPosition = _getTargetPosition(targetElementId)

  let translation = -(targetElementPosition - currentPositionInTheDOM)

  // manage the case the translation will exceed the bottom of the body element
  const targetHtmlElement = document.getElementById(targetElementId)

  if (targetElementPosition + targetHtmlElement.clientHeight >= document.body.scrollHeight) {
    translation += targetHtmlElement.clientHeight / 2.5
  }

  body.style.transition = `transform ${animationDuration}ms ${animationType}`
  body.style.transform = `translate(0, ${translation}px)`

  window.setTimeout(function () {
    body.style.cssText = ''
    window.scrollTo(0, targetElementPosition)
  }, animationDuration)

  event.preventDefault()
}
