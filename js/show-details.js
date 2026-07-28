// Reveals the contact details already rendered into the localized page.

document.addEventListener("DOMContentLoaded", () => {
  const revealContact = triggerId => {
    const trigger = document.getElementById(triggerId);
    if (!trigger) return;

    trigger.addEventListener("click", event => {
      const button = event.currentTarget.querySelector("button");
      const address = event.currentTarget.parentElement.querySelector("address");

      if (button) button.style.position = "absolute";
      if (address) address.style.position = "static";
    });
  };

  const getContactText = contactId => {
    const contactElement = [
      ...document.querySelectorAll(`[data-contact="${contactId}"]`),
    ].find(element => element.textContent.trim());

    return contactElement?.textContent.trim() || "";
  };

  const copyText = async text => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.setAttribute("readonly", "");
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.append(textArea);
      textArea.select();
      document.execCommand("copy");
      textArea.remove();
    }
  };

  document.querySelectorAll(".copy-btn[data-contact]").forEach(button => {
    button.addEventListener("click", () =>
      copyText(getContactText(button.dataset.contact))
    );
  });

  revealContact("show-address");
  revealContact("show-email");
  revealContact("show-tel");
});
