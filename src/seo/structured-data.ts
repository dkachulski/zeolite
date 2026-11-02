/**
 * Schema.org data for search engines (JSON-LD in the page head): the company
 * as an Organization, the WebSite, and the FAQ section as an FAQPage. All of
 * it repeats what the page shows, as Google requires.
 */
import type { Locale } from "../i18n";

export const SITE = "https://trassing.com";

const ORGANIZATION_ID = `${SITE}/#organization`;
const WEBSITE_ID = `${SITE}/#website`;

const SOCIAL_PROFILES = [
  "https://www.instagram.com/trassingcom/",
  "https://www.twitter.com/trassingcom/",
  "https://www.facebook.com/trassingcom/",
  "https://www.linkedin.com/company/trassingcom",
];

/** Plain text from a translation that may hold markup or entities. */
const plainText = (html: string) =>
  html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

interface Options {
  locale: Locale;
  url: string;
  t: (key: string) => string;
  faqCount: number;
}

export function structuredData({ locale, url, t, faqCount }: Options) {
  const telephones = [t("contact-telephone-text-1"), t("contact-telephone-text-2")];
  const organization = {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: "Trassingeneering",
    alternateName: ["TRASSING.COM", "ТРАСИНЖЕНЕРИНГ"],
    url: `${SITE}/`,
    logo: { "@type": "ImageObject", url: `${SITE}/icon-512.png`, width: 512, height: 512 },
    image: `${SITE}/og-image.jpg`,
    description: plainText(t("meta-description")),
    email: t("contact-email-text-1"),
    telephone: telephones[0],
    address: {
      "@type": "PostalAddress",
      streetAddress: "20A Daskal Stoyan Popandreev Str., Entrance A, Floor 1, Apt. 3, Edelweiss 1 Complex, Boyana",
      addressLocality: "Sofia",
      postalCode: "1616",
      addressCountry: "BG",
    },
    contactPoint: telephones.map(telephone => ({
      "@type": "ContactPoint",
      telephone,
      email: t("contact-email-text-1"),
      contactType: "sales",
      availableLanguage: ["en", "bg"],
    })),
    sameAs: SOCIAL_PROFILES,
  };

  const website = {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: `${SITE}/`,
    name: "TRASSING.COM",
    inLanguage: ["en", "bg"],
    publisher: { "@id": ORGANIZATION_ID },
  };

  const faq = {
    "@type": "FAQPage",
    "@id": `${url}#FAQ`,
    url,
    inLanguage: locale,
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: Array.from({ length: faqCount }, (_, index) => ({
      "@type": "Question",
      name: plainText(t(`faq-question-${index + 1}`)),
      acceptedAnswer: { "@type": "Answer", text: plainText(t(`faq-answer-${index + 1}`)) },
    })),
  };

  return { "@context": "https://schema.org", "@graph": [organization, website, faq] };
}
