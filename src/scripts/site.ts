/*
 * All page behaviour in one small module, replacing Bootstrap's JavaScript
 * bundle and the original header, cards, map, counter, banner and contact
 * scripts. Behaviour matches the original site.
 */

import deferredFonts from "../styles/fonts-deferred.css?inline";

const $ = <T extends Element = HTMLElement>(selector: string, root: ParentNode = document) =>
  root.querySelector<T>(selector);
const $$ = <T extends Element = HTMLElement>(selector: string, root: ParentNode = document) => [
  ...root.querySelectorAll<T>(selector),
];

/* ------------------------------------------------------------------ */
/* Collapse (Bootstrap-compatible: .collapse / .collapsing / .show)    */
/* ------------------------------------------------------------------ */

const transitionMs = (element: HTMLElement) => {
  const { transitionDuration, transitionDelay } = getComputedStyle(element);
  const duration = Number.parseFloat(transitionDuration) || 0;
  const delay = Number.parseFloat(transitionDelay) || 0;
  return (duration + delay) * 1000;
};

const afterTransition = (element: HTMLElement, callback: () => void) => {
  const ms = transitionMs(element);
  if (!ms) {
    callback();
    return;
  }
  let done = false;
  const finish = (event?: Event) => {
    if (done || (event && event.target !== element)) return;
    done = true;
    element.removeEventListener("transitionend", finish);
    callback();
  };
  element.addEventListener("transitionend", finish);
  window.setTimeout(finish, ms + 5);
};

const collapseTriggers = (target: HTMLElement) =>
  $$(`[data-collapse-target="#${target.id}"]`);

const setTriggers = (target: HTMLElement, expanded: boolean) => {
  for (const trigger of collapseTriggers(target)) {
    trigger.classList.toggle("collapsed", !expanded);
    trigger.setAttribute("aria-expanded", String(expanded));
  }
};

const isShown = (element: HTMLElement) => element.classList.contains("show");
const isTransitioning = (element: HTMLElement) => element.classList.contains("collapsing");

function hideCollapse(element: HTMLElement) {
  if (isTransitioning(element) || !isShown(element)) return;

  element.style.height = `${element.getBoundingClientRect().height}px`;
  void element.offsetHeight;
  element.classList.add("collapsing");
  element.classList.remove("collapse", "show");
  setTriggers(element, false);
  element.style.height = "";

  afterTransition(element, () => {
    element.classList.remove("collapsing");
    element.classList.add("collapse");
  });
}

function showCollapse(element: HTMLElement) {
  if (isTransitioning(element) || isShown(element)) return;

  const parentSelector = element.dataset.parent;
  if (parentSelector) {
    const siblings = $$(`.collapse.show, .collapsing`, $(parentSelector) ?? document).filter(
      sibling => sibling !== element && sibling.dataset.parent === parentSelector,
    );
    if (siblings.some(isTransitioning)) return;
    siblings.forEach(hideCollapse);
  }

  element.classList.remove("collapse");
  element.classList.add("collapsing");
  element.style.height = "0";
  setTriggers(element, true);
  element.style.height = `${element.scrollHeight}px`;

  afterTransition(element, () => {
    element.classList.remove("collapsing");
    element.classList.add("collapse", "show");
    element.style.height = "";
  });
}

function toggleCollapse(element: HTMLElement) {
  if (isShown(element)) hideCollapse(element);
  else showCollapse(element);
}

// Bootstrap only marks the other triggers in an accordion as "collapsed" once
// the accordion is first used; until then the product cards all look open.
// Matching that keeps the cards looking exactly as they did.
function syncGroupTriggers(parentSelector: string) {
  const parent = $(parentSelector);
  if (!parent) return;
  for (const trigger of $$("[data-collapse-target]", parent)) {
    const target = $(trigger.dataset.collapseTarget!);
    if (!target) continue;
    const open = target.classList.contains("show") || (target.classList.contains("collapsing") && target.style.height !== "");
    trigger.classList.toggle("collapsed", !open);
    trigger.setAttribute("aria-expanded", String(open));
  }
}

