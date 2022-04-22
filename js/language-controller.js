// Fetches and adds content to the website based on default or preferred language
// Keeps language buttons in sync

class LanguageController {
  constructor() {
    this.langElements = [];
    this.currentLanguage = localStorage.getItem("preferred-language") || navigator.language.substring(0, 2);
    this.content = null;
    this.changeLangCallbacks = [];

    // applyLangToPage page upon loading all elements
    document.addEventListener("DOMContentLoaded", () => {
      this.applyLangToPage();
    });
  }

  // fetch content and apply on page based on language
  async applyLangToPage() {
    const language = this.currentLanguage;
    // in preferred language does not exist in our database - fetch english
    try {
      this.content = await fetch(`./languages/${language}.json`).then(resp => resp.json());
      document.querySelectorAll("[data-key]").forEach(container => {
        container.innerHTML = this.content[language][container.dataset.key];
      });
    } catch {
      content = await fetch(`./languages/en.json`).then(resp => resp.json());
      document.querySelectorAll("[data-key]").forEach(container => {
        container.innerHTML = this.content.en[container.dataset.key];
      });
    }
  }
  // For other elements that need to know change of language
  subscribeChangeLangCallback(fun) {
    this.changeLangCallbacks.push(fun);
  }

  subscribeElement(selector) {
    const element = document.querySelector(selector);
    element.querySelectorAll("li").forEach(li => li.addEventListener("click", ev => this.changeLanguage(ev)));
    // add spans inside button
    const btn = element.querySelector(".lang-select-button");
    // Set the inner HTML of the button to match the dropdown button (corresponding to the default language)
    btn.innerHTML = "";
    btn.innerHTML = element.querySelector(`[data-lang="${this.currentLanguage}"]`).innerHTML;
    this.langElements.push(element);
  }
  async changeLanguage(ev) {
    localStorage.setItem("preferred-language", ev.currentTarget.dataset.lang);
    this.currentLanguage = ev.currentTarget.dataset.lang;
    this.syncElements(ev);
    await this.applyLangToPage();
    this.changeLangCallbacks.forEach(fun => {
      fun(this.content[this.currentLanguage]);
    });
  }
  syncElements(ev) {
    ev.preventDefault();

    this.langElements.forEach(
      elem => (elem.querySelector(".lang-select-button").innerHTML = ev.currentTarget.innerHTML)
    );
  }
}

const languageController = new LanguageController();

// In case JSON content is not fetched on initial load (this occured in a few browsers)

// Wait 3.5s and try to fetch
setTimeout(() => {
  if (!languageController.content) languageController.applyLangToPage();
}, 3500);
// Wait 7s and try to fetch
setTimeout(() => {
  if (!languageController.content) languageController.applyLangToPage();
}, 7000);
// Wait 15s and refresh
setTimeout(() => {
  if (!languageController.content) window.location.reload();
}, 15000);
