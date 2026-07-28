# Trassing website

The site is generated as two static language routes:

- `/` — English and the default route
- `/bg/` — Bulgarian

## Editing the site

1. Edit shared markup in `templates/index.html`.
2. Edit localized content in `languages/en.json` or `languages/bg.json`.
3. Run `npm install` once, then `npm run build`.
4. Run `npm test` before committing.

The build writes the deployable `index.html` and `bg/index.html` files. Both
generated files are committed because GitHub Pages serves the repository as a
static site.

The language selector uses normal links, so each route works without
JavaScript. Canonical URLs, `hreflang` links, Open Graph locale metadata, and
localized descriptions are generated for both pages.
