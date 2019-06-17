const HTMLElement = window.HTMLElement

export function getCurrentScrollPosition () {
  if (!isNaN(window.pageYOffset)) {
    return window.pageYOffset
  }

  if (document.documentElement && !isNaN(document.documentElement.scrollTop)) {
    return document.documentElement.scrollTop
  }

  if (document.body && !isNaN(document.body.scrollTop)) {
    return document.body.scrollTop
  }

  throw new Error('[getCurrentScrollPosition] cannot determine your current scroll position into the DOM')
}

export function extractTargetIdFromElementHref (element) {
  if (!element) {
    throw new Error(`[extractTargetIdFromElementHref] the element is not defined, got ${element}`)
  }
  if (!(element instanceof HTMLElement)) {
    throw new Error(`[extractTargetIdFromElementHref] the element is not a DOM element, got type: ${typeof element}`)
  }
  return element.hash.substr(1)
}

export function throttle (func, wait, leading, trailing, context) {
  let ctx = null
  let args = null
  let previous = null
  let timeout = null
  let result = null
  const later = () => {
    previous = new Date()
    timeout = null
    result = func.apply(ctx, args)
  }

  if (!func || typeof func !== 'function') {
    throw new Error(`[throttle] the first argument has to be a function, got ${typeof func}`)
  }
  if (!wait && !isNaN(wait)) {
    throw new Error(`[throttle] the wait argument has to be an integer, got ${typeof wait}`)
  }

  return function () {
    const now = new Date()
    if (!previous && !leading) previous = now
    const remainingTime = wait - (now - previous)
    ctx = context || this
    args = arguments
    if (remainingTime <= 0) {
      clearTimeout(timeout)
      timeout = null
      previous = now
      result = func.apply(ctx, args)
    }
    if (!timeout && trailing) {
      timeout = setTimeout(later, remainingTime)
    }

    return result
  }
}