// Scrolls just far enough to show all of a panel that is opening: its
// bottom comes into view, or its top when it is taller than the screen.
// Runs while the panel expands; the page below is long enough that the
// target position is never clamped.
const SCROLL_MARGIN = 24;
function scrollOpeningIntoView(element: HTMLElement) {
  const top = element.getBoundingClientRect().top + window.scrollY;
  const showBottom = top + element.scrollHeight + SCROLL_MARGIN - window.innerHeight;
  const y = Math.min(showBottom, top - SCROLL_MARGIN);
  if (y > window.scrollY) {
    window.scrollTo({ top: y, behavior: reducedMotion.matches ? "auto" : "smooth" });
  }
}

for (const trigger of $$("[data-collapse-target]")) {
  trigger.addEventListener("click", () => {
    const target = $(trigger.dataset.collapseTarget!);
    if (!target) return;
    toggleCollapse(target);
    if (target.dataset.parent) syncGroupTriggers(target.dataset.parent);
    // The activity "More" button brings its tables into view.
    if (trigger.hasAttribute("data-scroll-into-view") && isTransitioning(target) && target.style.height !== "") {
      scrollOpeningIntoView(target);
    }
  });
}

/* ------------------------------------------------------------------ */
/* Dropdowns                                                           */
/* ------------------------------------------------------------------ */

type Dropdown = { root: HTMLElement; toggle: HTMLElement; menu: HTMLElement };

const dropdowns: Dropdown[] = $$("[data-dropdown]").map(root => ({
  root,
  toggle: $("[data-dropdown-toggle]", root)!,
  menu: $(".dropdown-menu", root)!,
}));

const isOpen = (dropdown: Dropdown) => dropdown.menu.classList.contains("show");

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const DROPDOWN_FADE_MS = 160;
const dropdownLeaveTimers = new WeakMap<HTMLElement, number>();

// Menus outside the header are placed like Popper did for Bootstrap: under
// the button (start or end aligned), flipped above when there is no room
// below, and kept inside the viewport horizontally.
function placeMenu({ root, toggle, menu }: Dropdown) {
  if (menu.hasAttribute("data-static")) return;

  const offset = Number(menu.dataset.offset ?? 2);
  const end = getComputedStyle(menu).getPropertyValue("--dropdown-position").trim() === "end";
  const toggleRect = toggle.getBoundingClientRect();
  const rootRect = root.getBoundingClientRect();
  const { offsetWidth: width, offsetHeight: height } = menu;
  const viewportWidth = document.documentElement.clientWidth;

  // Like Popper's flip variations: switch alignment when the preferred one
  // would overflow, then keep the menu on screen.
  const startLeft = toggleRect.left;
  const endLeft = toggleRect.right - width;
  let left = end ? endLeft : startLeft;
  if (!end && startLeft + width > viewportWidth && endLeft >= 0) left = endLeft;
  if (end && endLeft < 0 && startLeft + width <= viewportWidth) left = startLeft;
  left = Math.max(0, Math.min(left, viewportWidth - width));

  let top = toggleRect.bottom + offset;
  const roomAbove = toggleRect.top - offset - height;
  const above = top + height > window.innerHeight && roomAbove >= 0;
  if (above) top = roomAbove;
  // A menu shown above its button slides in upwards (bootstrap.css).
  menu.dataset.placement = above ? "top" : "bottom";

  menu.style.inset = "0 auto auto 0";
  menu.style.transform = `translate(${Math.round(left - rootRect.left)}px, ${Math.round(top - rootRect.top)}px)`;
}

