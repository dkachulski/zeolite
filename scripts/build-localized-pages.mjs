import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { load } from "cheerio";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
const templatePath = path.join(projectRoot, "templates", "index.html");
const siteOrigin = "https://trassing.com";

const localeConfig = {
  en: {
    output: path.join(projectRoot, "index.html"),
    route: "/",
    assetPrefix: "./",
    ogLocale: "en_US",
  },
  bg: {
    output: path.join(projectRoot, "bg", "index.html"),
    route: "/bg/",
    assetPrefix: "../",
    ogLocale: "bg_BG",
  },
};

const contactKeys = {
  "address-1": "contact-address-text-1",
  "email-1": "contact-email-text-1",
  "tel-1": "contact-telephone-text-1",
  "tel-2": "contact-telephone-text-2",
};

const template = await readFile(templatePath, "utf8");

for (const [locale, config] of Object.entries(localeConfig)) {
  const languageFile = path.join(
    projectRoot,
    "languages",
    `${locale}.json`
  );
  const languageJson = JSON.parse(await readFile(languageFile, "utf8"));
  const translations = languageJson[locale];
  const $ = load(template, { decodeEntities: false });
  const missingKeys = new Set();

  $("html").attr("lang", locale);
  $("body").attr("data-page-language", locale);

  $("[data-key]").each((_, element) => {
    const key = $(element).attr("data-key");
    const value = translations[key];

    if (value === undefined) missingKeys.add(key);
    else $(element).html(value);
  });

  $("[data-key-copy]").each((_, element) => {
    const key = $(element).attr("data-key-copy");
    const value = translations[key];

    if (value === undefined) missingKeys.add(key);
    else $(element).html(value);
  });

  $("[data-i18n-aria-label]").each((_, element) => {
    const key = $(element).attr("data-i18n-aria-label");
    const value = translations[key];

    if (value === undefined) missingKeys.add(key);
    else $(element).attr("aria-label", value);
  });

  $("[data-contact]").each((_, element) => {
    const contactId = $(element).attr("data-contact");
    const translationKey = contactKeys[contactId];
    const tagName = element.tagName?.toLowerCase();

    if (!translationKey || !["a", "span"].includes(tagName)) return;

    const value = translations[translationKey];
    if (value === undefined) {
      missingKeys.add(translationKey);
      return;
    }

    $(element).text(value);

    if (tagName === "a" && contactId === "email-1")
      $(element).attr("href", `mailto:${value}`);
    else if (tagName === "a" && contactId.startsWith("tel-"))
      $(element).attr("href", `tel:${value.replace(/\s+/g, "")}`);
  });

  $(".lang-select").each((_, languageSelector) => {
    const selector = $(languageSelector);
    const currentOption = selector.find(`[data-lang="${locale}"]`).first();
    const button = selector.find(".lang-select-button").first();

    if (currentOption.length && button.length)
      button.html(currentOption.html());

    selector.find("[data-lang]").each((__, option) => {
      const optionElement = $(option);
      const optionLocale = optionElement.attr("data-lang");
      const optionConfig = localeConfig[optionLocale];
      const optionContents = optionElement.html();

      if (!optionConfig) return;

      const link = $("<a></a>")
        .addClass("dropdown-item")
        .attr("href", optionConfig.route)
        .attr("hreflang", optionLocale)
        .attr("lang", optionLocale)
        .attr("data-language-link", optionLocale)
        .html(optionContents);

      if (optionLocale === locale) {
        link.attr("aria-current", "page");
        optionElement.addClass("active");
      }

      optionElement.removeClass("dropdown-item").empty().append(link);
    });
  });

  $('a[href=""]').attr("href", config.route);

  if (config.assetPrefix !== "./") {
    $("[src], [href], [poster]").each((_, element) => {
      for (const attribute of ["src", "href", "poster"]) {
        const value = $(element).attr(attribute);
        if (value?.startsWith("./"))
          $(element).attr(
            attribute,
            `${config.assetPrefix}${value.slice(2)}`
          );
      }
    });
  }

  $('meta[name="description"]').attr(
    "content",
    translations["meta-description"]
  );
  $('meta[property="og:description"]').attr(
    "content",
    translations["meta-description"]
  );
  $('meta[property="og:title"]').attr(
    "content",
    translations["meta-og-title"]
  );
  $('meta[property="og:image"]').attr(
    "content",
    `${siteOrigin}/images/Kurdzhali.webp`
  );

  $('link[rel="canonical"], link[rel="alternate"][hreflang]').remove();
  $('meta[property="og:url"], meta[property="og:locale"], meta[property="og:locale:alternate"]').remove();

  $("head").append(
    `<link rel="canonical" href="${siteOrigin}${config.route}">`,
    `<link rel="alternate" hreflang="en" href="${siteOrigin}/">`,
    `<link rel="alternate" hreflang="bg" href="${siteOrigin}/bg/">`,
    `<link rel="alternate" hreflang="x-default" href="${siteOrigin}/">`,
    `<meta property="og:url" content="${siteOrigin}${config.route}">`,
    `<meta property="og:locale" content="${config.ogLocale}">`,
    `<meta property="og:locale:alternate" content="${
      locale === "en" ? localeConfig.bg.ogLocale : localeConfig.en.ogLocale
    }">`
  );

  if (missingKeys.size)
    throw new Error(
      `${locale} is missing translations for: ${[...missingKeys].join(", ")}`
    );

  await mkdir(path.dirname(config.output), { recursive: true });
  const output = $.html().replace(/[ \t]+$/gm, "");
  await writeFile(config.output, `${output}\n`);
  console.log(`Built ${path.relative(projectRoot, config.output)} (${locale})`);
}
