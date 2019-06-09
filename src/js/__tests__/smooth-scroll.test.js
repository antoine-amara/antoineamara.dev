/* eslint-disable */

import { _getCurrentPosition, _exractTargetFromEvent, _getTargetPosition, smoothScroll } from '../smooth-scroll'

describe('SmoothScroll module: smooth scroll from your position to a target anchor', () => {
  let currentPosition = 100
  const fakeScrollTo = (coordX, coordY) => {
    window.pageXOffset = coordX
    window.pageYOffset = coordY
    document.documentElement.scrollTop = coordY
    document.body.scrollTop = coordY
  }
  beforeEach(() => {
    document.body.innerHTML = `
      <div style="height:800px;">ONE</div>
      <div style="height:800px;" id="target">TWO</div>
      <a id="menuElement" href="#target">GO To TARGET</a>
      <a class="elmt-without-id">WRONG ELEMENT WITHOUT TARGET</a>
    `
    window.scrollTo = jest.fn(fakeScrollTo)
    window.scrollTo(0, 100)

    // fake scroll to final target element because the virtual DOM don't work properly
    const targetElement = document.getElementById('target')
    targetElement.pageYOffset = 0
  })
  
  describe('_getCurrentPosition', () => {
    test('it should be defined', () => expect(_getCurrentPosition).toBeDefined())
    test('it should be a function', () => expect(typeof _getCurrentPosition).toBe('function'))
    test('it should throw an error if none of the javascript function return a result', () => {

      expect(() => _getCurrentPosition()).not.toThrow()

      window.pageYOffset = undefined
      document.documentElement.scrollTop = undefined
      document.body.scrollTop = undefined

      expect(() => _getCurrentPosition()).toThrow()
    })
    test('it should return the current scroll position and find it with all possible javascript functions', () => {
      expect(_getCurrentPosition()).toBe(currentPosition)

      window.pageYOffset = undefined

      expect(_getCurrentPosition()).toBe(currentPosition)

      document.documentElement.scrollTop = undefined

      expect(_getCurrentPosition()).toBe(currentPosition)
    })

    test('it should return the value even if the scroll is at the top (current position to 0)', () => {
      window.scrollTo(0, 0)

      expect(_getCurrentPosition()).toBe(0)
    })
  })

  describe('_extractTargetIdFromEvent', () => {
    test('it should be defined', () => expect(_exractTargetFromEvent).toBeDefined())
    test('it should be a function', () => expect(typeof _exractTargetFromEvent).toBe('function'))
    test('it should throw an error if the received event is not an event', done => {

      expect(() => _exractTargetFromEvent(undefined)).toThrow()
      expect(() => _exractTargetFromEvent('hellothere!').toThrow())
      expect(() => _exractTargetFromEvent(42).toThrow())

      const menuElement = document.getElementById('menuElement')

      menuElement.addEventListener('click', event => {
        expect(() => _exractTargetFromEvent(event)).not.toThrow()
        done()
      })

      // simulate a click event to retrieve the event object (inside the event listener)
      menuElement.click()
    })

    test('it should throw an error if the event doesn\'t contain a target as an href', done => {
      // Test with wrong element
      const menuElementWithoutTarget = document.getElementsByClassName('elmt-without-id')[0]

      menuElementWithoutTarget.addEventListener('click', event => {
        expect(() => _exractTargetFromEvent(event)).toThrow()
      })

      // simulate a click event to retrieve the event object (inside the event listener)
      menuElementWithoutTarget.click()

      // test a good case with the right menu element
      const menuElement = document.getElementById('menuElement')

      menuElement.addEventListener('click', event => {
        expect(() =>_exractTargetFromEvent(event)).not.toThrow()
        done()
      })

      // simulate a click event to retrieve the event object (inside the event listener)
      menuElement.click()
    })

    test('it should extact and return the target/href from the element click event', done => {
      const menuElement = document.getElementById('menuElement')

      menuElement.addEventListener('click', event => {
        const extractedTargetId = _exractTargetFromEvent(event)

        expect(extractedTargetId).toEqual('target')
        done()
      })

      menuElement.click()
    })
  })

  describe('_getTargetPosition', () => {
    test('it should be defined', () => expect(_getTargetPosition).toBeDefined())

    test('it should be a function', () => expect(typeof _getTargetPosition).toBe('function'))

    test('it should throw an error if the targetId is not a string', () => {
      expect(() => _getTargetPosition(undefined)).toThrow()
      expect(() => _getTargetPosition(42)).toThrow()
      expect(() => _getTargetPosition(() => 42)).toThrow()
      expect(() => _getTargetPosition('target')).not.toThrow()
    })

    test('it should throw an error if the target doesn\'t exist into the DOM', () => {
      // this target does not exist in our virtual DOM which was initialized into the beforeEach statement
      expect(() => _getTargetPosition('kenobi')).toThrow()

      // this target exist in our virtual DOM which was initialized into the beforeEach statement
      expect(() => _getTargetPosition('target')).not.toThrow()
    })

    test('it should return the current target position in the DOM', () => {
      const currentTargetElementPosition = _getTargetPosition('target')

      // virtual DOM consider the element is in position 0
      expect(currentTargetElementPosition).toEqual(0)
    })
  })

  describe('smoothScroll', () => {
    test('it should be defined', () => expect(smoothScroll).toBeDefined())
    test('it should be a function', () => expect(typeof smoothScroll).toBe('function'))
    test('it should throw an error if one parameter is undefined', done => {
      expect(() => smoothScroll(undefined, 'ease', 100)).toThrow()
      
      // trigger a click event to retrieve event object
      const menuElement = document.getElementById('menuElement')

      menuElement.addEventListener('click', event => {
        expect(() => smoothScroll(event, undefined, 100)).toThrow()
        expect(() => smoothScroll(event, 'ease', undefined)).toThrow()

        expect(() => smoothScroll(event, 'ease', 100)).not.toThrow()
        done()
      })

      menuElement.click()
    })

    test('it should scroll to the target element', done => {
      const menuElement = document.getElementById('menuElement')

      menuElement.addEventListener('click', async (event) => {
        // for more explaination about jest timer: https://stackoverflow.com/questions/52673682/how-do-i-test-promise-delays-with-jest
        jest.useFakeTimers()

        smoothScroll(event, 'ease', 100)

        jest.advanceTimersByTime(105);
        await Promise.resolve()

        const targetElement = document.getElementById('target')
        expect(window.pageYOffset).toEqual(targetElement.pageYOffset)

        jest.useRealTimers()
        done()
      })

      menuElement.click()
    })
  })
})
