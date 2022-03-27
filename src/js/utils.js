import FetchError from "./FetchError";

const HTMLElement = window.HTMLElement;

export function getCurrentScrollPosition() {
  if (!isNaN(window.pageYOffset)) {
    return window.pageYOffset;
  }

  if (document.documentElement && !isNaN(document.documentElement.scrollTop)) {
    return document.documentElement.scrollTop;
  }

  if (document.body && !isNaN(document.body.scrollTop)) {
    return document.body.scrollTop;
  }

  throw new Error(
    "[getCurrentScrollPosition] cannot determine your current scroll position into the DOM"
  );
}

export function extractTargetIdFromElementHref(element) {
  if (!element) {
    throw new Error(
      `[extractTargetIdFromElementHref] the element is not defined, got ${element}`
    );
  }
  if (!(element instanceof HTMLElement)) {
    throw new Error(
      `[extractTargetIdFromElementHref] the element is not a DOM element, got type: ${typeof element}`
    );
  }
  return element.hash.substr(1);
}

export function throttle(func, wait, leading, trailing, context) {
  let ctx = null;
  let args = null;
  let previous = null;
  let timeout = null;
  let result = null;
  const later = () => {
    previous = new Date();
    timeout = null;
    result = func.apply(ctx, args);
  };

  if (!func || typeof func !== "function") {
    throw new Error(
      `[throttle] the first argument has to be a function, got ${typeof func}`
    );
  }
  if (!wait && !isNaN(wait)) {
    throw new Error(
      `[throttle] the wait argument has to be an integer, got ${typeof wait}`
    );
  }

  return function () {
    const now = new Date();
    if (!previous && !leading) previous = now;
    const remainingTime = wait - (now - previous);
    ctx = context || this;
    args = arguments;
    if (remainingTime <= 0) {
      clearTimeout(timeout);
      timeout = null;
      previous = now;
      result = func.apply(ctx, args);
    }
    if (!timeout && trailing) {
      timeout = setTimeout(later, remainingTime);
    }

    return result;
  };
}

export async function fetcher(url, requestBody) {
  const validUrlPattern = new RegExp(
    "^(https:\\/\\/)" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // fragment locator

  if (!url)
    throw new Error(
      "[fetcher] you have to provide an URL to be able to fetch a network endpoint"
    );
  if (!validUrlPattern.test(url))
    throw new Error(
      `[fetcher] the url you provide is not a valid https url, got "${url}"`
    );

  const requestOptions = Object.assign(
    {},
    {
      method: requestBody ? "POST" : "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      mode: "cors",
    },
    { body: JSON.stringify(requestBody) }
  );

  /* eslint-disable-next-line no-undef */
  const response = await fetch(url, requestOptions);

  if (!response.ok) {
    let parsedResponse = null;
    try {
      parsedResponse = await response.json();
    } catch (err) {
      // If an unexpected error or a malformed response is returned,
      // throw an error without any parsed json response.
      throw new FetchError(
        `[fetcher] receive error code ${response.status} from HTTP request`,
        response
      );
    }

    throw new FetchError(
      `[fetcher] receive error code ${response.status} from HTTP request`,
      response,
      parsedResponse
    );
  }

  return response.json();
}

export function iconLoader(selector, loaderOptions, fetchOptions) {
  const DEFAULT_MESSAGE = "loading...";
  const DEFAULT_ERROR_MESSAGE = "an error occured when loading content";

  const { render, message, errorMessage, errorOnClick } = loaderOptions;
  const { fetcher, apiUrl, fetchBody } = fetchOptions;

  if (!selector || selector === "") {
    throw new Error("[iconLoader] the selector/class name is not defined");
  }

  const element = document.querySelector(
    `.${selector} .icon-loader__container`
  );

  if (!(element instanceof HTMLElement)) {
    throw new Error(
      `[iconLoader] cannot find the DOM element with class ${selector}`
    );
  }

  if (typeof render !== "function") {
    throw new Error(
      `[iconLoader] render is not a function got ${typeof render}`
    );
  }

  if (!apiUrl || apiUrl === "") {
    throw new Error(
      "[iconLoader] apiUrl is not defined, need one to fetch api"
    );
  }

  if (typeof fetcher !== "function") {
    throw new Error(
      `[iconLoader] fetcher is not a function, got ${typeof fetcher}`
    );
  }

  // Note: children[1] corresponding to message container
  element.style.display = "flex";
  element.children[1].innerHTML = message || DEFAULT_MESSAGE;

  return fetcher(apiUrl, fetchBody)
    .then((fetchResult) => {
      const elementsToRender = render(fetchResult);
      element.style.display = "none";
      element.children[1].innerHTML = "";
      document.querySelector(`.${selector}`).appendChild(elementsToRender);
    })
    .catch((err) => {
      console.error(err);
      element.children[1].innerHTML = errorMessage || DEFAULT_ERROR_MESSAGE;
      element.classList.toggle("icon-loader__container--error");

      if (errorOnClick) {
        document
          .querySelector(`.${selector} svg`)
          .classList.toggle("icon-loader__container--clickable");
        element.addEventListener("click", errorOnClick);
      }
    });
}

export function timeout(waitingTime) {
  if (isNaN(+waitingTime))
    throw new Error(
      `[timeout] waitingTime parameter should be a number, got value: ${waitingTime}`
    );

  return new Promise((resolve) => setTimeout(() => resolve(), waitingTime));
}

// due to webpack json management we have to parse imported json files
// webpack will return a file, just fetch the content of the imported json file and return a json object
export async function loadConfigFile(filepath) {
  if (!filepath || filepath === "") {
    throw new Error(
      `[loadConfigFile] you should pass a filepath to be able to pase config file content, got ${filepath}`
    );
  }

  /* eslint-disable-next-line no-undef */
  const rawFileContent = await fetch(filepath);

  return rawFileContent.json();
}
