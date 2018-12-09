const HTMLElement = window.HTMLElement

export function write404ErrorToFakeConsole (selector, elementToDisplay, options = {}) {
  const fakeConsoleElement = document.getElementsByClassName(selector)[0]

  return new Promise((resolve, reject) => {
    if (!fakeConsoleElement) {
      const container = document.getElementsByClassName('not-found')[0]
      container.innerHTML = '<p>404 - Page Not Found</p>'
      resolve(true)
    }

    if (!elementToDisplay || elementToDisplay.length === 0) {
      return _pushPhraseToFakeConsole(fakeConsoleElement, '404 - Page Not Found').then(_ => resolve(true))
    }

    return elementToDisplay.reduce((previousPhrase, nextPhrase, elementIndex) =>
      previousPhrase.then(_ => {
        return elementIndex !== elementToDisplay.length - 1
          ? _pushPhraseToFakeConsole(fakeConsoleElement, nextPhrase, options.characterTimeout)
          : _pushPhraseToFakeConsole(fakeConsoleElement, nextPhrase, true)
      }),
    Promise.resolve()).then(_ => resolve(true))
  })
}

export function _pushPhraseToFakeConsole (fakeConsoleElement, phrase, addCursor = false, characterTimeout) {
  if (!fakeConsoleElement) throw new Error(`[_pushPhraseToFakeConsole] the console element is not defined, got: ${fakeConsoleElement}`)
  if (!(fakeConsoleElement instanceof HTMLElement)) throw new Error(`[_pushPhraseToFakeConsole] it seems the console is not a DOM element, got: ${typeof fakeConsoleElement}`)
  if (typeof phrase !== 'string') throw new Error(`[_pushPhraseToFakeConsole] phrase is not a string, got: ${phrase}`)

  const arrayPhrase = Array.from(phrase)
  const phraseContainer = document.createElement('P')
  phraseContainer.setAttribute('class', 'fake-console__line fake-console--no-margin')
  fakeConsoleElement.appendChild(phraseContainer)

  return new Promise((resolve, reject) => {
    arrayPhrase.reduce((previsousCharacter, nextCharacter) =>
      previsousCharacter.then(_ => _pushCharacterToFakeConsole(phraseContainer, nextCharacter, characterTimeout)),
    _pushCharacterToFakeConsole(phraseContainer, '> ')
    )
      .then(_ => {
        if (addCursor) {
          return _pushCharacterToFakeConsole(phraseContainer, ' <div class="fake-console--cursor fake-console__blink">&#x2588;</div>')
        }
      })
      .then(_ => _pushCharacterToFakeConsole(phraseContainer, ' <br/>'))
      .then(_ => resolve(true))
  })
}

export function _pushCharacterToFakeConsole (fakeConsoleElement, character, characterTimeout) {
  if (!fakeConsoleElement) throw new Error(`[_pushCharacterToFakeConsole] the console element is not defined, got: ${fakeConsoleElement}`)
  if (!(fakeConsoleElement instanceof HTMLElement)) throw new Error(`[_pushCharacterToFakeConsole] it seems the console is not a DOM element, got: ${typeof fakeConsoleElement}`)
  if (!character) throw new Error(`[_pushCharacterToFakeConsole] character is not defined, got: ${character}`)

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      fakeConsoleElement.innerHTML += character
      resolve(true)
    }, characterTimeout || 50)
  })
}
