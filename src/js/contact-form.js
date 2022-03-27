import NotificationCenter from "./NotificationCenter";
import { fetcher, loadConfigFile } from "./utils";
import apiUrlsConfig from "./config/api-urls.json";

const BUTTON_LOADING_LABEL = "Sending";
const BUTTON_LABEL = "Send";

const notificationCenter = new NotificationCenter("snackbar", 5000);
const notificationCenterButton =
  document.getElementsByClassName("snackbar__action")[0];
notificationCenterButton.addEventListener("click", () =>
  notificationCenter.dismiss()
);

export function adjustTextAreaByContent(element) {
  element.style.height = "20px";
  element.style.height = element.scrollHeight + "px";
}

const CONTACT_SUBJECT = {
  question: "Ask a question ",
  job: "Job proposal",
  opensource: "Open source contribution",
};

export async function submitContactForm(event) {
  const form = document.getElementById("contact-form");

  if (form.checkValidity()) {
    event.preventDefault();
    const name = document.getElementsByName("name")[0].value;
    const email = document.getElementsByName("email")[0].value;
    const subject = document.getElementsByName("subject")[0].value;
    const message = document.getElementsByName("message")[0].value;

    const submitButton = document.getElementsByClassName("submit-contact")[0];
    const submitButtonLabel =
      document.getElementsByClassName("btn__content")[0];

    submitButton.disabled = true;
    submitButton.classList.toggle("button--loading");
    submitButtonLabel.innerHTML = BUTTON_LOADING_LABEL;

    const apiUrls = await loadConfigFile(apiUrlsConfig);

    return fetcher(apiUrls.submit_contact_form_https_url, {
      name,
      email,
      subject: CONTACT_SUBJECT[subject],
      message,
    })
      .then((res) => {
        submitButton.classList.toggle("button--loading");
        submitButtonLabel.innerHTML = BUTTON_LABEL;
        notificationCenter.success(res.successMessage).then(() => {
          submitButton.disabled = false;
        });
        form.reset();
      })
      .catch((err) => {
        submitButton.classList.toggle("button--loading");
        submitButtonLabel.innerHTML = BUTTON_LABEL;
        notificationCenter.error(err.serverResponse.errorMessage).then(() => {
          submitButton.disabled = false;
        });
      });
  }
}
