/* eslint-disable */

import Menu from "../menu";

describe("Menu module: manage an hamburger menu", () => {
  let fakeMenu = null;

  beforeEach(() => {
    document.body.innerHTML = `
    <nav>
    <div class="mobile-menu">
      <div class="mobile-menu__bars">
        <span class="mobile-menu__bar mobile-menu__bar--open-transition"></span>
        <span class="mobile-menu__bar mobile-menu__bar--open-transition"></span>
        <span class="mobile-menu__bar mobile-menu__bar--open-transition"></span>
      </div>
    </div>
    </nav>

    <div class="mobile-menu-overlay">
      <div class="mobile-menu-overlay__content">
        <a class="mobile-menu-overlay__element mobile-menu-overlay__element--active" href="#home" id="anchor-element">Home</a>
        <a class="mobile-menu-overlay__element mobile-menu-overlay__element--blur" href="index.html#aboutme" id="anchorandfile-element">About Me</a>
        <a class="mobile-menu-overlay__element mobile-menu-overlay__element--blur" href="./legal-notice.html" id="file-element">Legal Notice</a>
      </div>
    </div>
    `;

    fakeMenu = new Menu();
  });

  describe("Menu constructor", () => {
    test("it should be defined", () => expect(Menu).toBeDefined());
    test("it should be a class (function)", () =>
      expect(typeof Menu).toBe("function"));
    test("it should check the main menu element exist and throw error if it is not found into the DOM", () => {
      expect(() => new Menu()).not.toThrow();

      document.body.innerHTML = `
        <nav>
        <div class="mobile-menu">
        </div>
        </nav>

        <div class="mobile-menu-overlay">
          <div class="mobile-menu-overlay__content">
            <a class="mobile-menu-overlay__element mobile-menu-overlay__element--active" href="#home" id="anchor-element">Home</a>
            <a class="mobile-menu-overlay__element mobile-menu-overlay__element--blur" href="index.html#aboutme" id="anchorandfile-element">About Me</a>
            <a class="mobile-menu-overlay__element mobile-menu-overlay__element--blur" href="./legal-notice.html" id="file-element">Legal Notice</a>
          </div>
        </div>
      `;

      expect(() => new Menu()).toThrow();
    });
    test("it should check if the overlay element with menu content exist and throw an error if it is not found into the DOM", () => {
      expect(() => new Menu()).not.toThrow();

      document.body.innerHTML = `
        <nav>
        <div class="mobile-menu">
          <div class="mobile-menu__bars">
            <span class="mobile-menu__bar mobile-menu__bar--open-transition"></span>
            <span class="mobile-menu__bar mobile-menu__bar--open-transition"></span>
            <span class="mobile-menu__bar mobile-menu__bar--open-transition"></span>
          </div>
        </div>
        </nav>
      `;

      expect(() => new Menu()).toThrow();
    });
  });

  describe("setEventListener", () => {
    test("it should be defined", () =>
      expect(fakeMenu.setEventListener).toBeDefined());
    test("it should be a function", () =>
      expect(typeof fakeMenu.setEventListener).toBe("function"));
    test("it should throw an error if the menu has no elements", () => {
      expect(() => fakeMenu.setEventListener()).not.toThrow();

      document.body.innerHTML = `
        <nav>
          <div class="mobile-menu">
            <div class="mobile-menu__bars">
              <span class="mobile-menu__bar mobile-menu__bar--open-transition"></span>
              <span class="mobile-menu__bar mobile-menu__bar--open-transition"></span>
              <span class="mobile-menu__bar mobile-menu__bar--open-transition"></span>
            </div>
          </div>
        </nav>

        <div class="mobile-menu-overlay">
          <div class="mobile-menu-overlay__content">
          </div>
        </div>
      `;

      fakeMenu = new Menu();

      expect(() => fakeMenu.setEventListener()).toThrow();
    });
    test("it should determine and set the callback event to apply for each menu elements", () => {
      const { setEventListener, menu, menuItems } = fakeMenu;
      const fakeAddEventListener = jest.fn();
      const fakeDetermineMenuElement = jest.fn();

      fakeMenu._determineMenuElementClickEvent = fakeDetermineMenuElement;

      menu.addEventListener = fakeAddEventListener;
      menuItems.forEach((element) => {
        element.addEventListener = fakeAddEventListener;
      });

      setEventListener();

      // it apply event listener on the menu icon and on each menu items
      expect(fakeAddEventListener.mock.calls.length).toEqual(
        menuItems.length + 1
      );
      expect(fakeDetermineMenuElement.mock.calls.length).toEqual(
        menuItems.length
      );
    });
    test("it should set a scroll event listener, to update the active element when scrolling, if the scrollUpdate is true", () => {
      const fakeAddEventListener = jest.fn();

      document.addEventListener = fakeAddEventListener;

      const { setEventListener } = fakeMenu;

      setEventListener(true);

      expect(fakeAddEventListener).toHaveBeenCalled();
    });

    test("it should not set a scroll event listener if the scrollUpdate is falsy", () => {
      const fakeAddEventListener = jest.fn();

      document.addEventListener = fakeAddEventListener;

      const { setEventListener } = fakeMenu;

      setEventListener();

      expect(fakeAddEventListener).not.toHaveBeenCalled();
    });
  });

  describe("_toogleMenu", () => {
    test("it should switch css classes for overlay element to open/close the menu", async () => {
      const { _toogleMenu } = fakeMenu;

      // for more explaination about jest timer: https://stackoverflow.com/questions/52673682/how-do-i-test-promise-delays-with-jest
      jest.useFakeTimers();

      // the menu is closed
      let menuisOpen = document.getElementsByClassName(
        "mobile-menu-overlay--open"
      )[0];
      expect(menuisOpen).toBeFalsy();

      // open the menu
      _toogleMenu();

      // wait for the animation finish
      jest.advanceTimersByTime(301);
      await Promise.resolve();

      // check the menu is now open
      menuisOpen = document.getElementsByClassName(
        "mobile-menu-overlay--open"
      )[0];
      expect(menuisOpen).toBeTruthy();

      // close the menu and wait the animation is finish
      _toogleMenu();

      // wait for the animation finish
      jest.advanceTimersByTime(301);
      await Promise.resolve();

      // check the menu is now closed
      menuisOpen = document.getElementsByClassName(
        "mobile-menu-overlay--open"
      )[0];
      expect(menuisOpen).toBeFalsy();

      jest.useRealTimers();
    });
  });

  describe("_determineMenuElementClickEvent", () => {
    test("it should throw an error if the target href is not a file or an anchor", () => {
      const { _determineMenuElementClickEvent } = fakeMenu;
      const invalidMenuElement = document.getElementById("invalid");

      document.body.innerHTML = `
      <nav>
        <div class="mobile-menu">
          <div class="mobile-menu__bars">
            <span class="mobile-menu__bar mobile-menu__bar--open-transition"></span>
            <span class="mobile-menu__bar mobile-menu__bar--open-transition"></span>
            <span class="mobile-menu__bar mobile-menu__bar--open-transition"></span>
          </div>
        </div>
      </nav>

      <div class="mobile-menu-overlay">
        <div class="mobile-menu-overlay__content">
          <a class="mobile-menu-overlay__element mobile-menu-overlay__element--blur" href="hackerman" id="invalid">FAKE!</a>
        </div>
      </div>
    `;

      expect(() =>
        _determineMenuElementClickEvent(invalidMenuElement)
      ).toThrow();
    });
    test("it should check if the target href is an anchor and return the _onMobileMenuElementAnchorClickEvent callback", () => {
      const {
        _determineMenuElementClickEvent,
        _onMobileMenuElementAnchorClickEvent,
      } = fakeMenu;
      const anchorMenuElement = document.getElementById("anchor-element");

      const clickEventCallback =
        _determineMenuElementClickEvent(anchorMenuElement);

      expect(clickEventCallback).toEqual(_onMobileMenuElementAnchorClickEvent);
    });

    test("it should check if the target href is a html filename concatenated to an anchor and return the _onMobileMenuElementAnchorClickEvent callback", () => {
      const {
        _determineMenuElementClickEvent,
        _onMobileMenuElementAnchorClickEvent,
      } = fakeMenu;
      const anchorAndFileElement = document.getElementById(
        "anchorandfile-element"
      );

      const clickEventCallback =
        _determineMenuElementClickEvent(anchorAndFileElement);

      expect(clickEventCallback).toEqual(_onMobileMenuElementAnchorClickEvent);
    });

    test("it should check if the target href is an html file and return the _onMobileMenuElementPageClickEvent callback", () => {
      const {
        _determineMenuElementClickEvent,
        _onMobileMenuElementPageClickEvent,
      } = fakeMenu;
      const fileElement = document.getElementById("file-element");

      const clickEventCallback = _determineMenuElementClickEvent(fileElement);

      expect(clickEventCallback).toEqual(_onMobileMenuElementPageClickEvent);
    });
  });

  describe("_updateActiveElement", () => {
    test("it should be defined", () =>
      expect(fakeMenu._updateActiveElement).toBeDefined());
    test("it should be a function", () =>
      expect(typeof fakeMenu._updateActiveElement).toBe("function"));
    test("it should throw an error if the element to update is not a DOM element", () => {
      const { _updateActiveElement } = fakeMenu;
      const fakeMenuElement = document.createElement("A");
      expect(() => _updateActiveElement(undefined)).toThrow();
      expect(() => _updateActiveElement("Hello There !").toThrow());
      expect(() => _updateActiveElement(fakeMenuElement)).not.toThrow();
    });
    test("it should change the active element of the menu", () => {
      const { _updateActiveElement } = fakeMenu;
      const aboutMeInactiveElement = document.getElementById(
        "anchorandfile-element"
      );
      const homeActiveElement = document.getElementById("anchor-element");

      expect(
        aboutMeInactiveElement.classList.contains(
          "mobile-menu-overlay__element--active"
        )
      ).toBeFalsy();
      expect(
        homeActiveElement.classList.contains(
          "mobile-menu-overlay__element--active"
        )
      ).toBeTruthy();

      _updateActiveElement(aboutMeInactiveElement);

      const activeAboutMeElement = document.getElementById(
        "anchorandfile-element"
      );
      const homeInactiveElement = document.getElementById("anchor-element");

      expect(
        activeAboutMeElement.classList.contains(
          "mobile-menu-overlay__element--active"
        )
      ).toBeTruthy();
      expect(
        homeInactiveElement.classList.contains(
          "mobile-menu-overlay__element--active"
        )
      ).toBeFalsy();
    });
  });
});
