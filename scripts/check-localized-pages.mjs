import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { load } from "cheerio";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);

const pages = [
  {
    locale: "en",
    file: path.join(projectRoot, "index.html"),
    route: "/",
    titlePattern: /Zeolite/,
  },
  {
    locale: "bg",
    file: path.join(projectRoot, "bg", "index.html"),
    route: "/bg/",
    titlePattern: /Зеолит/,
  },
];

const failures = [];

for (const page of pages) {
  const html = await readFile(page.file, "utf8");
  const $ = load(html);
  const label = path.relative(projectRoot, page.file);

  const expect = (condition, message) => {
    if (!condition) failures.push(`${label}: ${message}`);
  };

  expect($("html").attr("lang") === page.locale, "incorrect html lang");
  expect(page.titlePattern.test($("title").text()), "incorrect page title");
  expect(
    $('link[rel="canonical"]').attr("href") ===
      `https://trassing.com${page.route}`,
    "incorrect canonical URL"
  );
  expect(
    $('link[rel="alternate"][hreflang="en"]').length === 1 &&
      $('link[rel="alternate"][hreflang="bg"]').length === 1 &&
      $('link[rel="alternate"][hreflang="x-default"]').length === 1,
    "missing hreflang links"
  );
  expect(
    $('script[src*="language-controller"]').length === 0,
    "runtime language controller is still included"
  );
  expect(
    $('[data-language-link="en"]').attr("href") === "/" &&
      $('[data-language-link="bg"]').attr("href") === "/bg/",
    "language route links are incorrect"
  );
  expect(
    $('#site-navigation-button').attr("aria-expanded") === "false",
    "mobile navigation button is missing"
  );
  expect(
    $('a[data-contact="email-1"][href^="mailto:"]').first().text().trim() ===
      "info@trassing.com",
    "email dropdown is not rendered"
  );
  expect(
    $('a[data-contact="tel-1"][href^="tel:"]').first().text().trim().length >
      0,
    "telephone dropdown is not rendered"
  );

  for (const attribute of ["src", "href", "poster"]) {
    for (const element of $(`[${attribute}]`).toArray()) {
      const value = $(element).attr(attribute);

      if (
        !value ||
        value.startsWith("#") ||
        value.startsWith("/") ||
        /^[a-z]+:/i.test(value)
      )
        continue;

      const assetPath = value.split(/[?#]/, 1)[0];
      const resolvedPath = path.resolve(path.dirname(page.file), assetPath);
      try {
        await access(resolvedPath);
      } catch {
        failures.push(`${label}: missing local asset ${value}`);
      }
    }
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log("Localized page checks passed");
}
