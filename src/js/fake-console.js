import rawShellConf from "./config/fake-shell-command";
const HTMLElement = window.HTMLElement;

const EXCLUDE_KEYS = [
  "Alt",
  "Shift",
  "Control",
  "Tab",
  "CapsLock",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "PageUp",
  "PageDown",
  "End",
];

// Module to manage a fake console

export function manageFakeShell(selector) {
  let isWriting = false;
  const fakeShellElement = document.getElementsByClassName(selector)[0];
  const shellCommands = _readShellConf(rawShellConf);
  isWriting = true;
  _executeShellCommand(fakeShellElement, shellCommands, "main").then(() => {
    isWriting = false;
  });

  fakeShellElement.addEventListener("keydown", (event) => {
    const { key } = event;
    event.stopPropagation();
    event.preventDefault();

    if (isWriting) {
      return;
    }

    if (EXCLUDE_KEYS.includes(key)) {
      return;
    }

    const lines = document.getElementsByClassName("fake-console__line");
    const lastLine = lines[lines.length - 1];

    if (key === "Backspace") {
      const lineContent = _parseShellCommand(fakeShellElement);
      lastLine.innerHTML = `&gt; ${lineContent.substr(
        0,
        lineContent.length - 1
      )}<div class="fake-console__cursor fake-console--blink">&#x2588;</div>`;
      return;
    }

    if (key === "Enter") {
      const command = _parseShellCommand(fakeShellElement);
      document.querySelector(".fake-console__cursor").remove();

      if (command === "clear") {
        fakeShellElement.innerHTML = "";
        return _pushPhraseToFakeConsole(
          fakeShellElement,
          "",
          true,
          false,
          true
        );
      }

      isWriting = true;
      return _executeShellCommand(
        fakeShellElement,
        shellCommands,
        command
      ).then(() => {
        isWriting = false;
      });
    } else {
      _pushCharacterToFakeConsole(lastLine, key, 0, true);
    }
  });
}

// write404ErrorToFakeConsole is a dedicated function to manage the fake console on 404.html
export function write404ErrorToFakeConsole(
  selector,
  elementToDisplay,
  options = {}
) {
  const fakeConsoleElement = document.getElementsByClassName(selector)[0];

  return new Promise((resolve, reject) => {
    if (!fakeConsoleElement) {
      const container = document.getElementsByClassName("not-found")[0];
      container.innerHTML = "<p>404 - Page Not Found</p>";
      resolve(true);
    }

    if (!elementToDisplay || elementToDisplay.length === 0) {
      return _pushPhraseToFakeConsole(
        fakeConsoleElement,
        "404 - Page Not Found"
      ).then((_) => resolve(true));
    }

    return elementToDisplay
      .reduce(
        (previousPhrase, nextPhrase, elementIndex) =>
          previousPhrase.then((_) => {
            return elementIndex !== elementToDisplay.length - 1
              ? _pushPhraseToFakeConsole(
                  fakeConsoleElement,
                  nextPhrase,
                  false,
                  false,
                  false,
                  options.characterTimeout
                )
              : _pushPhraseToFakeConsole(fakeConsoleElement, nextPhrase, true);
          }),
        Promise.resolve()
      )
      .then((_) => resolve(true));
  });
}

export function _readShellConf(jsonConfiguration) {
  if (!jsonConfiguration) {
    throw new Error(
      "[_readShellConf] the shell configuration is undefined, cannot read it."
    );
  }
  if (!Object.keys(jsonConfiguration).length) {
    throw new Error(
      "[_readShellConf] the shell configuration is empty, cannot read it."
    );
  }

  return Object.entries(jsonConfiguration).reduce(
    (parsedConfiguration, [commandName, commandContent]) => ({
      ...parsedConfiguration,
      [commandName]: commandContent.split("\n"),
    }),
    {}
  );
}

export function _executeShellCommand(fakeConsoleElement, shellConfig, command) {
  if (!fakeConsoleElement) {
    throw new Error(
      `[_executeShellCommand] the console element is not defined, got: ${fakeConsoleElement}`
    );
  }
  if (!(fakeConsoleElement instanceof HTMLElement)) {
    throw new Error(
      `[_executeShellCommand] it seems the console is not a DOM element, got: ${typeof fakeConsoleElement}`
    );
  }
  if (!shellConfig) {
    throw new Error(
      "[_executeShellCommand] the shell configuration is undefined, cannot read it."
    );
  }
  if (!Object.keys(shellConfig).length) {
    throw new Error(
      "[_executeShellCommand] the shell configuration is empty, cannot read it."
    );
  }
  if (!command && command !== "") {
    throw new Error("[_executeShellCommand] the command is not defined");
  }

  if (!Object.keys(shellConfig).includes(command)) {
    return _pushPhraseToFakeConsole(
      fakeConsoleElement,
      `the command ${command} does not exist`,
      true,
      true
    );
  }

  return new Promise((resolve, reject) => {
    shellConfig[command]
      .reduce(
        (previousPhrase, nextPhrase, elementIndex) =>
          previousPhrase.then((_) => {
            return elementIndex !== shellConfig[command].length - 1
              ? _pushPhraseToFakeConsole(
                  fakeConsoleElement,
                  nextPhrase,
                  false,
                  false,
                  false
                )
              : _pushPhraseToFakeConsole(
                  fakeConsoleElement,
                  nextPhrase,
                  true,
                  true,
                  false
                );
          }),
        Promise.resolve()
      )
      .then((_) => resolve(true));
  });
}

