# CIASO website – "From Arrival to Opportunity"

Redesigned website for the **Canada Integration and Settlement Organization (CIASO)**.
Static, dependency-free, and built from content verified on the live site (ciaso.ca, audited 26 Oct 2026).

## Run it

```bash
npm start
```

That builds `src/` into `dist/` and serves it at http://localhost:4173. `npm run build` builds only.
Set `SITE_URL` to change the origin used for canonical URLs, Open Graph tags and the sitemap (default `https://ciaso.ca`).
Requires Node 18+. There is nothing to install.

To verify every internal link, anchor, image alt and heading:

```bash
node scripts/check-links.mjs
```

## Structure

```
src/
  pages/        One file per page. The first line is a <!--page {...} --> JSON header
                (title, description, path, nav, crumbs, scripts, faq).
  partials/     header, footer, icon sprite, shared final call-to-action.
                Use <!-- include:name --> inside a page.
  assets/
    css/main.css           Design system (tokens, components, layouts)
    js/main.js             Navigation, forms, events, story filters, sharing
    js/config.js           Form endpoints + email (edit this to connect forms)
    js/events-data.js      Workshops & events (edit this to add events)
    img/                   CIASO photos, logo, partner logos, journey graphic (SVG)
    fonts/                 Self-hosted Archivo + Inter (no third-party font requests)
build.mjs       Assembles pages, writes sitemap.xml and robots.txt
serve.mjs       Local preview server
docs/IMPLEMENTATION-REPORT.md   What was built, tested, and still needs confirmation
```

## Common content tasks

**Add an event:** add an object at the top of `src/assets/js/events-data.js` with `title`, `date` (YYYY-MM-DD), and optionally `time`, `format`, `location`, `eligibility`, `deadline`, `registerUrl` and `detailsUrl`. Events dated before today (Edmonton time) automatically move to "Past workshops". The homepage shows the next 3 upcoming events, or an empty state if there are none.

**Add a success story:** copy a `<figure class="story">` block in `src/pages/stories.html`. Set `data-categories` to one or more of `newcomer career skills mentorship community`. Only publish stories with the participant's written consent.

**Connect the forms:** see "Forms" below.

## Forms

There are four forms: Get Support, Contact, Volunteer and Partnership. All validate on the client, show an accessible error summary, and have honeypot plus minimum-time spam protection.

* **Default (no backend):** on submit, the visitor's email app opens with a pre-written message to admin@ciaso.ca, and the page explains that they need to press **Send**.
* **Production:** set an endpoint per form in `src/assets/js/config.js` (`formEndpoints.support`, `.contact`, `.volunteer`, `.partner`). The endpoint must accept a `POST` of `multipart/form-data` and return a 2xx status. Options:
  * WordPress Contact Form 7, which the live site already uses: `https://ciaso.ca/wp-json/contact-form-7/v1/contact-forms/<ID>/feedback`. Field names must match the CF7 form, and CF7 needs `_wpcf7_unit_tag`.
  * Formspree, Basin or similar: paste the form URL.
  * CIASO's own API.

  Add server-side validation and CAPTCHA/Turnstile on the backend. Never put secret keys in `config.js`.

## Analytics

Calls to action and form submissions carry `data-track` names. `main.js` pushes them to `window.dataLayer` **only if** an analytics tool has created it. Nothing is tracked by default. If CIASO adds analytics, choose a privacy-compliant tool, add a consent notice, and update the privacy information.

## Deploying

`dist/` is a plain static site and can go on any host (Netlify, Cloudflare Pages, GitHub Pages, cPanel). Upload the contents of `dist/` and configure `404.html` as the not-found page.

**Moving to WordPress instead:** each `src/pages/*.html` maps to one WordPress page. Copy the section markup into Custom HTML blocks, or a child theme template, and enqueue `main.css` and `main.js`. Replace the evisa/Elementor header and footer with `partials/header.html` and `partials/footer.html`.

### Redirects from the current site (301)

| Old URL | New URL |
|---|---|
| /services-2/ | /programs/ |
| /testimonial/ | /stories/ |
| /faq/ | /resources/#faq |
| /events/, /workshop/ | /resources/#events |
| /volunteer/ | /get-involved/#volunteer |
| /contact-us/ | /contact/ |
| /about/, /contact/ | unchanged |

The old site has leftover template pages that are not CIASO content. **Remove or noindex them:**

* /country/\*, /travel-agency/, /work-visa/, /team/, /team-details/, /coaching/, /coaching-details/, /service-details/
* the 2023 "visa consulting" blog posts and "Hello world!"
* the citizenship-by-investment sections on the current homepage

Keep `/home-francais/` (French homepage, linked from the new site) and the workshop posts, which the new event cards link to.
