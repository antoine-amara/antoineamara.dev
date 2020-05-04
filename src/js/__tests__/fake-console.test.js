/* eslint-disable */

import { write404ErrorToFakeConsole, _pushPhraseToFakeConsole, _pushCharacterToFakeConsole } from '../fake-console';

describe('FakeConsole module: display fake UNIX like commands into the screen', () => {
  const validTextToDisplay = [
    'Hello There !!!',
    '...',
    'General Kenobi !'
  ]

  const getFakeConsole = _ => {
    return document.getElementsByClassName('fake-console')[0]
  }

  beforeAll(done => {
    // insert container and fake-console to the DOM
    document.body.innerHTML = `
      <div class="website-content not-found">
        <div class="fake-console"></div>
      </div>
    `
    done();
  })

  afterEach(done => {
    // clean the DOM
    document.body.innerHTML = `
      <div class="website-content not-found">
        <div class="fake-console"></div>
      </div>
    `
    done()
  })

  describe('write404ErrorToFakeConsole', () => {
    test('it should be defined', () => expect(write404ErrorToFakeConsole).toBeDefined())
    test('it should be a function', () => expect(typeof write404ErrorToFakeConsole).toBe('function'))
    test('it should write "404 - Page Not Found" if the text array is empty or undefined', () => {
      return write404ErrorToFakeConsole('fake-console', [])
        .then(_ => {
          const fakeConsoleHtml = getFakeConsole().childNodes[0].innerHTML
          expect(fakeConsoleHtml).toEqual('&gt; 404 - Page Not Found <br>')
        })
    })
    test('it should write the text from text array and add a cursor to the end of the last phrase', () => {
      return write404ErrorToFakeConsole('fake-console', validTextToDisplay)
        .then(_ => {

          const fakeConsoleHtmlElements = getFakeConsole().childNodes;

          fakeConsoleHtmlElements.forEach((htmlElement, index) => {
            if(index !== fakeConsoleHtmlElements.length - 1) {
              expect(htmlElement.innerHTML).toEqual(`&gt; ${validTextToDisplay[index]} <br>`)              
            } else {
            expect(htmlElement.innerHTML).toEqual(`&gt; ${validTextToDisplay[index]} <div class="fake-console__cursor fake-console--blink">█</div> <br>`)
            }
          })
        })
    })
  })

  describe('_pushPhraseToFakeConsole', () => {
    test('it should be defined', () => expect(_pushPhraseToFakeConsole).toBeDefined())
    test('it should be a function', () => expect(typeof _pushPhraseToFakeConsole).toBe('function'))
    test('it should throw an error if fakeConsoleElement is not defined', () => {
      expect(_ => _pushPhraseToFakeConsole(undefined, 'hello')).toThrow()
      expect(_ => _pushPhraseToFakeConsole(getFakeConsole(), 'hello', false, 5)).not.toThrow()
    })
    test('it should throw an error if fakeConsoleElement is not an HtmlElement', () => {
      expect(_ => _pushPhraseToFakeConsole('hello', 'hello')).toThrow()
      expect(_ => _pushPhraseToFakeConsole(getFakeConsole(), 'hello', false, 5)).not.toThrow()
    })
    test('it should throw an error if textToDisplay is not a string', () => {
      expect(_ => _pushPhraseToFakeConsole(getFakeConsole(), undefined)).toThrow()
      expect(_ => _pushPhraseToFakeConsole(getFakeConsole(), getFakeConsole())).toThrow()
      expect(_ => _pushPhraseToFakeConsole(getFakeConsole(), {})).toThrow()
      expect(_ => _pushPhraseToFakeConsole(getFakeConsole(), [])).toThrow()
      expect(_ => _pushPhraseToFakeConsole(getFakeConsole(), 'Hello There !', false, 5)).not.toThrow()
    })
    test('it should write the phrase to the element with the ">" character at the begining and "<br />" element at the end', () => {
      return _pushPhraseToFakeConsole(getFakeConsole(), 'Hello there !', false, 5)
        .then(_ => {
          const fakeConsoleHtml = getFakeConsole().childNodes[0].innerHTML;
          const stringArrayElement = fakeConsoleHtml.split(' ')

          expect(stringArrayElement[0]).toEqual('&gt;')
          expect(fakeConsoleHtml).toEqual('&gt; Hello there ! <br>')
          expect(stringArrayElement[stringArrayElement.length - 1]).toEqual('<br>')
        })
    })
    test('it should write the phrase with a cursor to the end if addCursor parameter is true', () => {
      return _pushPhraseToFakeConsole(getFakeConsole(), 'Hello there !', true, 5)
        .then(_ => {
          const fakeConsoleHtml = getFakeConsole().childNodes[0].innerHTML;
          const stringArrayElement = fakeConsoleHtml.split(' ')
          /* we are spliting with space, we have a space between the 2 css class and before the class attribute,
            so we have to concat 2 elements to have the cursor html element. */
          const cursor = `${stringArrayElement[stringArrayElement.length - 4]} ${stringArrayElement[stringArrayElement.length - 3]} ${stringArrayElement[stringArrayElement.length - 2]}`

          expect(stringArrayElement[0]).toEqual('&gt;')
          expect(fakeConsoleHtml).toEqual('&gt; Hello there ! <div class="fake-console__cursor fake-console--blink">█</div> <br>')
          expect(cursor).toEqual('<div class="fake-console__cursor fake-console--blink">█</div>')
          expect(stringArrayElement[stringArrayElement.length - 1]).toEqual('<br>')
        })
    })
 })

  describe('_pushCharacterToFakeConsole', () => {
    test('it should be defined', () => expect(_pushCharacterToFakeConsole).toBeDefined())
    test('it should be a function', () => expect(typeof _pushCharacterToFakeConsole).toBe('function'))
    test('it should throw an error if the fakeConsoleElement is not defined', () => {
      expect(_ => _pushCharacterToFakeConsole(undefined, 'H', 5)).toThrow()
      expect(_ => _pushCharacterToFakeConsole(getFakeConsole(), 'e', 5)).not.toThrow()
    })
    test('it should throw an error if fakeConsole element is not an HtmlElement', () => {
      expect(_ => _pushCharacterToFakeConsole('hello', 'l')).toThrow()
      expect(_ => _pushCharacterToFakeConsole(getFakeConsole(), 'l', 5)).not.toThrow()
    })
    test('it should throw an error if the character is not defined', () => {
      expect(_ => _pushCharacterToFakeConsole(getFakeConsole(), undefined)).toThrow()
      expect(_ => _pushCharacterToFakeConsole(getFakeConsole(), 'o', 5)).not.toThrow()
    })
    test('it should add the character into the current line', () => {
      const fakeConsole = getFakeConsole()

      return _pushCharacterToFakeConsole(getFakeConsole(), 'h', 5)
        .then(_ => expect(fakeConsole.innerHTML).toEqual('h'))
    })
  })
})