export function _parseShellCommand(fakeConsoleElement) {
  if (!fakeConsoleElement) {
    throw new Error(
      `[_parseShellCommand] the console element is not defined, got: ${fakeConsoleElement}`
    );
  }
  if (!(fakeConsoleElement instanceof HTMLElement)) {
    throw new Error(
      `[_parseShellCommand] it seems the console is not a DOM element, got: ${typeof fakeConsoleElement}`
    );
  }

  const lines = document.getElementsByClassName("fake-console__line");
  const lineToParse = lines[lines.length - 1];

  if (!lineToParse) return "";

  return lineToParse.innerHTML
    .replace(">", "")
    .replace("&gt; ", "")
    .replace(
      '<div class="fake-console__cursor fake-console--blink">&#x2588;</div>',
      ""
    )
    .replace(
      '<div class="fake-console__cursor fake-console--blink">█</div>',
      ""
    )
    .replace(
      '<div class="fake-console__cursor fake-console--blink"█</div>',
      ""
    );
}

export function _pushPhraseToFakeConsole(
  fakeConsoleElement,
  phrase,
  addCursor = false,
  newLine = false,
  tick = false,
  characterTimeout
) {
  if (!fakeConsoleElement)
    throw new Error(
      `[_pushPhraseToFakeConsole] the console element is not defined, got: ${fakeConsoleElement}`
    );
  if (!(fakeConsoleElement instanceof HTMLElement))
    throw new Error(
      `[_pushPhraseToFakeConsole] it seems the console is not a DOM element, got: ${typeof fakeConsoleElement}`
    );
  if (typeof phrase !== "string")
    throw new Error(
      `[_pushPhraseToFakeConsole] phrase is not a string, got: ${phrase}`
    );

  const arrayPhrase = Array.from(phrase).map((char) => {
    if (char === "\t") {
      return "&nbsp;";
    }
    return char;
  });
  const phraseContainer = document.createElement("P");
  phraseContainer.setAttribute(
    "class",
    "fake-console__line fake-console--no-margin"
  );
  fakeConsoleElement.appendChild(phraseContainer);

  fakeConsoleElement.scrollTop = fakeConsoleElement.scrollHeight;

  return new Promise((resolve, reject) => {
    arrayPhrase
      .reduce(
        (previsousCharacter, nextCharacter) =>
          previsousCharacter.then((_) =>
            _pushCharacterToFakeConsole(
              phraseContainer,
              nextCharacter,
              characterTimeout
            )
          ),
        _pushCharacterToFakeConsole(
          phraseContainer,
          `${tick ? "> " : ""}<div class="fake-console__cursor">&#x2588;</div>`
        ).then(() => {
          fakeConsoleElement.scrollTop = fakeConsoleElement.scrollHeight;
        })
      )
      .then((_) => {
        const hasCursor = !!document.querySelector(".fake-console__cursor");
        if (hasCursor) {
          document.querySelector(".fake-console__cursor").remove();
        }
        if (newLine) {
          return _pushPhraseToFakeConsole(
            fakeConsoleElement,
            "",
            true,
            false,
            true
          );
        }
        if (addCursor) {
          return _pushCharacterToFakeConsole(
            phraseContainer,
            '<div class="fake-console__cursor fake-console--blink">&#x2588;</div>'
          );
        }
      })
      .then((_) => resolve(true));
  });
}

export function _pushCharacterToFakeConsole(
  fakeConsoleElement,
  character,
  characterTimeout
) {
  if (!fakeConsoleElement)
    throw new Error(
      `[_pushCharacterToFakeConsole] the console element is not defined, got: ${fakeConsoleElement}`
    );
  if (!(fakeConsoleElement instanceof HTMLElement))
    throw new Error(
      `[_pushCharacterToFakeConsole] it seems the console is not a DOM element, got: ${typeof fakeConsoleElement}`
    );
  if (!character)
    throw new Error(
      `[_pushCharacterToFakeConsole] character is not defined, got: ${character}`
    );

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const hasCursor = !!document.querySelector(".fake-console__cursor");

      if (hasCursor) {
        const cursor = document.querySelector(".fake-console__cursor");
        cursor.insertAdjacentHTML("beforebegin", character);
      } else {
        fakeConsoleElement.innerHTML += character;
      }
      resolve(true);
    }, characterTimeout || 50);
  });
}
