import { getCurrentScrollPosition, extractTargetIdFromElementHref, throttle } from '../utils'

describe('Utils module: reusable and generic function for javascript modules', () => {
  describe('getCurrentScrollPosition', () => {
    let currentPosition = 100
    const fakeScrollTo = (coordX, coordY) => {
      window.pageXOffset = coordX
      window.pageYOffset = coordY
      document.documentElement.scrollTop = coordY
      document.body.scrollTop = coordY
    }
    beforeEach(() => {
      window.scrollTo = jest.fn(fakeScrollTo)
      window.scrollTo(0, 100)
    })

    test('it should be defined', () => expect(getCurrentScrollPosition).toBeDefined())
    test('it should be a function', () => expect(typeof getCurrentScrollPosition).toBe('function'))
    test('it should throw an error if none of the javascript function return a result', () => {

      expect(() => getCurrentScrollPosition()).not.toThrow()

      window.pageYOffset = undefined
      document.documentElement.scrollTop = undefined
      document.body.scrollTop = undefined

      expect(() => getCurrentScrollPosition()).toThrow()
    })
    test('it should return the current scroll position and find it with all possible javascript functions', () => {
      expect(getCurrentScrollPosition()).toBe(currentPosition)

      window.pageYOffset = undefined

      expect(getCurrentScrollPosition()).toBe(currentPosition)

      document.documentElement.scrollTop = undefined

      expect(getCurrentScrollPosition()).toBe(currentPosition)
    })

    test('it should return the value even if the scroll is at the top (current position to 0)', () => {
      window.scrollTo(0, 0)

      expect(getCurrentScrollPosition()).toBe(0)
    })
  })

  describe('extractTargetIdFromElementHref', () => {
    test('it should be defined', () => expect(extractTargetIdFromElementHref).toBeDefined())
    test('it should be a function', () => expect(typeof extractTargetIdFromElementHref).toBe('function'))
    test('it should throw an error if the element is not a DOM element', () => {
      const domElement = document.createElement('A')
      domElement.setAttribute('href', '#anId')

      expect(() => extractTargetIdFromElementHref(undefined)).toThrow()
      expect(() => extractTargetIdFromElementHref('hello there !')).toThrow()
      expect(() => extractTargetIdFromElementHref(domElement)).not.toThrow()
    })
    test('it should extract the anchor from the element and return the anchor id', () => {
      const domElement = document.createElement('A')
      domElement.setAttribute('href', '#anId')

      const elementId = extractTargetIdFromElementHref(domElement)
      expect(elementId).toEqual('anId')
    })
  })

  describe('throttle', () => {
    const fakeFunction = () => {
      console.info('Hello there !!')
      return 'General Kenobi!'
    }
    test('it should be defined', () => expect(throttle).toBeDefined())
    test('it should be a function', () => expect(typeof throttle).toBe('function'))
    test('it should throw an error if the first argument is not a function', () => {
      expect(() => throttle(undefined, 200)).toThrow()
      expect(() => throttle('Hello there !!', 200)).toThrow()
      expect(() => throttle(fakeFunction, 200)).not.toThrow()
    })
    test('it should return the throttled function', () => {
      const fakeThrottledFunction = throttle(fakeFunction, 200)

      expect(fakeThrottledFunction).toBeDefined()
      expect(typeof fakeThrottledFunction).toBe('function')
    })
    test('it should execute the function only one time per n second', () => {
      const fakeMockFunction = jest.fn()
      const waitFewMs = () => new Promise(resolve => setTimeout(() => resolve(), 32))
      const fakeThrottledFunction = throttle(fakeMockFunction, 32)

      fakeThrottledFunction()
      fakeThrottledFunction()
      fakeThrottledFunction()

      return waitFewMs()
        .then(() => {
          fakeThrottledFunction()
          expect(fakeMockFunction.mock.calls.length).toEqual(1)
        })
    })
  })
})
