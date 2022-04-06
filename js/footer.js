// Subscribes language button

document.addEventListener("DOMContentLoaded", () => {
  // connect <select> element to language controller
  languageController.subscribeElement("footer .lang-select");

  // Connect map to navigation links in footer
  document.querySelectorAll("footer .link-to-map").forEach(link =>
    link.addEventListener("click", ev => {
      const mapArea = ev.target.dataset.mapArea;
      // click on map if not clicked
      document
        .querySelector(`.map-pin.fill.map-pin${mapArea}:not(.clicked)`)
        ?.click();
    })
  );
});
