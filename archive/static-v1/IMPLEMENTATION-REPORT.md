# CIASO website transformation – implementation report

*Prepared 27 October 2026. Covers the redesign built in this workspace. **The live site at ciaso.ca has not been changed.***

## 1. Audit findings (ciaso.ca, 26 Oct 2026)

**Platform:** WordPress 6.8, Elementor 4.3, "evisa" immigration-agency theme, Slider Revolution, and Contact Form 7. No source code was available, so the redesign was built as a standalone static site (see README).

**Brand:**

* Elementor global colours: primary red **#CD0E00**, accent #C30D00, black #000000, white #FFFFFF.
* The logo (red "CIASO" wordmark with maple leaf) was kept as is.

**Verified content kept:**

* Mission/purpose, vision and the three values (Dignity & Respect, Diversity & Inclusion, Empowerment).
* The 7 listed services, plus ESL (listed in the contact form only).
* All 6 FAQ answers.
* 8 testimonials: Sidonie, Dr. Stephen A., Koti, Anne (English and French), Suzy, Romaric, Dr. Frida.
* 12 workshops and events (Apr 2025 – Aug 2026).
* 6 partner logos.
* Contact details: address, two phone numbers, email and hours.
* Facebook and LinkedIn, plus the French homepage.

**Template filler found on the live site. None of it was carried over, and it should be removed from the live site:**

* Citizenship-by-investment price cards ("Grenada $150,000", etc.).
* A five-step "passport" process naming "Immigrant Invest".
* A placeholder team (Esther Howard, Annette Black, Andrew Riis, Kristin Watson).
* "00+" counters for years, success stories and countries.
* A duplicate testimonial credited to "Gladriao Gomeza, Real estate investor".
* Country pages and "visa consulting" lorem posts.
* Dead "#" links, a YouTube icon with no URL, and footer links to "Worldwide offices" and "Case Studies".

## 2. Pages built

| Page | Path | Highlights |
|---|---|---|
| Home | `/` | All 10 brief sections: hero, introduction, 5 pillars, journey timeline, who we serve, #FromHereToThrive stories, community connector, impact, events (data-driven, honest empty state), final pathways |
| Get Support | `/get-support/` | 3-step need picker (6 needs mapped to real services), `?need=` deep links, referral form, crisis note (911/988), direct contact options |
| Our Programs | `/programs/` | Every verified service sorted into Settle / Work / Grow / Belong / Thrive, sticky pillar sub-nav, availability caveat |
| About CIASO | `/about/` | New positioning; original purpose, vision and values; challenge → response → intended outcomes; impact (activity timeline + "data coming soon" measures); partner logos |
| Your CIASO Journey | `/journey/` | Six stages with "what it looks like" and "how CIASO helps" for each, an "every journey is different" note, and a downloadable SVG brand asset |
| Success Stories | `/stories/` | All 8 real testimonials, theme filters, LinkedIn/Facebook/copy-link sharing, a 5-part story template and a consent-first "Share your story" call to action |
| Get Involved | `/get-involved/` | Volunteer (4 real roles + form), 6 partnership pathways + enquiry form, Donate (enquiry-based) |
| Resources | `/resources/` | Upcoming and past events, FAQ (with FAQPage schema), official links (canada.ca, Job Bank, 211, 988), planned LinkedIn content series |
| Contact | `/contact/` | Form with the original service topics, address, map link, both phone numbers, email, hours, social links |
| Accessibility | `/accessibility/` | What was done, and how to report a barrier |
| 404 | `/404.html` | Recovery links |

## 3. Design system and components

* **Tokens:** CIASO red #CD0E00 (5.6:1 on white), black, white, plus a small neutral scale. Archivo (headings) and Inter (body) are self-hosted.
* **Reusable components:** buttons (primary, secondary, light, ghost), top bar, sticky header, accessible mobile menu, breadcrumbs, hero, page hero, campaign band, pillar cards, journey timeline (horizontal on desktop, vertical on mobile), stage cards, audience cards, story cards with filters, connector tiles, pathway cards, partner logo grid, impact items with "data pending" state, timeline, event cards with empty state, form fields with validation states, error summary, need picker, FAQ accordion, share bar, contact list, callout, final call-to-action pathways, footer.
* **Restraint:** red is reserved for calls to action, labels, active states and accents. Two black bands per page provide rhythm. Animation is limited to a subtle fade-in, which is switched off for users who prefer reduced motion.

## 4. Functionality

