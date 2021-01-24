/* eslint-disable */

import { getCurrentScrollPosition, extractTargetIdFromElementHref, throttle, iconLoader, fetcher } from '../utils'
import FetchError from '../FetchError'

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
  describe('fetcher: function to fetch an URL and return the response as JSON (without authentication)', () => {
    let fetchMock = null
    const fakeJsonResponse = { 
      successMessage: 'un email a été envoye à notre équipe, nous vous répondrons dans les meilleurs délais.' 
    };

    beforeEach(() => {
      fetchMock = jest.fn(
        () => Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(fakeJsonResponse)
        })
      )
      global.fetch = fetchMock
    })

    afterEach(() => global.fetch.mockRestore())
    
    test('it should be defined', () => expect(fetcher).toBeDefined())
    test('it should be a function', () => expect(typeof fetcher).toBe('function'))
    test('it should throw an error if the url is not defined', async () => {
      const error = new Error('[fetcher] you have to provide an URL to be able to fetch a network endpoint')

      try {
        await fetcher(undefined)
      } catch(err) { expect(err).toEqual(error) }
    })
    test('it should throw an error if the url is malformed', async () => {

      try {
        await fetcher('lacuisinedepaulo.com/contact')
      } catch(err) { expect(err).toEqual(new Error('[fetcher] the url you provide is not a valid https url, got "lacuisinedepaulo.com/contact"')) }

      try {
        await fetcher('hello there')
      } catch(err) { expect(err).toEqual(new Error('[fetcher] the url you provide is not a valid https url, got "hello there"')) }

      try {
        await fetcher('lacuisinedepaulo/contact')
      } catch(err) { expect(err).toEqual(new Error('[fetcher] the url you provide is not a valid https url, got "lacuisinedepaulo/contact"')) }

      try {
        await fetcher('http://lacuisinedepaulo')
      } catch(err) { expect(err).toEqual(new Error('[fetcher] the url you provide is not a valid https url, got "http://lacuisinedepaulo"')) }
    })
    test('it should throw a FetchError if server respond with an error code (4XX/5XX)', () => {
      const fetchErrorMock = jest.fn(
        () => Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve(fakeJsonResponse)
        })
      )
      global.fetch = fetchErrorMock

      const error = new FetchError('[fetcher] receive error code 500 from HTTP request', { ok: false, status: 500 }, fakeJsonResponse)

      return fetcher('https://north-fr-lacuisinedepaulo.cloudfunction.localhost/contact')
        .catch(err => {
          expect(err).toEqual(error)
        })
    })
    test('it should make a GET request (because the request have no body) with the fetch API and return the response as a JSON object', () => {
      return fetcher('https://north-fr-lacuisinedepaulo.cloudfunction.localhost/contact')
        .then(res => {
          expect(fetchMock).toHaveBeenCalled()
          expect(fetchMock.mock.calls[0][0]).toEqual('https://north-fr-lacuisinedepaulo.cloudfunction.localhost/contact')
          expect(fetchMock.mock.calls[0][1].method).toEqual('GET')
          expect(fetchMock.mock.calls[0][1].body).not.toBeDefined()
          expect(fakeJsonResponse).toEqual(res)
        })
    })
    test('it should make a POST request (because the request have a body) with the fetch API and return the response as a JSON object', () => {
      const fakeRequestBody = {
        email: 'amara.antoine@lacuisinedepaulo.com',
        subject: 'test',
        message: 'I make a test'
      }

      return fetcher('https://north-fr-lacuisinedepaulo.cloudfunction.localhost/contact', fakeRequestBody)
        .then(res => {
          expect(fetchMock).toHaveBeenCalled()
          expect(fetchMock.mock.calls[0][0]).toEqual('https://north-fr-lacuisinedepaulo.cloudfunction.localhost/contact')
          expect(fetchMock.mock.calls[0][1].method).toEqual('POST')
          expect(fetchMock.mock.calls[0][1].body).toBeDefined()
          expect(fakeJsonResponse).toEqual(res)
        })
    })
  })
})
