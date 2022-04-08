class ContactController {
  constructor(langData) {
    this["address-1"] = {
      title: langData["contact-address-title"],
      button: langData["contact-address-button"],
      text: langData["contact-address-text-1"],
    };
    this["email-1"] = {
      title: langData["contact-email-title"],
      button: langData["contact-email-button"],
      text: langData["contact-email-text-1"],
    };
    this["tel-1"] = {
      title: langData["contact-telephone-title"],
      button: langData["contact-telephone-button"],
      text: langData["contact-telephone-text-1"],
      details: langData["contact-telephone-details-1"],
    };
    this["tel-2"] = {
      title: langData["contact-telephone-title"],
      button: langData["contact-telephone-button"],
      text: langData["contact-telephone-text-2"],
      details: langData["contact-telephone-details-2"],
    };
  }
  update(langData) {
    this["address-1"] = {
      title: langData["contact-address-title"],
      button: langData["contact-address-button"],
      text: langData["contact-address-text-1"],
    };
    this["email-1"] = {
      title: langData["contact-email-title"],
      button: langData["contact-email-button"],
      text: langData["contact-email-text-1"],
    };
    this["tel-1"] = {
      title: langData["contact-telephone-title"],
      button: langData["contact-telephone-button"],
      text: langData["contact-telephone-text-1"],
      details: langData["contact-telephone-details-1"],
    };
    this["tel-2"] = {
      title: langData["contact-telephone-title"],
      button: langData["contact-telephone-button"],
      text: langData["contact-telephone-text-2"],
      details: langData["contact-telephone-details-2"],
    };
  }

  // Add event listeners to populate the fields
  init() {
    // Add listener on email dropdown button
    document.querySelectorAll(".dropdown-email-btn").forEach(btn => {
      // populate email text content
      btn.addEventListener("click", () => {
        btn.parentElement.querySelectorAll("a").forEach(a => {
          this.populateDropdownEmail(a);
          this.populateCopyBtn(a.parentElement.querySelector("button"));
        });
      });
    });
    // Add listener on email dropdown button
    document.querySelectorAll(".dropdown-tel-btn").forEach(btn => {
      // populate email text content
      btn.addEventListener("click", () => {
        btn.parentElement.querySelectorAll("a").forEach(a => {
          this.populateDropdownTelephone(a);
          // console.log(a.parentElement.querySelector("button"));
          this.populateCopyBtn(a.parentElement.querySelector("button"));
        });
      });
    });
    // Add listener on address dropdown button
    document.getElementById("show-address").addEventListener("click", ev => {
      ev.currentTarget.querySelector("button").style.position = "absolute";
      const elem = ev.currentTarget.parentElement.querySelector("address");
      this.populateContactAddress(elem);
    });
    // Add listener on email dropdown button
    document.getElementById("show-email").addEventListener("click", ev => {
      ev.currentTarget.querySelector("button").style.position = "absolute";
      const elem = ev.currentTarget.parentElement.querySelector("address");
      this.populateContactEmail(elem);
    });
    // Add listener on telephone dropdown button
    document.getElementById("show-tel").addEventListener("click", ev => {
      ev.currentTarget.querySelector("button").style.position = "absolute";
      const elem = ev.currentTarget.parentElement.querySelector("address");
      this.populateContactTelephone(elem);
    });
  }

  // Populate contect details functions
  populateCopyBtn(elem) {
    elem.onclick = ev =>
      navigator.clipboard.writeText(
        this[ev.currentTarget.dataset.contact].text
      );
  }
  // Dropdown functions
  populateDropdownAddress(elem) {
    elem.textContent = this[elem.dataset.contact].text;
  }
  populateDropdownEmail(elem) {
    elem.textContent = this[elem.dataset.contact].text;
    elem.href = `mailto:${this[elem.dataset.contact].text}`;
  }
  populateDropdownTelephone(elem) {
    elem.textContent = this[elem.dataset.contact].text;
    elem.href = `tel: ${this[elem.dataset.contact].text}`;
  }
  // Contact section functions
  async populateContactAddress(elem) {
    elem.style.position = "static";
    elem.querySelectorAll("[data-contact]").forEach(e => {
      e.textContent = this[e.dataset.contact].text;
      e.dataset.key = e.dataset.keyCopy;
    });
  }
  async populateContactEmail(elem) {
    elem.style.position = "static";
    elem.querySelectorAll("[data-contact]").forEach(e => {
      e.textContent = this[e.dataset.contact].text;
      e.dataset.key = e.dataset.keyCopy;
      e.href = `mailto:${this[e.dataset.contact].text}`;
    });
  }
  async populateContactTelephone(elem) {
    elem.style.position = "static";
    elem.querySelectorAll("[data-contact]").forEach(e => {
      e.textContent = this[e.dataset.contact].text;
      e.dataset.key = e.dataset.keyCopy;
      e.href = `tel: ${this[e.dataset.contact].text}`;
    });
  }
}

// Creates and appends contact details elements whenever needed (not on page by default to protect from spam)
// Adds contact details to the copy buttons
document.addEventListener("DOMContentLoaded", async () => {
  // Gets the content if fetched or keeps checking until fetched
  async function getLangData() {
    if (languageController.content)
      return languageController.content[languageController.currentLanguage];
    else
      return new Promise(res => {
        (function returnLangData() {
          if (!languageController.content) {
            setTimeout(returnLangData, 1000); //wait and then recheck
            return;
          }
          res(languageController.content[languageController.currentLanguage]);
        })();
      });
  }

  // Creates an object with contact details
  const contactController = new ContactController(await getLangData());
  contactController.init();
  // Update contactController on changing the language
  languageController.subscribeChangeLangCallback(
    contactController.update.bind(contactController)
  );
});
