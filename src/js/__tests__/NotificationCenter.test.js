/* eslint-disable */

import NotificationCenter from '../NotificationCenter'
import * as utils from '../utils'

describe('NotificationCenter module: display a message into a little colored popin for N seconds', () => {
  beforeAll(() => {
    // insert notification center into a fake DOM
    document.body.innerHTML = `
    <div class="snackbar">
      <div class="snackbar__message">Some text some message..</div>
      <div class="snackbar__action">dismiss</div>
    </div>
    `
  })

  describe('NotificationCenter', () => {
    test('it should be defined', () => expect(NotificationCenter).toBeDefined())
    test('it should be a function', () => expect(typeof NotificationCenter).toBe('function'))
    test('it should throw an error if className parameter is undefined', () => {
      expect(() => new NotificationCenter(undefined, 100)).toThrow()
      expect(() => new NotificationCenter('snackbar', 100)).not.toThrow()
    })
    test('it should throw an error if the HTML element corresponding to the className is not found into the DOM',() => {
      expect(() => new NotificationCenter('fake-element', 100)).toThrow()
      expect(() => new NotificationCenter('snackbar', 100)).not.toThrow()
    })
    test('it should throw an error if the messageTimeout parameter is not a number', () => {
      expect(() => new NotificationCenter('snackbar', 'hacking...')).toThrow()
      expect(() => new NotificationCenter('snackbar', '2000')).not.toThrow()
      expect(() => new NotificationCenter('snackbar', 100)).not.toThrow()
    })
    test('it should initialize messageTimeout and get the notification center HTML element into the DOM', () => {
      const notificationCenter = new NotificationCenter('snackbar', 100)

      expect(notificationCenter.domElement instanceof HTMLElement).toBeTruthy()
      expect(notificationCenter.domElement.classList.contains('snackbar')).toBeTruthy()
      expect(notificationCenter.messageExpiration).toEqual(100)
    })
    test('it should initialize messageTimeout to 1000 if the messageTimeout parameter is undefined', () => {
      const notificationCenter = new NotificationCenter('snackbar')

      expect(notificationCenter.messageExpiration).toEqual(1000)
    })
  })

  describe('_log', () => {
    let notificationCenter = null
    beforeEach(() => {
      notificationCenter = new NotificationCenter('snackbar', 100)
    })
    test('it should be defined', () => expect(notificationCenter._log).toBeDefined())
    test('it should be a function', () => expect(typeof notificationCenter._log).toBe('function'))
    test('it should throw an error if the message parameter is not a string', () => {
      expect(() => notificationCenter._log(undefined)).toThrow()
      expect(() => notificationCenter._log(42)).toThrow()
      expect(() => notificationCenter._log('Hello There !! ... General Kenobi !!')).not.toThrow()
    })
    test('it should add the message into the notification center domElement', () => {
      const messageToDisplay = 'Hello There !! ... General Kenobi !!'

      notificationCenter._log(messageToDisplay)

      expect(notificationCenter.messageContainer.innerHTML).toEqual(messageToDisplay)
    })
    test('it should add [NO MESSAGE] is the message parameter is an empty string', () => {
      const messageToDisplay = '[NO MESSAGE]'

      notificationCenter._log('')

      expect(notificationCenter.messageContainer.innerHTML).toEqual(messageToDisplay)
    })
  })

  describe('_expireMessage', () => {
    let notificationCenter = null
    beforeEach(() => {
      notificationCenter = new NotificationCenter('snackbar', 100)
      jest.useFakeTimers()
    })
    afterEach(() => {
      jest.useRealTimers();
    })
    test('it should be defined', () => expect(notificationCenter._expireMessage).toBeDefined())
    test('it should be a function', () => expect(typeof notificationCenter._expireMessage).toBe('function'))
    test('it should wait N second (defined by messageExpiration) and resolve. when it resolve it seems the message is expired', async () => {
      // for more explaination about jest timer: https://stackoverflow.com/questions/52673682/how-do-i-test-promise-delays-with-jest
      const fakeResolveCallback = jest.fn()

      notificationCenter._expireMessage().then(fakeResolveCallback)

      jest.advanceTimersByTime(50);
      // let any pending callbacks in PromiseJobs run
      await Promise.resolve()
      expect(fakeResolveCallback).not.toHaveBeenCalled()

      jest.advanceTimersByTime(50)
      // let any pending callbacks in PromiseJobs run
      await Promise.resolve()
      expect(fakeResolveCallback).toHaveBeenCalled();
      
    })
    test('it should wait 1 second when messageTimeout parameter is undefined', async () => {
      notificationCenter = new NotificationCenter('snackbar')
      // for more explaination about jest timer: https://stackoverflow.com/questions/52673682/how-do-i-test-promise-delays-with-jest
      const fakeResolveCallback = jest.fn()

      notificationCenter._expireMessage().then(fakeResolveCallback)

      jest.advanceTimersByTime(1000)
      // let any pending callbacks in PromiseJobs run
      await Promise.resolve()
      expect(fakeResolveCallback).toHaveBeenCalled();
    })
  })

  describe('NotificationCenter.success', () => {
    let notificationCenter = null
    beforeEach(() => {
      notificationCenter = new NotificationCenter('snackbar', 5)
    })
    afterEach(() => {
    })

    test('it should be defined', () => expect(notificationCenter.success).toBeDefined())
    test('it should be a function', () => expect(typeof notificationCenter.success).toBe('function'))
    test('it should throw an error if the message parameter is undefined', async () => {
      const errorMessage = '[NotificationCenter - success] the message is not defined or is not a string, got undefined'

      try {
        await notificationCenter.success(undefined)
      } catch(err) {
        expect(err).toEqual(new Error(errorMessage))
      }
    })
    test('it should throw an error if the message parameter is not a string', async () => {
      const errorMessage = '[NotificationCenter - success] the message is not defined or is not a string, got number'

      try {
        await notificationCenter.success(42)
      } catch(err) {
        expect(err).toEqual(new Error(errorMessage))
      }
    })
    test('it should add snackbar--success and snackbar__show css class to display the notification center, call _log to display the message, wait N second and delete the css class to hide the notification center', async () => {
      const timeoutSpy = jest.spyOn(utils, 'timeout')
      const messageToDisplay = 'Hello there !! ... General Kenobi !!'

      const successPromise = notificationCenter.success(messageToDisplay)

      expect(notificationCenter.domElement.classList.contains('snackbar--success')).toBeTruthy()
      expect(notificationCenter.domElement.classList.contains('snackbar__show')).toBeTruthy()
      expect(notificationCenter.messageContainer.innerHTML).toEqual(messageToDisplay)

      return successPromise .then(_ => {
        expect(timeoutSpy).toHaveBeenCalled()
        expect(notificationCenter.domElement.classList.contains('snackbar--success')).toBeFalsy()
        expect(notificationCenter.messageContainer.innerHTML).toEqual('')
      })
    })
  })

  describe('NotificationCenter.info', () => {
    let notificationCenter = null
    beforeEach(() => {
      notificationCenter = new NotificationCenter('snackbar', 5)
    })
    afterEach(() => {
    })

    test('it should be defined', () => expect(notificationCenter.info).toBeDefined())
    test('it should be a function', () => expect(typeof notificationCenter.info).toBe('function'))
    test('it should throw an error if the message parameter is undefined', async () => {
      const errorMessage = '[NotificationCenter - info] the message is not defined or is not a string, got undefined'

      try {
        await notificationCenter.info(undefined)
      } catch(err) {
        expect(err).toEqual(new Error(errorMessage))
      }
    })
    test('it should throw an error if the message parameter is not a string', async () => {
      const errorMessage = '[NotificationCenter - info] the message is not defined or is not a string, got number'

      try {
        await notificationCenter.info(42)
      } catch(err) {
        expect(err).toEqual(new Error(errorMessage))
      }
    })
    test('it should add snackbar--success and snackbar__show css class to display the notification center, call _log to display the message, wait N second and delete the css class to hide the notification center', async () => {
      const timeoutSpy = jest.spyOn(utils, 'timeout')
      const messageToDisplay = 'Hello there !! ... General Kenobi !!'

      const successPromise = notificationCenter.info(messageToDisplay)

      expect(notificationCenter.domElement.classList.contains('snackbar--info')).toBeTruthy()
      expect(notificationCenter.domElement.classList.contains('snackbar__show')).toBeTruthy()
      expect(notificationCenter.messageContainer.innerHTML).toEqual(messageToDisplay)

      return successPromise .then(_ => {
        expect(timeoutSpy).toHaveBeenCalled()
        expect(notificationCenter.domElement.classList.contains('snackbar--info')).toBeFalsy()
        expect(notificationCenter.messageContainer.innerHTML).toEqual('')
      })
    })
  })

  describe('NotificationCenter.error', () => {
    let notificationCenter = null
    beforeEach(() => {
      notificationCenter = new NotificationCenter('snackbar', 5)
    })
    afterEach(() => {
    })

    test('it should be defined', () => expect(notificationCenter.error).toBeDefined())
    test('it should be a function', () => expect(typeof notificationCenter.error).toBe('function'))
    test('it should throw an error if the message parameter is undefined', async () => {
      const errorMessage = '[NotificationCenter - error] the message is not defined or is not a string, got undefined'

      try {
        await notificationCenter.error(undefined)
      } catch(err) {
        expect(err).toEqual(new Error(errorMessage))
      }
    })
    test('it should throw an error if the message parameter is not a string', async () => {
      const errorMessage = '[NotificationCenter - error] the message is not defined or is not a string, got number'

      try {
        await notificationCenter.error(42)
      } catch(err) {
        expect(err).toEqual(new Error(errorMessage))
      }
    })
    test('it should add snackbar--success and snackbar__show css class to display the notification center, call _log to display the message, wait N second and delete the css class to hide the notification center', async () => {
      const timeoutSpy = jest.spyOn(utils, 'timeout')
      const messageToDisplay = 'Hello there !! ... General Kenobi !!'

      const successPromise = notificationCenter.error(messageToDisplay)

      expect(notificationCenter.domElement.classList.contains('snackbar--error')).toBeTruthy()
      expect(notificationCenter.domElement.classList.contains('snackbar__show')).toBeTruthy()
      expect(notificationCenter.messageContainer.innerHTML).toEqual(messageToDisplay)

      return successPromise .then(_ => {
        expect(timeoutSpy).toHaveBeenCalled()
        expect(notificationCenter.domElement.classList.contains('snackbar--error')).toBeFalsy()
        expect(notificationCenter.messageContainer.innerHTML).toEqual('')
      })
    })
  })
})
