/* eslint-disable */

import {
  write404ErrorToFakeConsole,
  _readShellConf,
  _executeShellCommand,
  _parseShellCommand,
  _pushPhraseToFakeConsole,
  _pushCharacterToFakeConsole,
} from "../fake-console";

describe("FakeConsole module: display fake UNIX like commands into the screen", () => {
  const validTextToDisplay = ["Hello There !!!", "...", "General Kenobi !"];

  const getFakeConsole = (_) => {
    return document.getElementsByClassName("fake-console")[0];
  };

  beforeAll((done) => {
    // insert container and fake-console to the DOM
    document.body.innerHTML = `
      <div class="website-content not-found">
        <div class="fake-console"></div>
      </div>
    `;
    done();
  });

  afterEach((done) => {
    // clean the DOM
    document.body.innerHTML = `
      <div class="website-content not-found">
        <div class="fake-console"></div>
      </div>
    `;
    done();
  });

  describe("write404ErrorToFakeConsole", () => {
    test("it should be defined", () =>
      expect(write404ErrorToFakeConsole).toBeDefined());
    test("it should be a function", () =>
      expect(typeof write404ErrorToFakeConsole).toBe("function"));
    test('it should write "404 - Page Not Found" if the text array is empty or undefined', () => {
      return write404ErrorToFakeConsole("fake-console", []).then((_) => {
        const fakeConsoleHtml = getFakeConsole().childNodes[0].innerHTML;
        expect(fakeConsoleHtml).toEqual("404 - Page Not Found");
      });
    });
    test("it should write the text from text array and add a cursor to the end of the last phrase", () => {
      return write404ErrorToFakeConsole(
        "fake-console",
        validTextToDisplay
      ).then((_) => {
        const fakeConsoleHtmlElements = getFakeConsole().childNodes;

        fakeConsoleHtmlElements.forEach((htmlElement, index) => {
          if (index !== fakeConsoleHtmlElements.length - 1) {
            expect(htmlElement.innerHTML).toEqual(
              `${validTextToDisplay[index]}`
            );
          } else {
            expect(htmlElement.innerHTML).toEqual(
              `${validTextToDisplay[index]}<div class="fake-console__cursor fake-console--blink">█</div>`
            );
          }
        });
      });
    });
  });

  describe("_readShellConf", () => {
    const fakeShellConf = {
      main: "Welcome to the shell",
      general: "Hello there!\nGeneral Kenobi!",
    };

    test("it should be defined", () => expect(_readShellConf).toBeDefined());
    test("it should be a function", () =>
      expect(typeof _readShellConf).toBe("function"));
    test("it should throw an error if jsonConfiguration parameter is not defined", () => {
      expect(() => _readShellConf(undefined)).toThrow();
      expect(() => _readShellConf(null)).toThrow();
      expect(() => _readShellConf()).toThrow();
      expect(() => _readShellConf(fakeShellConf)).not.toThrow();
    });
    test("it should throw an error if jsonConfiguration is empty", () => {
      expect(() => _readShellConf({})).toThrow();
      expect(() => _readShellConf(fakeShellConf)).not.toThrow();
    });
    test("it should return an object with the comand name as key and an array of array representing all lines", () => {
      const parsedFakeShellConf = _readShellConf(fakeShellConf);

      expect(Object.keys(parsedFakeShellConf)).toEqual(
        Object.keys(fakeShellConf)
      );
      expect(parsedFakeShellConf.main).toEqual(["Welcome to the shell"]);
      expect(parsedFakeShellConf.general).toEqual([
        "Hello there!",
        "General Kenobi!",
      ]);
    });
  });

  describe("_executeShellCommand", () => {
    const parsedFakeShellConf = {
      main: ["Welcome to the shell"],
      general: ["Hello there!", "General Kenobi!"],
    };
    const fakeCommand = "general";
    test("it should be defined", () =>
      expect(_executeShellCommand).toBeDefined());
    test("it should be a function", () =>
      expect(typeof _executeShellCommand).toBe("function"));
    test("it should throw an error if the fakeConsoleElement is not defined", (done) => {
      expect(() => _executeShellCommand(undefined)).toThrow();
      expect(() =>
        _executeShellCommand(
          getFakeConsole(),
          parsedFakeShellConf,
          fakeCommand
        ).then(() => done())
      ).not.toThrow();
    });
    test("it should throw an error if fakeConsoleElement is not an HTMLElement", (done) => {
      expect(() =>
        _executeShellCommand("hello there", parsedFakeShellConf, fakeCommand)
      ).toThrow();
      expect(() =>
        _executeShellCommand(
          "<div>hello there!</div>",
          parsedFakeShellConf,
          fakeCommand
        )
      ).toThrow();
      expect(() =>
        _executeShellCommand(
          { hello: "there" },
          parsedFakeShellConf,
          fakeCommand
        )
      ).toThrow();
      expect(() =>
        _executeShellCommand(
          getFakeConsole(),
          parsedFakeShellConf,
          fakeCommand
        ).then(() => done())
      ).not.toThrow();
    });
    test("it should throw an error if shellConfig parameter is not defined", (done) => {
      expect(() =>
        _executeShellCommand(getFakeConsole(), undefined, fakeCommand)
      ).toThrow();
      expect(() =>
        _executeShellCommand(getFakeConsole(), null, fakeCommand)
      ).toThrow();
      expect(() =>
        _executeShellCommand(
          getFakeConsole(),
          parsedFakeShellConf,
          fakeCommand
        ).then(() => done())
      ).not.toThrow();
    });
    test("it should throw an error if shellConfig is empty", (done) => {
      expect(() => _executeShellCommand(getFakeConsole(), {})).toThrow();
      expect(() =>
        _executeShellCommand(
          getFakeConsole(),
          parsedFakeShellConf,
          fakeCommand
        ).then(() => done())
      ).not.toThrow();
    });
    test("it should throw an error if command parameter is not defined", (done) => {
      expect(() =>
        _executeShellCommand(getFakeConsole(), parsedFakeShellConf, undefined)
      ).toThrow();
      expect(() =>
        _executeShellCommand(getFakeConsole(), parsedFakeShellConf, null)
      ).toThrow();
      expect(() =>
        _executeShellCommand(getFakeConsole(), parsedFakeShellConf, "")
      ).not.toThrow();
      expect(() =>
        _executeShellCommand(
          getFakeConsole(),
          parsedFakeShellConf,
          fakeCommand
        ).then(() => done())
      ).not.toThrow();
    });
    test("it should display an error in the fake console element, if the command to execute is not in the config", () => {
      return _executeShellCommand(
        getFakeConsole(),
        parsedFakeShellConf,
        "hack"
      ).then(() => {
        const fakeConsoleHtml = getFakeConsole().childNodes[0].innerHTML;

        expect(fakeConsoleHtml).toEqual("the command hack does not exist");
      });
    });
    test("it should display the command content into the fake console", () => {
      return _executeShellCommand(
        getFakeConsole(),
        parsedFakeShellConf,
        "general"
      ).then(() => {
        const fakeConsoleFirstLine = getFakeConsole().childNodes[0].innerHTML;
        const fakeConsoleSecondLine = getFakeConsole().childNodes[1].innerHTML;

        expect(fakeConsoleFirstLine).toEqual("Hello there!");
        expect(fakeConsoleSecondLine).toEqual("General Kenobi!");
      });
    });
  });

  describe("_parseShellCommand", () => {
    test("it should be defined", () =>
      expect(_parseShellCommand).toBeDefined());
    test("it should be a function", () =>
      expect(typeof _parseShellCommand).toBe("function"));
    test("it should throw an error if fakeConsole element is not defined", () => {
      expect(() => _parseShellCommand(undefined)).toThrow();
      expect(() => _parseShellCommand(getFakeConsole())).not.toThrow();
    });
    test("it should throw an error if fakeConsole element is not an HTMLElement", () => {
      expect(() => _parseShellCommand("hello there")).toThrow();
      expect(() => _parseShellCommand("<div>hello there!</div>")).toThrow();
      expect(() => _parseShellCommand({ hello: "there" })).toThrow();
      expect(() => _parseShellCommand(getFakeConsole())).not.toThrow();
    });
    test("it should return an empty string if it cannot parse any command", () => {
      getFakeConsole().innerHTML = `
      <div class="website-content not-found">
        <div class="fake-console">
          <p>Hello there!</p>
          <p>&gt; <div class="fake-console__cursor fake-console--blink">█</div></p>
        </div>
      </div>
      `;

      const command = _parseShellCommand(getFakeConsole());

      expect(command).toEqual("");
    });
    test("it should return the parsed command from the last console line, as a string", () => {
      getFakeConsole().innerHTML = `
      <div class="website-content not-found">
        <div class="fake-console">
          <p class="fake-console__line">Hello there!</p>
          <p class="fake-console__line">&gt; antoine --help<div class="fake-console__cursor fake-console--blink">█</div></p>
        </div>
      </div>
      `;

      const command = _parseShellCommand(getFakeConsole());

      expect(command).toEqual("antoine --help");
    });
  });

  describe("_pushPhraseToFakeConsole", () => {
    test("it should be defined", () =>
      expect(_pushPhraseToFakeConsole).toBeDefined());
    test("it should be a function", () =>
      expect(typeof _pushPhraseToFakeConsole).toBe("function"));
    test("it should throw an error if fakeConsoleElement is not defined", (done) => {
      expect((_) => _pushPhraseToFakeConsole(undefined, "hello")).toThrow();
      expect((_) =>
        _pushPhraseToFakeConsole(
          getFakeConsole(),
          "hello",
          false,
          false,
          false,
          5
        ).then(() => done())
      ).not.toThrow();
    });
    test("it should throw an error if fakeConsoleElement is not an HtmlElement", (done) => {
      expect((_) => _pushPhraseToFakeConsole("hello", "hello")).toThrow();
      expect((_) =>
        _pushPhraseToFakeConsole(
          getFakeConsole(),
          "hello",
          false,
          false,
          false,
          5
        ).then(() => done())
      ).not.toThrow();
    });
    test("it should throw an error if textToDisplay is not a string", (done) => {
      expect((_) =>
        _pushPhraseToFakeConsole(getFakeConsole(), undefined)
      ).toThrow();
      expect((_) =>
        _pushPhraseToFakeConsole(getFakeConsole(), getFakeConsole())
      ).toThrow();
      expect((_) => _pushPhraseToFakeConsole(getFakeConsole(), {})).toThrow();
      expect((_) => _pushPhraseToFakeConsole(getFakeConsole(), [])).toThrow();
      expect((_) =>
        _pushPhraseToFakeConsole(
          getFakeConsole(),
          "Hello There !",
          false,
          5
        ).then(() => done())
      ).not.toThrow();
    });
    test("it should write the phrase to the element", () => {
      return _pushPhraseToFakeConsole(
        getFakeConsole(),
        "Hello there !",
        false,
        false,
        false,
        5
      ).then((_) => {
        const fakeConsoleHtml = getFakeConsole().childNodes[0].innerHTML;

        expect(fakeConsoleHtml).toEqual("Hello there !");
      });
    });
    test('it should write the phrase to the element with the ">" character at the begining of the sentence', () => {
      return _pushPhraseToFakeConsole(
        getFakeConsole(),
        "Hello",
        false,
        false,
        true,
        5
      ).then((_) => {
        const fakeConsoleHtml = getFakeConsole().childNodes[0].innerHTML;
        const splittedSentence = fakeConsoleHtml.split(" ");

        expect(splittedSentence[0]).toEqual("&gt;");
        expect(splittedSentence[1]).toEqual("Hello");
      });
    });
    test("it should write the phrase with a cursor to the end if addCursor parameter is true", () => {
      return _pushPhraseToFakeConsole(
        getFakeConsole(),
        "Hello there ",
        true,
        false,
        false,
        5
      ).then((_) => {
        const fakeConsoleHtml = getFakeConsole().childNodes[0].innerHTML;
        const stringArrayElement = fakeConsoleHtml.split(" ");
        /* we are spliting with space, we have a space between the 2 css class and before the class attribute,
            so we have to concat 2 elements to have the cursor html element. */
        const cursor = `${stringArrayElement[stringArrayElement.length - 3]} ${
          stringArrayElement[stringArrayElement.length - 2]
        } ${stringArrayElement[stringArrayElement.length - 1]}`;

        expect(fakeConsoleHtml).toEqual(
          'Hello there <div class="fake-console__cursor fake-console--blink">█</div>'
        );
        expect(cursor).toEqual(
          '<div class="fake-console__cursor fake-console--blink">█</div>'
        );
      });
    });
    test('it should add a new line with a ">" character at the begining and the cursor if newLine parameter is true', () => {
      return _pushPhraseToFakeConsole(
        getFakeConsole(),
        "Hello there",
        true,
        true,
        false,
        5
      ).then(() => {
        const sentence = getFakeConsole().childNodes[0].innerHTML;
        const newEmptyLine = getFakeConsole().childNodes[1].innerHTML;

        expect(sentence).toEqual("Hello there");
        expect(newEmptyLine).toEqual(
          '&gt; <div class="fake-console__cursor fake-console--blink">█</div>'
        );
      });
    });
  });

  describe("_pushCharacterToFakeConsole", () => {
    test("it should be defined", () =>
      expect(_pushCharacterToFakeConsole).toBeDefined());
    test("it should be a function", () =>
      expect(typeof _pushCharacterToFakeConsole).toBe("function"));
    test("it should throw an error if the fakeConsoleElement is not defined", () => {
      expect((_) => _pushCharacterToFakeConsole(undefined, "H", 5)).toThrow();
      expect((_) =>
        _pushCharacterToFakeConsole(getFakeConsole(), "e", 5)
      ).not.toThrow();
    });
    test("it should throw an error if fakeConsole element is not an HtmlElement", () => {
      expect((_) => _pushCharacterToFakeConsole("hello", "l")).toThrow();
      expect((_) =>
        _pushCharacterToFakeConsole(getFakeConsole(), "l", 5)
      ).not.toThrow();
    });
    test("it should throw an error if the character is not defined", () => {
      expect((_) =>
        _pushCharacterToFakeConsole(getFakeConsole(), undefined)
      ).toThrow();
      expect((_) =>
        _pushCharacterToFakeConsole(getFakeConsole(), "o", 5)
      ).not.toThrow();
    });
    test("it should add the character into the current line", () => {
      const fakeConsole = getFakeConsole();

      return _pushCharacterToFakeConsole(getFakeConsole(), "h", 5).then((_) =>
        expect(fakeConsole.innerHTML).toEqual("h")
      );
    });
    test("it should add the character before the cursor if it exist", () => {
      const fakeConsole = getFakeConsole();
      // init a existing phrase with a cursor at the end.
      fakeConsole.innerHTML =
        'hello there!<div class="fake-console__cursor fake-console--blink">&#x2588;</div>';

      return _pushCharacterToFakeConsole(getFakeConsole(), "o", 1).then((_) =>
        expect(fakeConsole.innerHTML).toEqual(
          'hello there!o<div class="fake-console__cursor fake-console--blink">█</div>'
        )
      );
    });
  });
});
