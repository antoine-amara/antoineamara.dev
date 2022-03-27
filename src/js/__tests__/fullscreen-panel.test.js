/* eslint-disable */

import FullscreenPanels from "../fullscreen-panel";

describe("Fullscreen panel module: each section is transformed to a panel and each scroll action pass to the next/previous panel", () => {
  let websitePanels = null;
  const fakeScrollTo = (coordX, coordY) => {
    window.pageXOffset = coordX;
    window.pageYOffset = coordY;
    document.documentElement.scrollTop = coordY;
    document.body.scrollTop = coordY;
  };
  beforeEach(() => {
    document.body.innerHTML = `
      <nav>
        <div class="desktop-menu"></div>
      </nav>

      <div class="website-content" style="height:100vh">
        <section name="first">first panel</section>
        <section name="second">second panel</section>
        <section name="third">third panel</section>
      </div>
      
      <footer class="footer">
        <div>This template is <img inline src="src/img/code.svg"> with <img inline src="src/img/heart.svg"> by <img inline src="src/img/github.svg"></div>
        <a href="./legal-notice.html">Legal Notice</a>
      </footer>`;

    window.scrollTo = jest.fn(fakeScrollTo);
    websitePanels = new FullscreenPanels("website-content");
  });
  describe("FullscreenPanel constructor", () => {
    test("it should be defined", () => expect(FullscreenPanels).toBeDefined());
    test("it should be a class (function)", () =>
      expect(typeof FullscreenPanels).toBe("function"));
    test("it should throw an error if the main container pass as parameter is not found", () => {
      expect(() => new FullscreenPanels("fake")).toThrow();
      expect(() => new FullscreenPanels("website-content")).not.toThrow();
    });
    test("it should initialize variable when it create the panels", () => {
      const panels = new FullscreenPanels("website-content");

      expect(panels.scrollInProgress).toBe(false);
      expect(panels.totalNumberOfPanels).toEqual(3);
      expect(panels.containerClassname).toEqual("website-content");
    });
  });
  describe("createAndInsertMenu", () => {
    test("it should be defined", () =>
      expect(websitePanels.createAndInsertMenu).toBeDefined());
    test("it should be a function", () =>
      expect(typeof websitePanels.createAndInsertMenu).toBe("function"));
    test("it should throw an error if the websites sections are not found", () => {
      const { createAndInsertMenu } = websitePanels;
      expect(() => createAndInsertMenu("desktop-menu")).not.toThrow();

      document.body.innerHTML = `
        <nav>
          <div class="desktop-menu"></div>
        </nav>

        <div class="website-content" style="height:100vh">
        </div>`;

      expect(() => createAndInsertMenu("desktop-menu")).toThrow();
    });
    test("it should throw an error if the menu container is not found", () => {
      const { createAndInsertMenu } = websitePanels;
      expect(() => createAndInsertMenu("desktop-menu")).not.toThrow();

      document.body.innerHTML = `
        <div class="website-content" style="height:100vh">
          <section>first panel</section>
          <section>second panel</section>
          <section>third panel</section>
        </div>`;

      expect(() => createAndInsertMenu(undefined)).toThrow();
      expect(() => createAndInsertMenu("fake-menu")).toThrow();
      expect(() => createAndInsertMenu("desktop-menu")).toThrow();
    });
    test("it should insert the menu, one element per section with the section name as title", () => {
      const { createAndInsertMenu } = websitePanels;
      const itemsName = ["first", "second", "third"];

      createAndInsertMenu("desktop-menu");

      const menuItems = Array.from(
        document.getElementsByClassName("desktop-menu")[0].childNodes
      );

      expect(menuItems.length).toBe(3);
      expect(websitePanels.hasMenu).toBeTruthy();
      menuItems.forEach((menuItem, index) => {
        expect(menuItem.getAttribute("title")).toEqual(itemsName[index]);
      });
    });
  });
  describe("_updateMenuOnScroll", () => {
    beforeEach(() => {
      websitePanels.createAndInsertMenu("desktop-menu");

      // for more explaination about jest timer: https://stackoverflow.com/questions/52673682/how-do-i-test-promise-delays-with-jest
      jest.useFakeTimers();
    });
    afterEach(() => {
      jest.useRealTimers();
    });

    test("it should be defined", () =>
      expect(websitePanels._updateMenuOnScroll).toBeDefined());
    test("it should be a function", () =>
      expect(typeof websitePanels._updateMenuOnScroll).toBe("function"));
    test("it should throw an error if the nbPanelToScroll is invalid (undefined or > nbTotalOfPanel)", () => {
      const { _updateMenuOnScroll, SCROLL_DIRECTIONS } = websitePanels;
      websitePanels.createAndInsertMenu("desktop-menu");
      expect(() =>
        _updateMenuOnScroll(undefined, SCROLL_DIRECTIONS.down)
      ).toThrow();
      expect(() => _updateMenuOnScroll(-1, SCROLL_DIRECTIONS.down)).toThrow();
      expect(() => _updateMenuOnScroll(4, SCROLL_DIRECTIONS.down)).toThrow();
      expect(() => _updateMenuOnScroll(1, SCROLL_DIRECTIONS.up)).not.toThrow();
    });
    test("it should throw an error if the direction is not in SCROLL_DIRECTIONS enum", () => {
      const { _updateMenuOnScroll, _scroll, SCROLL_DIRECTIONS } = websitePanels;

      expect(() => _updateMenuOnScroll(1, 42)).toThrow();
      expect(() => _updateMenuOnScroll(1, "random")).toThrow();
      expect(() => _updateMenuOnScroll(1, SCROLL_DIRECTIONS.up)).not.toThrow();
    });
    test("it should active the n-1 element if the scroll direction is up", async () => {
      const { _updateMenuOnScroll, _scroll, SCROLL_DIRECTIONS } = websitePanels;
      const waitForScroll = () =>
        new Promise((resolve) => setTimeout(() => resolve(), 1000));
      let menuItems = null;

      // down one time to be able to up after
      _scroll(1, SCROLL_DIRECTIONS.down);

      // wait for the animation finish
      jest.advanceTimersByTime(1000);
      await Promise.resolve();

      menuItems = Array.from(
        document.getElementsByClassName("desktop-menu__item")
      );

      expect(
        menuItems[1].classList.contains("desktop-menu__item--active")
      ).toBeTruthy();

      _updateMenuOnScroll(1, SCROLL_DIRECTIONS.up);

      menuItems = Array.from(
        document.getElementsByClassName("desktop-menu__item")
      );

      expect(
        menuItems[2].classList.contains("desktop-menu__item--active")
      ).toBeTruthy();
    });
  });
  describe("_determineScrollDirection", () => {
    test("it should be defined", () =>
      expect(websitePanels._determineScrollDirection).toBeDefined());
    test("it should be a function", () =>
      expect(typeof websitePanels._determineScrollDirection).toBe("function"));
    test("it should throw an error if deltaY parameter is not a number", () => {
      const { _determineScrollDirection } = websitePanels;
      expect(() => _determineScrollDirection(undefined)).toThrow();
      expect(() => _determineScrollDirection("hello there !")).toThrow();
      expect(() => _determineScrollDirection(42)).not.toThrow();
    });
    test("it should return a string representing the scroll direction", () => {
      const { _determineScrollDirection, SCROLL_DIRECTIONS } = websitePanels;
      expect(typeof _determineScrollDirection(42)).toBe("string");
      expect(_determineScrollDirection(-42)).toEqual(SCROLL_DIRECTIONS.up);
      expect(_determineScrollDirection(42)).toEqual(SCROLL_DIRECTIONS.down);
    });
  });

  describe("_scroll", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });
    afterEach(() => {
      jest.useRealTimers();
    });

    test("it should be defined", () =>
      expect(websitePanels._scroll).toBeDefined());
    test("it should be a function", () =>
      expect(typeof websitePanels._scroll).toBe("function"));
    test("it should throw an error if the current panel cannot be retrieved from the DOM", () => {
      const { _scroll, SCROLL_DIRECTIONS } = websitePanels;

      expect(() => _scroll(1, SCROLL_DIRECTIONS.up)).not.toThrow();

      document.body.innerHTML = ``;

      expect(() => _scroll(1, SCROLL_DIRECTIONS.up)).toThrow();
    });
    test("it should throw an error if the direction is not in SCROLL_DIRECTIONS enum", () => {
      const { _scroll, SCROLL_DIRECTIONS } = websitePanels;

      expect(() => _scroll(1, 42)).toThrow();
      expect(() => _scroll(1, "random")).toThrow();
      expect(() => _scroll(1, SCROLL_DIRECTIONS.up)).not.toThrow();
      expect(() => _scroll(1, SCROLL_DIRECTIONS.down)).not.toThrow();
      // the scrollDirection parameter is SCROLL_DIRECTIONS.down by default
      expect(() => _scroll(1)).not.toThrow();
    });
    test("it should throw an error if the number of panel to scroll is not a number", () => {
      const { _scroll } = websitePanels;

      expect(() => _scroll(undefined)).toThrow();
      expect(() => _scroll("42")).toThrow();
      expect(() => _scroll(1)).not.toThrow();
    });
    test("it should scroll down if the scroll direction is down and update the status", async () => {
      const { _scroll, SCROLL_DIRECTIONS } = websitePanels;
      const panelIndexBeforeScroll = websitePanels.currentPanelIndex;
      const nbPanelToScroll = 1;
      const waitForScroll = () =>
        new Promise((resolve) => setTimeout(() => resolve(), 1000));

      _scroll(nbPanelToScroll, SCROLL_DIRECTIONS.down);

      // wait for the animation finish
      jest.advanceTimersByTime(1000);
      await Promise.resolve();

      const mainContainer =
        document.getElementsByClassName("website-content")[0];
      expect(websitePanels.currentPanelIndex).not.toEqual(
        panelIndexBeforeScroll
      );
      expect(websitePanels.currentPanelIndex).toEqual(
        panelIndexBeforeScroll + nbPanelToScroll
      );
      // it translate -100vh to go to the second panel
      expect(mainContainer.style.transform).toEqual(`translateY(-100vh)`);
    });
    test("it should scroll up if the scroll direction is up and update the status", async () => {
      const { _scroll, SCROLL_DIRECTIONS } = websitePanels;
      let panelIndexBeforeScroll = null;
      const nbPanelToScroll = 1;
      const waitForScroll = () =>
        new Promise((resolve) => setTimeout(() => resolve(), 1000));

      // scroll down one time to be able to scroll up
      _scroll(nbPanelToScroll, SCROLL_DIRECTIONS.down);

      // wait for the animation finish
      jest.advanceTimersByTime(1000);
      await Promise.resolve();

      // the system is now scroll at the second panel
      panelIndexBeforeScroll = websitePanels.currentPanelIndex;

      _scroll(nbPanelToScroll, SCROLL_DIRECTIONS.up);

      // wait for the animation finish
      jest.advanceTimersByTime(1000);
      await Promise.resolve();

      const mainContainer =
        document.getElementsByClassName("website-content")[0];
      expect(websitePanels.currentPanelIndex).not.toEqual(
        panelIndexBeforeScroll
      );
      expect(websitePanels.currentPanelIndex).toEqual(
        panelIndexBeforeScroll - nbPanelToScroll
      );
      // it translate to 0 on y to go to the first panel
      expect(mainContainer.style.transform).toEqual(`translateY(0vh)`);
    });

    test("it should update the menu if this one exist", async () => {
      const { _scroll, SCROLL_DIRECTIONS } = websitePanels;
      websitePanels._updateMenuOnScroll = jest.fn();
      const waitForScroll = () =>
        new Promise((resolve) => setTimeout(() => resolve(), 1000));

      _scroll(1, SCROLL_DIRECTIONS.down);

      // wait for the animation finish
      jest.advanceTimersByTime(1000);
      await Promise.resolve();

      // the menu does not exist the function don't update the menu
      expect(websitePanels._updateMenuOnScroll).not.toHaveBeenCalled();

      websitePanels.createAndInsertMenu("desktop-menu");
      _scroll(1, SCROLL_DIRECTIONS.up);

      // wait for the animation finish
      jest.advanceTimersByTime(1000);
      await Promise.resolve();

      expect(websitePanels._updateMenuOnScroll).toHaveBeenCalled();
    });

    test("it should not scroll up if the current panel is the first one", () => {
      const { _scroll, SCROLL_DIRECTIONS } = websitePanels;
      const panelIndexBeforeScroll = websitePanels.currentPanelIndex;
      const nbPanelToScroll = 1;

      _scroll(nbPanelToScroll, SCROLL_DIRECTIONS.up);

      // no scroll here the panel don't move
      expect(websitePanels.currentPanelIndex).toEqual(panelIndexBeforeScroll);
    });

    test("it should not scroll down if the current panel is the last one", async () => {
      const { _scroll, SCROLL_DIRECTIONS } = websitePanels;
      const waitForScroll = () =>
        new Promise((resolve) => setTimeout(() => resolve(), 3000));

      // scroll to the last panel
      _scroll(2, SCROLL_DIRECTIONS.down);

      // wait for the animation finish
      jest.advanceTimersByTime(1000);
      await Promise.resolve();

      const panelIndexBeforeScroll = websitePanels.currentPanelIndex;
      // try to scroll down again but it cannot do it
      _scroll(1, SCROLL_DIRECTIONS.down);

      // wait for the animation finish
      jest.advanceTimersByTime(1000);
      await Promise.resolve();

      // no scroll here the panel don't move
      expect(websitePanels.currentPanelIndex).toEqual(panelIndexBeforeScroll);
    });
  });
});