// "show" is the open state; "is-visible" (one frame later) fades the menu
// in, and "is-leaving" keeps it displayed while it fades out.
function closeDropdown(dropdown: Dropdown) {
  if (!isOpen(dropdown)) return;
  const { menu } = dropdown;
  menu.classList.remove("show", "is-visible");
  dropdown.root.classList.remove("show");
  dropdown.toggle.setAttribute("aria-expanded", "false");
  if (reducedMotion.matches) return;
  menu.classList.add("is-leaving");
  dropdownLeaveTimers.set(
    menu,
    window.setTimeout(() => menu.classList.remove("is-leaving"), DROPDOWN_FADE_MS),
  );
}

function openDropdown(dropdown: Dropdown) {
  dropdowns.filter(other => other !== dropdown).forEach(closeDropdown);
  const { menu } = dropdown;
  window.clearTimeout(dropdownLeaveTimers.get(menu));
  const fadingOut = menu.classList.contains("is-leaving");
  menu.classList.remove("is-leaving");
  menu.classList.add("show");
  dropdown.root.classList.add("show");
  dropdown.toggle.setAttribute("aria-expanded", "true");
  placeMenu(dropdown);
  // Lay out the faded-out start state first, so the menu animates in.
  if (!fadingOut) void menu.offsetWidth;
  menu.classList.add("is-visible");
}

for (const dropdown of dropdowns) {
  dropdown.toggle.addEventListener("click", event => {
    event.preventDefault();
    if (isOpen(dropdown)) closeDropdown(dropdown);
    else openDropdown(dropdown);
  });

  dropdown.root.addEventListener("keydown", event => {
    const items = $$<HTMLElement>("a[href], button", dropdown.menu);
    if (event.key === "Escape" && isOpen(dropdown)) {
      closeDropdown(dropdown);
      dropdown.toggle.focus();
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!isOpen(dropdown)) openDropdown(dropdown);
      const index = items.indexOf(document.activeElement as HTMLElement);
      const next = event.key === "ArrowDown" ? index + 1 : index - 1;
      items[Math.max(0, Math.min(next, items.length - 1))]?.focus();
    }
  });
}

// Like Bootstrap's default auto-close: any click outside the button closes
// the menu, including clicks inside it, except a copy button, which shows
// its "Copied" state in the open menu.
document.addEventListener("click", event => {
  const target = event.target as Element;
  for (const dropdown of dropdowns) {
    if (dropdown.toggle.contains(target)) continue;
    if (dropdown.menu.contains(target) && target.closest?.(".copy-btn")) continue;
    closeDropdown(dropdown);
  }
});

const repositionOpenMenus = () => dropdowns.filter(isOpen).forEach(placeMenu);
window.addEventListener("resize", repositionOpenMenus, { passive: true });
window.addEventListener("scroll", repositionOpenMenus, { passive: true });

/* ------------------------------------------------------------------ */
/* Mobile navigation panel                                             */
/* ------------------------------------------------------------------ */

const mobileNavigation = window.matchMedia("(max-width: 767.98px)");
const menu = $("#navmenu");
const menuToggle = $("#site-navigation-button");
const menuClose = $("#site-navigation-close-button");
const backdrop = $("#site-navigation-backdrop");

const MENU_TRANSITION_MS = 320;
let menuHideTimer = 0;

