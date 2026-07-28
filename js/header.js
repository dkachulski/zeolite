// Controls the responsive header navigation and language selector.

document.addEventListener("DOMContentLoaded", () => {
  const mobileNavigation = window.matchMedia("(max-width: 767.98px)");
  const menu = document.getElementById("navmenu");
  const menuToggle = document.getElementById("site-navigation-button");
  const menuClose = document.getElementById("site-navigation-close-button");
  const backdrop = document.getElementById("site-navigation-backdrop");
  let returnFocusTo = null;

  if (!menu || !menuToggle || !menuClose || !backdrop) {
    return;
  }

  const focusableSelector = [
    "a[href]",
    "button:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ].join(",");

  const getVisibleFocusableElements = () =>
    [...menu.querySelectorAll(focusableSelector)].filter(
      element => element.getClientRects().length > 0
    );

  const isMenuOpen = () => menu.classList.contains("is-open");

  const setMenuState = (open, restoreFocus = true) => {
    const shouldOpen = open && mobileNavigation.matches;

    menu.classList.toggle("is-open", shouldOpen);
    backdrop.classList.toggle("is-open", shouldOpen);
    document.body.classList.toggle("site-navigation-open", shouldOpen);
    menuToggle.setAttribute("aria-expanded", String(shouldOpen));
    menu.setAttribute(
      "aria-hidden",
      String(mobileNavigation.matches && !shouldOpen)
    );

    if (shouldOpen) {
      returnFocusTo = menuToggle;
      window.setTimeout(() => {
        if (isMenuOpen()) menuClose.focus({ preventScroll: true });
      }, 0);
    } else {
      const focusTarget = returnFocusTo;
      returnFocusTo = null;

      if (
        restoreFocus &&
        focusTarget &&
        document.contains(focusTarget)
      )
        window.setTimeout(
          () => focusTarget.focus({ preventScroll: true }),
          0
        );
    }
  };

  const syncNavigationMode = () => {
    setMenuState(false, false);

    if (!mobileNavigation.matches) {
      menu.removeAttribute("aria-hidden");
    }
  };

  menuToggle.addEventListener("click", () => setMenuState(!isMenuOpen()));
  menuClose.addEventListener("click", () => setMenuState(false));
  backdrop.addEventListener("click", () => setMenuState(false));

  document.addEventListener("keydown", event => {
    if (!isMenuOpen()) return;

    if (event.key === "Escape") {
      event.preventDefault();
      setMenuState(false);
      return;
    }

    if (event.key !== "Tab") return;

    const focusableElements = getVisibleFocusableElements();
    if (!focusableElements.length) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  });

  document.querySelectorAll("header .nav-link").forEach(link => {
    link.addEventListener("click", event => {
      const mapArea = event.currentTarget.dataset.mapArea;

      if (mapArea) {
        document
          .querySelector(`.map-pin.fill.map-pin${mapArea}:not(.clicked)`)
          ?.click();
      }

      setMenuState(false, false);
    });
  });

  if (typeof mobileNavigation.addEventListener === "function")
    mobileNavigation.addEventListener("change", syncNavigationMode);
  else mobileNavigation.addListener(syncNavigationMode);

  syncNavigationMode();
});
