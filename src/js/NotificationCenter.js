import { timeout } from "./utils";

const DEFAULT_MESSAGE_EXPIRATION = 1000;
const EMPTY_MESSAGE = "[NO MESSAGE]";

class NotificationCenter {
  constructor(className, messageTimeout) {
    if (!className)
      throw new Error(
        `[NotificationCenter] you have to provide a class name to retrieve the notification center HTML element into the DOM, got ${className}`
      );
    if (messageTimeout && isNaN(+messageTimeout))
      throw new Error(
        `[NotificationCenter] the messageTimeout parameter should be a number, got ${typeof messageTimeout}`
      );

    this.domElement = document.getElementsByClassName(className)[0];
    this.messageContainer = document.getElementsByClassName(
      `${className}__message`
    )[0];

    if (!this.domElement)
      throw new Error(
        `[NotificationCenter] cannot find element with className:${className} into the DOM, cannot initialize a notification center`
      );

    if (!messageTimeout) {
      this.messageExpiration = DEFAULT_MESSAGE_EXPIRATION;
    } else {
      this.messageExpiration = messageTimeout;
    }

    this.success = this.success.bind(this);
    this.info = this.info.bind(this);
    this.error = this.error.bind(this);
    this.dismiss = this.dismiss.bind(this);
    this._log = this._log.bind(this);
    this._expireMessage = this._expireMessage.bind(this);
  }

  async success(message) {
    if (!message || typeof message !== "string")
      throw new Error(
        `[NotificationCenter - success] the message is not defined or is not a string, got ${typeof message}`
      );
    this._log(message);

    this.domElement.classList.toggle("snackbar--success");
    this.domElement.classList.toggle("snackbar__show");

    await this._expireMessage();

    if (this.domElement.classList.contains("snackbar__show")) {
      this.domElement.classList.toggle("snackbar__show");
    }

    // wait for the animaion finish before cleaning our element
    await timeout(500);
    this.domElement.classList.toggle("snackbar--success");
    this.messageContainer.innerHTML = "";
  }

  async info(message) {
    if (!message || typeof message !== "string")
      throw new Error(
        `[NotificationCenter - info] the message is not defined or is not a string, got ${typeof message}`
      );
    this._log(message);

    this.domElement.classList.toggle("snackbar--info");
    this.domElement.classList.toggle("snackbar__show");

    await this._expireMessage();

    if (this.domElement.classList.contains("snackbar__show")) {
      this.domElement.classList.toggle("snackbar__show");
    }

    // wait for the animaion finish before cleaning our element
    await timeout(500);
    this.domElement.classList.toggle("snackbar--info");
    this.messageContainer.innerHTML = "";
  }

  async error(message) {
    if (!message || typeof message !== "string")
      throw new Error(
        `[NotificationCenter - error] the message is not defined or is not a string, got ${typeof message}`
      );
    this._log(message);

    this.domElement.classList.toggle("snackbar--error");
    this.domElement.classList.toggle("snackbar__show");

    await this._expireMessage();

    if (this.domElement.classList.contains("snackbar__show")) {
      this.domElement.classList.toggle("snackbar__show");
    }

    // wait for the animaion finish before cleaning our element
    await timeout(500);
    this.domElement.classList.toggle("snackbar--error");
    this.messageContainer.innerHTML = "";
  }

  dismiss() {
    this.domElement.classList.toggle("snackbar__show");
  }

  _log(message) {
    const messageToDisplay = message === "" ? EMPTY_MESSAGE : message;

    if (!messageToDisplay || typeof messageToDisplay !== "string")
      throw new Error(
        `[NotificationCenter - _log] the message is not defined or is not a string, got ${message}`
      );

    this.messageContainer.innerHTML = messageToDisplay;
  }

  _expireMessage() {
    const waitingTime = this.messageExpiration || DEFAULT_MESSAGE_EXPIRATION;
    return timeout(waitingTime);
  }
}

export default NotificationCenter;