// "is-shown" is the menu's logical state and drives the slide; "is-open"
// keeps the panel displayed and is removed once the slide-out has finished.
// `animate: false` closes at once: used when the layout switches between
// phone and desktop (folding, unfolding or rotating a Fold), so no slide
// ever plays across the breakpoint and no half-closed panel is left behind.
const setMenuState = (open: boolean, restoreFocus = true, animate = true) => {
  if (!menu || !menuToggle || !backdrop) return;
  const shouldOpen = open && mobileNavigation.matches;
  const wasOpen = menu.classList.contains("is-shown");
  const animated = animate && mobileNavigation.matches && !reducedMotion.matches;
  const parts = [menu, backdrop];

  window.clearTimeout(menuHideTimer);
  if (shouldOpen) {
    const entering = !menu.classList.contains("is-open");
    parts.forEach(part => part.classList.add("is-open"));
    // Let the browser lay out the off-screen start position first, so the
    // panel slides in instead of appearing.
    if (animated && entering) void menu.offsetWidth;
    parts.forEach(part => part.classList.add("is-shown"));
  } else {
    parts.forEach(part => part.classList.remove("is-shown"));
    const hide = () => parts.forEach(part => part.classList.remove("is-open"));
    if (animated && wasOpen) menuHideTimer = window.setTimeout(hide, MENU_TRANSITION_MS);
    else hide();
  }

  document.body.classList.toggle("site-navigation-open", shouldOpen);
  menuToggle.setAttribute("aria-expanded", String(shouldOpen));
  if (mobileNavigation.matches) menu.setAttribute("aria-hidden", String(!shouldOpen));
  else menu.removeAttribute("aria-hidden");

  if (shouldOpen) {
    window.setTimeout(() => menuClose?.focus({ preventScroll: true }), 0);
  } else if (wasOpen && restoreFocus) {
    window.setTimeout(() => menuToggle.focus({ preventScroll: true }), 0);
  }
};

const isMenuOpen = () => menu?.classList.contains("is-shown") ?? false;

menuToggle?.addEventListener("click", () => setMenuState(!isMenuOpen()));
menuClose?.addEventListener("click", () => setMenuState(false));
backdrop?.addEventListener("click", () => setMenuState(false));

