// Creates and appends contact details elements whenever needed (not on page by default to protect from spam)
// Adds contact details to the copy buttons
document.addEventListener("DOMContentLoaded", () => {
  showAddress();
  showEmail();
  showTelephone();

  // Dropdown
  document
    .querySelectorAll(".telephone-dropdown")
    .forEach(elem => elem.addEventListener("click", telephoneToHref));
  document
    .querySelectorAll(".email-dropdown")
    .forEach(elem => elem.addEventListener("click", emailToHref));
  // Copy button
  document.querySelectorAll(".copy-btn").forEach(btn => {
    btn.addEventListener("click", copyInfo);
  });
  // Show address in contact sectio
  function showAddress(ev) {
    document.querySelector("#show-address button ").onclick = function (ev) {
      ev.preventDefault();
      ev.target.style.position = "absolute";
      ev.target.style.top = "-4000px";

      const title =
        languageController.content[languageController.currentLanguage][
          "contact-address-title"
        ];
      const address =
        languageController.content[languageController.currentLanguage][
          "contact-address-text"
        ];
      // Description
      const span = document.createElement("span");
      span.classList.add("fw-bold", "me-2");
      span.dataset.key = "contact-address-title";
      span.textContent = title;

      // Span
      const span2 = document.createElement("span");
      const text =
        languageController.content[languageController.currentLanguage][
          "contact-address-text"
        ];
      span2.dataset.key = "contact-address-text";
      span2.textContent = text;
      ev.target.parentElement.appendChild(span);
      ev.target.parentElement.appendChild(span2);
    };
  }

  // Show telephone in contact section
  function showEmail(ev) {
    document.querySelector("#show-telephone button ").onclick = function (ev) {
      ev.preventDefault();
      ev.target.style.position = "absolute";
      ev.target.style.top = "-4000px";

      const title =
        languageController.content[languageController.currentLanguage][
          "contact-telephone-title"
        ];
      const tel =
        languageController.content[languageController.currentLanguage][
          "contact-telephone-text"
        ];
      // Description
      const span = document.createElement("span");
      span.classList.add("fw-bold", "me-2");
      span.dataset.key = "contact-telephone-title";
      span.textContent = title;

      // Link
      const a = document.createElement("a");

      a.classList.add("link-dark");
      a.title = "Call";
      a.dataset.key = "contact-telephone-text";
      a.href = `tel: ${tel}`;
      a.textContent = tel;

      // Span
      const span2 = document.createElement("span");
      const text =
        languageController.content[languageController.currentLanguage][
          "contact-telephone-details"
        ];
      span2.dataset.key = "contact-telephone-details";
      span2.textContent = text;
      ev.target.parentElement.appendChild(span);
      ev.target.parentElement.appendChild(a);
      ev.target.parentElement.appendChild(span2);
    };
  }

  // Show email in contact section
  function showTelephone(ev) {
    document.querySelector("#show-email button ").onclick = function (ev) {
      ev.preventDefault();
      ev.target.style.position = "absolute";
      ev.target.style.top = "-4000px";

      const email =
        languageController.content[languageController.currentLanguage][
          "contact-email-text"
        ];
      const title =
        languageController.content[languageController.currentLanguage][
          "contact-email-title"
        ];
      // Description
      const span = document.createElement("span");
      span.classList.add("fw-bold", "me-2");
      span.dataset.key = "contact-email-title";
      span.textContent = title;

      // Link
      const a = document.createElement("a");
      a.classList.add("link-dark");
      a.title = "Call";
      a.dataset.key = "contact-email-text";
      a.href = `mailto:${email}`;
      a.textContent = email;
      ev.target.parentElement.appendChild(span);
      ev.target.parentElement.appendChild(a);
    };
  }

  // attach href phone to header and footer
  function telephoneToHref(ev) {
    ev.currentTarget
      .querySelectorAll([".tel-link"])
      .forEach(a => (a.href = `tel: ${a.textContent}`));
  }

  // attach href email to header and footer
  function emailToHref(ev) {
    ev.currentTarget.querySelectorAll([".mail-link"]).forEach(a => {
      a.href = `mailto:${a.textContent}`;
    });
  }

  // Copy buttons for emails and phones
  function copyInfo(ev) {
    const text = ev.currentTarget.parentElement.querySelector("a").textContent;
    navigator.clipboard.writeText(text);
  }
});
