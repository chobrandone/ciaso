# CIASO website – implementation report

## Version 4 (27 Oct 2026): fully dynamic content

**Every public text is now stored in the database and editable at Admin → Website content.** This covers the contact details and social links (top bar, footer, contact page, Get Support, schema data), brand messages, the home hero (including its image), section headings, the five pillars and their services, the six journey stages, the community connector, the call-to-action buttons, FAQ questions, the footer, and each page’s header (label, title, introduction, blurred background image and search description). Events, testimonials and videos were already managed in the admin.

**How it works:**
- `src/lib/content-schema.ts` defines each section’s fields and keeps the original text as defaults.
- Admin saves are stored per section in `site_content`.
- Pages read the merged result on every request (`getContent()`), so an edit appears instantly.
- Uploaded images are stored in the database (`uploads`) and served from `/media/uploads/<id>`.

**Stays fixed, by design:**
- the menu structure and labels, which match ciaso.ca as requested;
- the pillar URLs and icons (/services#settle etc., used by Get Support);
- form field labels and validation messages.

**Tested:**
- edited the home hero, the main phone number (it changed in the top bar, phone menu, footer and contact page), added a FAQ question (page and search schema), and uploaded a Services header image (stored, served and used);
- a `javascript:` link was rejected with a warning naming the field;
- **Restore original** works on each section;
- axe accessibility audit on the content editor and the public pages at 1280 and 375 px: clean.

**Fixes found while testing:**
- The editor showed no “Saved” confirmation, because a redirect back to the same page didn’t update the URL. Saves now report inline.
- After **Restore original**, the form still showed the old values. It now refreshes.
- The route-loading spinner made Next.js send page content hidden behind the spinner until JavaScript ran, so visitors without JavaScript and some crawlers saw only the spinner. It is replaced by a top progress bar that appears on navigation, and pages now arrive fully visible.

All test edits were restored and the test image deleted. The site currently shows the original text.

---

## Version 3 (27 Oct 2026): ciaso.ca navigation, events, loader, content trimmed to the brand document

| Request | Delivered |
|---|---|
| **Loader** | A branded splash screen (CIASO logo, pulse, red progress bar) on first load. It is CSS-only, so it can never get stuck, and it fades out after about a second. There is also a spinner (“Loading…”) while pages load during navigation. |
| **Navbar = ciaso.ca tabs, with dropdowns** | Home · **About ▾** (About CIASO, FAQ, Testimonial) · **Services ▾** (all services, Settle, Work, Grow, Belong, Thrive, Your CIASO Journey) · Volunteer · Workshop · **Events ▾** (Current events, Past events) · Contact, plus the Get Support button. Dropdowns open on hover or click, close on Escape (returning focus) or an outside click, and become an accordion in the phone menu. URLs match ciaso.ca. |
| **All event-page information** | All 13 ciaso.ca event and workshop posts are migrated as 11 events (the French version and the recap of “Breaking Barriers” are merged into it). Each has its full text, the date, time, format, location and speakers (some read from the flyers), the flyer image, and photos (5 for Breaking Barriers). Each event has its own page with an Event schema, share links and a sticky details card. **Zoom IDs and passcodes are not repeated in the text** (to prevent meeting disruption), but they still appear on CIASO’s own flyer images. |
| **Admin: upload current and past events** | The Events admin has separate **Current** and **Past** tabs and “Add current event” / “Add past event” buttons. Each event takes a type, full details, a **flyer upload** and a **multi-photo gallery upload**. Uploads are checked for real JPG/PNG/WebP content (fakes are rejected), limited to 5 MB each, and stored in the database, so they work on any host. Single photos can be removed. |
| **Admin separate from the navbar** | No admin link anywhere on the public site, including the footer. Staff use `/admin` directly. |
| **YouTube inside Home/About, not its own section** | The intro video sits inside “Who we are” on the Home page. The co-founder’s Short sits inside “Who we are” on the About page. Placement is chosen per video in the admin. |
| **Less information, per the attached document** | Pages now use the document’s content: brand position and promise, positioning statement, campaign line, “who we are / who we help / how / what next”, the five pillars with exactly the listed services, the six-stage journey, #FromHereToThrive, the community connector (CIASO + partners), and problem → solution → outcome. **Removed:** the impact framework, partner logos, values list, helpful-links and content-series sections, the separate Journey/Resources/Get Involved pages, and the long service descriptions. Partner and Donate now go to the contact form. |

**Tests this round:**
- type-check and production build;
- all 13 public routes, plus media and redirects;
- dropdowns by click, Escape and outside click, on desktop and in the phone menu;
- admin: created a current event with a flyer and 2 photos, and confirmed it appeared on Events and the homepage but not on Workshop;
- a disguised non-image upload was rejected; removing a photo and deleting the event both work;
- axe accessibility audit on 13 public pages at 1280 and 375 px, plus 2 admin pages: clean after fixing a heading-order issue and a duplicate landmark label on the Events pages;
- no horizontal overflow on phones.

The test event was deleted afterwards.

**Not included:** the document’s other recommendations (the CIASO Thrive Canada Summit, the LinkedIn content series, and the consulting phases). These are proposals for CIASO, not current activities, so publishing them would misrepresent the organization. Add the Summit as an event in the admin once it is confirmed.

---

# Version 2 report

*27 October 2026. Version 2 rebuilds the v1 static redesign (in `archive/static-v1/`, with its audit) as a full-stack Next.js app. **The live ciaso.ca has not been changed.***

## What changed in v2

| Request | Delivered |
|---|---|
| **Animation** | Staggered fade-up of hero text. Slow "Ken Burns" zoom on hero photos. A floating glass panel. A scrolling campaign marquee that pauses on hover. Scroll-reveal for sections and cards (from below, left, right or zoomed). Journey timeline lines that draw in. Pulsing video play buttons. A red bar that grows under every page header. Hover lift on cards, a button shine, and pillar icons that rotate on hover. All of it switches off when the device asks for reduced motion, and content stays visible if JavaScript fails. |
| **More beautiful hero** | A full-bleed CIASO photo, blurred (7px), under a dark gradient with a subtle red glow. A large uppercase headline whose third line ("starts here.") is in red. Lead text and calls to action. A frosted-glass "How can we help today?" panel linking each pillar straight into Get Support. A scroll cue. |
| **A small hero on every page** | A shared `PageHeader` component on all 9 inner pages: blurred background photo, overlay, breadcrumb, eyebrow, title and lead, plus page-specific actions (buttons, steps, journey flow, share bar). The admin sign-in uses the same treatment. |
| **Full stack** | Next.js 15 App Router. A libSQL/SQLite database (5 tables). A public form API. Server actions. Zod validation. Signed-session auth with bcrypt. Optional SMTP notifications. |
| **Admin dashboard** | Dashboard; enquiries inbox (filters, search, pagination, status, notes, reply, delete, CSV export); create/edit/delete for events, stories and videos; password change; admin account management. |
| **Ready to deploy** | `output: 'standalone'`, a Dockerfile and docker-compose (SQLite on a volume), a Vercel + Turso path, an idempotent first-run setup, an environment variable template, and 301 redirects from the old WordPress URLs. |
| **CIASO YouTube videos** | Both verified videos, played through privacy-friendly click-to-load embeds (youtube-nocookie) on Home, About and Resources, with a YouTube link in the footer and contact page. More can be added from the admin by pasting a link. |

### The YouTube videos (verified 26 Oct 2026)

| Video | Source | Notes |
|---|---|---|
| `PqBoP5O63pw`, "Canada Integration and Settlement Organization" (22 s, Oct 2025) | CIASO's channel **@CanadaIntegrationandSettlement** (the only video on it) | Already embedded, hidden, on the current ciaso.ca homepage |
| `xrAnQn7yGrY`, a workshop announcement Short (96 s, Feb 2026) | **Dr. Leonard Ngwa's** personal channel (CIASO co-founder) | Embedded on the current ciaso.ca homepage. Labelled with its source on the new site |

The descriptions on the new site paraphrase each video's own YouTube description. **Please confirm** both should be shown, and give the first video a more descriptive title on YouTube if you can.

## Tests performed

| Test | Result |
|---|---|
| `tsc --noEmit` | No errors |
| `next build` (production) | Passes: 30 routes, about 113 KB first-load JavaScript per public page |
| All public routes; 404; robots; sitemap | 200 / 404 as expected |
| Old URLs (`/services-2`, `/testimonial`…) | 308 permanent redirects to the new pages |
| Form API: invalid input | 422 with field-specific messages |
| Form API: cross-origin post | 403 |
| Form API: honeypot filled | Pretend 201, nothing stored |
| Form API: unknown form | 404 |
| Form API: valid submission | 201 and stored |
| Form API: 6th post in 10 minutes from one IP | 429 |
| **Bug found and fixed** | An empty form submitted within 2.5 seconds of page load showed a fake "thank you" (the spam timer ran before validation). Validation now always runs first |
| Get Support (browser) | `?need=work` preselects the need and form topic. An empty submit shows 4 errors with a focused summary and `aria-invalid` fields. A valid submit shows a focused confirmation |
| Admin sign-in | Wrong password: generic error. Correct password: dashboard. `/admin` redirects to sign-in when signed out |
| Admin: enquiries | The 3 test submissions appeared with counts and a "new" badge. Status changed to "In progress" with notes and saved |
| Admin: events | A created future event appeared as **upcoming** on Home and Resources, with its Register button and deadline. Delete works |
| Admin: videos | A bad link was rejected with a message. A Shorts URL was parsed correctly. A hidden video does not appear publicly. Delete works |
| **Standalone deploy simulation** (fresh empty DB, production mode) | First-run setup created tables, 12 events, 8 stories, 2 videos and the admin. Pages, images, API and sitemap work. Re-running setup is safe. **Bug found and fixed:** the build was missing libSQL's native binary, which would have crashed Docker deploys; it is now included via `outputFileTracingIncludes` |
| axe-core 4.10, WCAG 2.0–2.2 AA + best practice: 10 public pages at 1280/375 px, plus login, dashboard, enquiries, event form and account | All clean after fixing two issues: a low-contrast YouTube link on dark sections, and an empty table header in the admin |
| Horizontal overflow at 375 px | Fixed: side-reveal animations briefly widened 4 pages. `main` now clips horizontal overflow |
| Visual review | Desktop (1440) and mobile (375) screenshots of the home hero, page headers, video section, stories and admin |

All test submissions and the test event were deleted afterwards. The local database contains only CIASO's real content plus the local admin account.

**Not tested here:**
* building the Docker image (Docker isn't installed on this machine; the standalone runtime it uses was tested);
* Vercel + Turso;
* SMTP email delivery;
* real mobile devices and screen readers.

## Before going live

1. **Choose hosting:** Docker on a VPS or platform with a persistent volume (recommended), or Vercel + Turso. Set `SITE_URL`, a fresh `AUTH_SECRET` and a strong `ADMIN_PASSWORD`.
2. **Configure SMTP** if CIASO wants an email for each new enquiry. Otherwise staff check `/admin`.
3. **Privacy policy:** still needed before collecting personal information. The forms already include consent and data-use statements.
4. **Testimonial consent:** the 8 seeded stories are published (as they are on the live site) but marked "Consent: Not recorded" in the admin. After confirming consent, tick it on each story. The admin won't let a story be saved as published without it.
5. **Open questions carried over from v1:** which phone number(s) to show, office hours (9–5 or 9–6), current partners and logo permissions, ESL availability, photo licences, how donations work, and impact data. See `archive/static-v1/IMPLEMENTATION-REPORT.md`.
6. **Domain cutover:** keep `/home-francais/` and the old workshop posts reachable, since the new site links to them.