document.addEventListener("keydown", event => {
  if (!menu || !isMenuOpen()) return;

  if (event.key === "Escape") {
    event.preventDefault();
    setMenuState(false);
    return;
  }
  if (event.key !== "Tab") return;

  const focusable = $$("a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])", menu).filter(
    element => element.getClientRects().length > 0,
  );
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

mobileNavigation.addEventListener("change", () => setMenuState(false, false, false));
setMenuState(false, false, false);

/* ------------------------------------------------------------------ */
/* Map: pins, highlighted regions and the details panel below          */
/* ------------------------------------------------------------------ */

const mapDropdown = $("#map-dropdown");

function adjustMapView(hash: string) {
  const map = $(".map-ratio");
  if (map && map.getBoundingClientRect().top > -200) {
    window.setTimeout(() => {
      location.hash = hash;
    }, 150);
  }
}

function showMapContent(pin: HTMLElement) {
  const area = pin.dataset.map!;
  $(`.map.${area}`)?.classList.add("clicked");
  pin.classList.add("clicked");
  $$(".map-content").forEach(box => box.classList.add("map-content-hidden"));
  $(`.map-content.content-${area}`)?.classList.remove("map-content-hidden");
}

function onPinClick(pin: HTMLElement) {
  const opened = $(".map-pin.clicked");
  const hash = pin.dataset.hash!;

  if (opened && opened !== pin) {
    // Swap the open area for this one.
    opened.classList.remove("clicked");
    $(".map.clicked")?.classList.remove("clicked");
    showMapContent(pin);
    adjustMapView(hash);
  } else if (!opened) {
    showMapContent(pin);
    if (mapDropdown) toggleCollapse(mapDropdown);
    adjustMapView(hash);
  } else {
    $(`.map.${pin.dataset.map}`)?.classList.remove("clicked");
    pin.classList.remove("clicked");
    if (mapDropdown) toggleCollapse(mapDropdown);
  }
}

for (const pin of $$(".map-pin.fill")) {
  const area = () => $(`.map.${pin.dataset.map}`);
  pin.addEventListener("mouseenter", () => {
    area()?.classList.add("highlighted");
    pin.classList.add("highlighted");
  });
  pin.addEventListener("mouseleave", () => {
    area()?.classList.remove("highlighted");
    pin.classList.remove("highlighted");
  });
  pin.addEventListener("click", () => onPinClick(pin));
}

// Header and footer links to the office and quarry open the map panel.
for (const link of $$("a[data-map-area]")) {
  link.addEventListener("click", () => {
    $<HTMLElement>(`.map-pin.fill.map-pin${link.dataset.mapArea}:not(.clicked)`)?.click();
  });
}

// Any header navigation link closes the mobile panel. From the open panel
// the page jumps instead of scrolling smoothly, so the section is already
// in place when the panel disappears. The jump mode lasts past the map's
// delayed hash update (150ms) and its panel opening (350ms).
let instantScrollTimer = 0;
for (const link of $$("header .nav-link")) {
  link.addEventListener("click", () => {
    if (isMenuOpen()) {
      document.documentElement.classList.add("instant-scroll");
      window.clearTimeout(instantScrollTimer);
      instantScrollTimer = window.setTimeout(
        () => document.documentElement.classList.remove("instant-scroll"),
        800,
      );
    }
    setMenuState(false, false);
  });
}

/* ------------------------------------------------------------------ */
/* Product cards (desktop): one shared details panel                   */
/* ------------------------------------------------------------------ */

const productsPanel = $("#products-content");

function showCardContent(card: HTMLElement) {
  $$(".card-content-body").forEach(box => box.classList.add("card-content-hidden"));
  $(`.${card.dataset.cardnumber}-content-body`)?.classList.remove("card-content-hidden");
}

for (const card of $$(".card[data-cardnumber]")) {
  card.addEventListener("click", () => {
    const opened = $(".card-opened");

    if (opened && opened !== card) {
      opened.classList.remove("card-opened");
      opened.setAttribute("aria-expanded", "false");
      card.classList.add("card-opened");
      card.setAttribute("aria-expanded", "true");
      showCardContent(card);
    } else if (!card.classList.contains("card-opened")) {
      card.classList.add("card-opened");
      card.setAttribute("aria-expanded", "true");
      showCardContent(card);
      if (productsPanel) toggleCollapse(productsPanel);
    } else {
      card.classList.remove("card-opened");
      card.setAttribute("aria-expanded", "false");
      if (productsPanel) toggleCollapse(productsPanel);
    }
  });
}

/* ------------------------------------------------------------------ */
/* Banner label paddings (ported from the original banners.js)         */
/* ------------------------------------------------------------------ */

const informationHeading = $("#information h2");
const informationContainer = $("#information-container");
const statisticsContainer = $("#statistics-container");
const [infoFirst, infoLast] = [
  $("#information-text-container p:first-child"),
  $("#information-text-container p:last-child"),
];
const [statFirst, statLast] = [
  $("#statistics-text-container p:first-child"),
  $("#statistics-text-container p:last-child"),
];

function sizeBanners() {
  if (!informationContainer || !statisticsContainer || !infoFirst || !infoLast || !statFirst || !statLast) return;
  const width = window.innerWidth;
  const pad = (first: HTMLElement, last: HTMLElement, value: number) => {
    first.style.paddingTop = `${value}px`;
    last.style.paddingBottom = `${value}px`;
  };

  pad(infoFirst, infoLast, 0);
  if (width >= 768) pad(infoFirst, infoLast, (informationContainer.offsetHeight - (width < 975 ? 120 : 188)) / 2);

  pad(statFirst, statLast, 0);
  if (width > 768) pad(statFirst, statLast, (statisticsContainer.offsetHeight - 133) / 2);

  if (width < 768) {
    pad(infoFirst, infoLast, 100);
    pad(statFirst, statLast, 100);
  }
}

if (informationHeading) new ResizeObserver(sizeBanners).observe(informationHeading);

/* ------------------------------------------------------------------ */
/* Statistics counters                                                 */
/* ------------------------------------------------------------------ */

function startCounter(element: HTMLElement) {
  if (element.dataset.counting) return;
  element.dataset.counting = "true";
  const target = Number(element.dataset.counter);
  const duration = Number(element.dataset.duration);
  const step = target / (duration / 20);
  let count = 0;
  const timer = window.setInterval(() => {
    if (count < target) {
      count += step;
      element.textContent = String(Math.round(count));
    } else window.clearInterval(timer);
  }, 20);
}

const counters = $$("[data-counter]");
if (counters.length) {
  counters.forEach(counter => (counter.textContent = "0"));
  const observer = new IntersectionObserver(
    entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        counters.forEach(startCounter);
        observer.disconnect();
      }
    },
    { threshold: 0.05 },
  );
  observer.observe(counters[0]);
}

