// show contact details on click
document.addEventListener("DOMContentLoaded", () => {
  // show telephone in contact section
  document.querySelector("#show-telephone button ").onclick = function (ev) {
    ev.preventDefault();
    ev.target.style.display = "none";

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

  // show email in contact section
  document.querySelector("#show-email button ").onclick = function (ev) {
    ev.preventDefault();
    ev.target.style.display = "none";

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
  document
    .querySelectorAll(".telephone-dropdown")
    .forEach(elem => elem.addEventListener("click", telephoneToHref));
  document
    .querySelectorAll(".email-dropdown")
    .forEach(elem => elem.addEventListener("click", emailToHref));

  // Copy buttons for emails and phones
  function copyInfo(ev) {
    const text = ev.currentTarget.parentElement.querySelector("a").textContent;
    navigator.clipboard.writeText(text);
  }
  document.querySelectorAll(".copy-btn").forEach(btn => {
    btn.addEventListener("click", copyInfo);
  });
});
