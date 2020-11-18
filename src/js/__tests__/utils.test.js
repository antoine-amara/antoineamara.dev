/* eslint-disable */

import { getCurrentScrollPosition, extractTargetIdFromElementHref, throttle, iconLoader } from '../utils'

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

  describe('iconLoader', () => {
    beforeEach(() => {
      document.body.innerHTML = `<div class="elements-to-load icon-loader">
        <div class="icon-loader__container">
          <img inline src="src/img/github.svg">
          <div class="icon-loader__message"></div>
        </div>
      </div>`
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    const fakeRender = jest.fn(() => {
      const fakeContent = document.createElement('P');
      fakeContent.innerHTML = 'HELLO THERE!!!'

      return fakeContent
    })

    const fakeFetcher = jest.fn(() => new Promise((resolve) => setTimeout(() => resolve(), 100)))

    const defaultMessage = 'loading...'
    test('it should be defined', () => expect(iconLoader).toBeDefined())
    test('it should be a function', () => expect(typeof iconLoader).toBe('function'))
    test('it should throw an error if the selector parameter is undefined or an empty string', (done) => {
      expect(() => iconLoader(undefined)).toThrow()
      expect(() => iconLoader('')).toThrow()
      expect(() => iconLoader('elements-to-load', { render: fakeRender }, { fetcher: fakeFetcher, apiUrl: 'https://antoine.dev' }).then(() => done())).not.toThrow()
    })
    test('it should throw an error if the element to use to append the loader is not found into the DOM', (done) => {
      expect(() => iconLoader('fake-element')).toThrow()
      expect(() => iconLoader('elements-to-load', { render: fakeRender }, { fetcher: fakeFetcher, apiUrl: 'https://antoine.dev' }).then(() => done())).not.toThrow()
    })
    test('it should throw an error if the loaderOptions.render is not a function', (done) => {
      expect(() => iconLoader('elements-to-load', { render: undefined })).toThrow()
      expect(() => iconLoader('elements-to-load', { render: '42' })).toThrow()
      expect(() => iconLoader('elements-to-load', { render: 42 })).toThrow()
      expect(() => iconLoader('elements-to-load', { render: fakeRender }, { fetcher: fakeFetcher, apiUrl: 'https://antoine.dev' }).then(() => done())).not.toThrow()
    })
    test('it should throw an error if fetchOption.fetcher is not a function', (done) => {
      expect(() => iconLoader('elements-to-load', { render: fakeRender }, { fetcher: undefined })).toThrow()
      expect(() => iconLoader('elements-to-load', { render: fakeRender }, { fetcher: 42 })).toThrow()
      expect(() => iconLoader('elements-to-load', { render: fakeRender }, { fetcher: '42' })).toThrow()
      expect(() => iconLoader('elements-to-load', { render: fakeRender }, { fetcher: fakeFetcher, apiUrl: 'https://antoine.dev' }).then(() => done())).not.toThrow()
    })
    test('it should throw an error if fetchOption.apiUrl is not defined or empty string', (done) => {
      expect(() => iconLoader('elements-to-load', { render: fakeRender }, { fetcher: fakeFetcher, apiUrl: undefined })).toThrow()
      expect(() => iconLoader('elements-to-load', { render: fakeRender }, { fetcher: fakeFetcher, apiUrl: '' })).toThrow()
      expect(() => iconLoader('elements-to-load', { render: fakeRender }, { fetcher: fakeFetcher, apiUrl: 'https://antoine.dev' }).then(() => done())).not.toThrow()
    })
    test('it should display loaders element in the selected element, call the fetcher function, call render and delete hide the element if it resolve', () => {
      const loaderContainer = document.querySelector('.elements-to-load .icon-loader__container')

      const fetchPromise = iconLoader('elements-to-load', { render: fakeRender }, { fetcher: fakeFetcher, apiUrl: 'https://antoine.dev' })

      expect(loaderContainer.style.display).toEqual('flex')
      expect(document.getElementsByClassName('icon-loader__message')[0].innerHTML).toEqual(defaultMessage)

      return fetchPromise
        .then(() => {

          expect(loaderContainer.style.display).toEqual('none')
          expect(document.getElementsByClassName('icon-loader__message')[0].innerHTML).not.toEqual(defaultMessage)
          expect(fakeFetcher).toHaveBeenCalledTimes(1);
          // the second parameter is undefined because we don't pass any fetchBody to our fetcher
          expect(fakeFetcher).toHaveBeenCalledWith('https://antoine.dev', undefined);
        })
    })
    test('it should display an error message if the fetcher reject', () => {
      const loaderContainer = document.querySelector('.elements-to-load .icon-loader__container')

      const fakeErrorFetcher = jest.fn(() => Promise.reject())

      const fetchPromise = iconLoader('elements-to-load', { render: fakeRender }, { fetcher: fakeErrorFetcher, apiUrl: 'https://antoine.dev' })

      expect(loaderContainer.style.display).toEqual('flex')
      expect(document.getElementsByClassName('icon-loader__message')[0].innerHTML).toEqual(defaultMessage)

      return fetchPromise
        .then(() => {

          expect(loaderContainer.style.display).toEqual('flex')
          expect(document.getElementsByClassName('icon-loader__message')[0].innerHTML).toEqual('an error occured when loading content')
          expect(fakeErrorFetcher).toHaveBeenCalledTimes(1);
          // the second parameter is undefined because we don't pass any fetchBody to our fetcher
          expect(fakeErrorFetcher).toHaveBeenCalledWith('https://antoine.dev', undefined);
        })
    })
  })
})