/* ------------------------------------------------------------------ */
/* Contacts: reveal buttons and copy-to-clipboard                      */
/* ------------------------------------------------------------------ */

for (const button of $$(".contact-reveal")) {
  button.addEventListener("click", () => button.closest(".contact-item")?.classList.add("revealed"));
}

async function copyText(text: string): Promise<boolean> {
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.append(textArea);
    textArea.select();
    const copied = document.execCommand("copy");
    textArea.remove();
    return copied;
  }
}

const COPIED_MS = 2000;

// After a copy the button shows a green check and a "Copied!" tooltip for
// two seconds, and screen readers hear the same message.
const copyStatus = document.createElement("span");
copyStatus.className = "visually-hidden";
copyStatus.setAttribute("role", "status");
document.body.append(copyStatus);

for (const button of $$(".copy-btn[data-copy]")) {
  let resetTimer = 0;
  button.addEventListener("click", async () => {
    if (!(await copyText(button.dataset.copy!))) return;
    button.classList.add("copied");
    copyStatus.textContent = button.dataset.copiedMessage ?? "";
    window.clearTimeout(resetTimer);
    resetTimer = window.setTimeout(() => {
      button.classList.remove("copied");
      copyStatus.textContent = "";
    }, COPIED_MS);
  });
}

/* ------------------------------------------------------------------ */
/* Background photos: load after the page, nearest sections first      */
/* ------------------------------------------------------------------ */

// Sections marked data-lazy-bg keep their CSS background photos off until
// "bg-in" is added (site.css). After the load event, sections within a
// screen of the viewport get theirs at once; the rest follow when the
// browser is idle, so they are ready before anyone scrolls there.
const startBackgrounds = () => {
  const sections = $$("[data-lazy-bg]");
  const reveal = (section: Element) => section.classList.add("bg-in");
  const observer = new IntersectionObserver(
    entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        reveal(entry.target);
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: "100% 0px" },
  );
  sections.forEach(section => observer.observe(section));
  const revealAll = () => {
    observer.disconnect();
    sections.forEach(reveal);
  };
  if ("requestIdleCallback" in window) window.requestIdleCallback(revealAll, { timeout: 3000 });
  else setTimeout(revealAll, 1500);
};

/* ------------------------------------------------------------------ */
/* Hero video: start downloading only after the page has loaded        */
/* ------------------------------------------------------------------ */

const startVideo = () => {
  const video = $<HTMLVideoElement>("#video-video");
  const sources = video ? $$<HTMLSourceElement>("source[data-src]", video) : [];
  if (!video || !sources.length) return;
  sources.forEach(source => (source.src = source.dataset.src!));
  video.load();
  video.play().catch(() => {});
};

// The font weights that only text below the first screen uses (light,
// medium, black, italics). Until they arrive, that text shows in the
// nearest loaded weight.
const loadDeferredFonts = () => {
  const style = document.createElement("style");
  style.textContent = deferredFonts;
  document.head.append(style);
};

// After the load event and the frame that follows it, so the hero image
// has been painted before the remaining fonts, the background photos and
// the video download.
const afterLoad = () =>
  requestAnimationFrame(() =>
    setTimeout(() => {
      loadDeferredFonts();
      startBackgrounds();
      startVideo();
    }, 50),
  );

if (document.readyState === "complete") afterLoad();
else window.addEventListener("load", afterLoad, { once: true });