* **Forms:** 4 forms with validation, an error summary that receives focus, inline errors linked via `aria-describedby`, and honeypot + minimum-time spam protection. They submit to a configurable endpoint, falling back to a pre-written email to admin@ciaso.ca.
* **Events:** expired events can never appear as upcoming. Dates are compared in Edmonton time.
* **Deep links:** `?need=` and `?topic=` preselect form fields.
* **SEO:** per-page titles, descriptions and canonical URLs; Open Graph and Twitter tags; NGO and BreadcrumbList JSON-LD; FAQPage JSON-LD; `sitemap.xml`; `robots.txt`; and an `hreflang` link to the French homepage.
* **Performance:** no frameworks; JavaScript is about 26 KB unminified, including event data; CSS is about 48 KB unminified. Fonts are self-hosted and preloaded, images are resized with `srcset`, `width`/`height` are set to avoid layout shift, and below-the-fold images lazy-load.

## 5. Tests performed

| Test | Result |
|---|---|
| Build (`node build.mjs`) | 11 pages, sitemap and robots generated |
| Link checker (`scripts/check-links.mjs`): internal links, anchors, duplicate IDs, image alt text, one H1 per page | 933 references, **0 problems** |
| axe-core 4.10 (WCAG 2.0/2.1/2.2 A and AA + best practice) on all 11 pages at 1280, 768 and 375 px | **0 violations** after fixes. Fixed along the way: red-on-black contrast in the journey numbers, top-bar landmark, nested asides, hidden menu-button name |
| Horizontal overflow at 375 px, all pages | None (only the intentionally scrollable pillar sub-nav) |
| Mobile menu | Opens, moves focus to the first link, locks page scroll, closes on Escape (focus returns to toggle) and on link click |
| Get Support: `?need=work` | Correct panel shown and topic preselected |
| Empty submit | 4 errors listed, fields marked `aria-invalid`, summary focused |
| Invalid email | Specific format message |
| Endpoint failure (404) | Error alert with email fallback |
| Endpoint success (200) | Confirmation replaces the form and receives focus |
| No endpoint configured | Email fallback, with instructions to the visitor |
| Volunteer checkbox group | Group validation and `aria-invalid` on all options |
| Partner `?topic=employer` | Preselected |
| Events | Current data shows the empty state plus 12 past events. An injected future event rendered as upcoming with time, format, eligibility, deadline and Register button |
| Story filters | "Mentorship" shows 3 of 8 stories, with `aria-pressed` and a screen-reader count |
| Visual review | Desktop (1440) and mobile (375) screenshots of all main pages |

**Not tested:** real form delivery (no backend exists yet), real devices or screen readers (automated checks only), Lighthouse/Core Web Vitals on production hosting.

## 6. Needs CIASO's confirmation before launch

1. **Phone numbers:** the site shows both 587-813-5155 (header and 2026 flyer) and 204-228-4625 (contact page). Keep both, or choose one?
2. **Office hours:** the header says Mon–Fri 9 a.m.–5 p.m.; the contact page says 9 a.m.–6 p.m. The new site uses 9–5.
3. **Testimonial consent:** confirm each person agreed to publication with the name shown. "Grand Prairie" was corrected to "Grande Prairie" for Koti.
4. **Partners:** the 6 organizations shown under "Organizations we work with" come from the live site's "Our Global Partnerships" strip. Confirm each relationship is current and that logo use is permitted. Parallèl Alberta is mentioned in text only.
5. **ESL:** it appears only in the old contact form. Confirm it is currently offered. It is labelled "contact us for current availability".
6. **Photography:** the hero and about images (diverse group, students, professional) appear to be licensed stock already on ciaso.ca. Confirm the licence. Authentic photos of CIASO events and participants, taken with consent, would strengthen the brand.
7. **Donations:** there is no online donation method or charitable registration information, so Donate goes to an enquiry. If CIASO is a registered charity, add the number and a donation platform; mention tax receipts only if they can be issued.
8. **Privacy policy:** the live site has none. One is needed before forms collect personal information in production. CIASO should adopt one appropriate to Alberta/PIPEDA, and a link can then be added to the footer and forms.
9. **Impact data:** there are no verified numbers yet. The "Measures we will report" framework (people served, workshop participation, employment outcomes, volunteers, partnerships, satisfaction) is ready to fill in.
10. **Leadership and team:** no verified bios (the live team section is placeholder). Dr. Leonard Ngwa is named as a founder in a testimonial and as a workshop speaker. A real team section can be added once bios and photos are approved.
11. **French:** the new pages are English only and link to the existing `/home-francais/`. Translating key pages (Home, Get Support, Programs) is recommended.

## 7. Still to do to go live

* Connect the 4 forms to a backend (see README → Forms), with server-side validation and a CAPTCHA.
* Choose hosting, or migrate into WordPress (see README → Deploying). Set up 301 redirects and remove the template-filler pages listed in section 1.
* Optional: privacy-compliant analytics, using the existing `data-track` hooks.
* Start the planned LinkedIn content series. They are labelled "Planned" on the Resources page until launched.
