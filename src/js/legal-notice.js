import "../css/main.css";

import Menu from "./menu";

// Scripts for legal-notice.html

console.info("**************************************************");
console.info("* ColorSpace Developer Portfolio / Legal Notice  *");
console.info("**************************************************");

const menu = new Menu();
menu.setEventListener();

const header = document.getElementsByClassName("header")[0];
header.addEventListener("click", () => {
  window.location.href = "./index.html";
});
