# CIASO website – full-stack (Next.js)

Public website, form API and staff admin dashboard for the **Canada Integration and Settlement Organization (CIASO)**.

* **Frontend:** Next.js 15 (App Router) + React 19, CIASO's red/black/white design system, animated blurred-photo heroes, accessible to WCAG 2.2 AA.
* **Backend:** Next.js route handlers and server actions, a libSQL/SQLite database, Zod validation, rate limiting, spam protection, and optional email notifications.
* **Admin dashboard** (`/admin`): enquiries inbox, events, success stories, YouTube videos, and admin accounts.

## Quick start (local)

Requires Node 20.12+.

```bash
npm install
```

```bash
cp .env.example .env.local
```

Edit `.env.local`: set `AUTH_SECRET` (a long random string) and `ADMIN_PASSWORD` (12+ characters).

```bash
npm run db:setup
```

```bash
npm run dev
```

* Website: http://localhost:3000
* Admin: http://localhost:3000/admin (sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`)

`npm run db:setup` creates the tables and loads CIASO's events (with flyers), testimonials and YouTube videos into empty tables. It also creates the first admin. It is safe to run again. `npm run db:setup -- --reset-events` replaces all events with the seed events.

## What's where

```
src/app/(site)/        Public pages, matching the ciaso.ca tabs: home, about, faq, testimonial,
                       services, volunteer, workshop, events (current), events/past, events/[id],
                       contact, get-support, accessibility
src/app/admin/         Login, dashboard, enquiries (+ CSV export), events, stories, videos, account
src/app/admin/actions.ts   Server actions for every admin change (each checks the session)
src/app/api/submissions/[type]/route.ts   Public form API (support | contact | volunteer | partner)
src/components/        Header, Footer, PageHeader, forms, VideoEmbed, EventCard, StoryCard…
src/lib/               db, auth/session, validation (Zod), data queries, mail, rate limit, site details
src/middleware.ts      Protects /admin
db/schema.mjs          Database schema (applied automatically on start)
src/lib/content-schema.ts  Every editable website text: field definitions + original text (defaults)
db/seed-data.mjs       Initial stories and videos · db/seed-events.mjs + db/seed-images/  all ciaso.ca events with flyers
scripts/setup-db.mjs   Tables + initial content + first admin
src/app/globals.css    Design system   ·   src/app/motion.css   Heroes, videos, animations
archive/static-v1/     Previous static version (reference only)
```

## Using the admin dashboard

| Section | What staff can do |
|---|---|
| **Website content** | Edit **every text, list and header image** on the public site, grouped as Organization (contact details & social links, brand messages, footer), Pages (Home, About, Services, FAQ, Testimonial, Volunteer, Workshop, Events, Contact, Get Support, Accessibility) and Services (five pillars & their services, the six journey stages, community connector, “What should I do next?” buttons). Lists can be added to, removed and reordered (e.g. FAQ questions). Header images can be uploaded or chosen from built-in photos. Search-engine titles and descriptions are editable per page. Changes publish immediately. Each section has **Restore original**. Unsafe links (e.g. `javascript:`) are rejected with a message |
| **Dashboard** | New enquiries per form, latest enquiries, upcoming events, content counts |
| **Enquiries** | Filter by form, status or search; open an enquiry; reply by email or phone; set status (New / In progress / Closed); add internal notes; delete; **export CSV** |
| **Events** | Separate **Current** and **Past** tabs, with “Add current event” and “Add past event”. Each event has a type (Workshop or Event), date, time, format, location, speaker, short summary, full details (simple formatting), registration link, a **flyer upload** and a **photo gallery upload** (JPG/PNG/WebP up to 5 MB, stored in the database). Events move from Current to Past automatically after their date (Edmonton time). Workshops also appear on the Workshop page |
| **Stories** | Add or edit testimonials, set featured and order, filter categories, French/English. A story **can't be published until consent is ticked** |
| **Videos** | Paste any YouTube link (watch, youtu.be or Shorts) and choose where it appears: inside “Who we are” on the Home page or the About page |
| **Account & admins** | Change your password; add or remove admin accounts |

Every new form submission is saved to the database. If SMTP is configured, it is also emailed to `NOTIFY_EMAIL`.

## Emails, logo, partners and menu

* **Emails:** every form sends (1) a notification to `NOTIFY_EMAIL` (admin@ciaso.ca) and (2) an automatic reply to the visitor, both **from admin@ciaso.ca** (`SMTP_FROM`). The reply uses the message in Admin → Website content → *Emails & confirmation popup* (`{name}` and `{service}` are filled in). Each enquiry in the admin shows whether its emails were sent. At most 3 automatic replies go to the same address per day.
* **Turning email on:** set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER` and `SMTP_PASS` to the outgoing-mail settings of the admin@ciaso.ca mailbox (from CIASO's email provider). Without them, forms still work and save to the admin, but no email is sent.
* **Testing email locally:** run `node scripts/mail-catcher.mjs`, then set `SMTP_HOST=127.0.0.1` and `SMTP_PORT=2525` in `.env.local`. Messages are saved to `data/mail/` instead of being delivered. Example renders are in `docs/screenshots/`.
* **Logo & images:** Admin → Website content → *Logo & images* (logo for header, footer, loader, admin and emails; fallback photos; social sharing image). Page header images are on each page’s section.
* **Partner logos:** Admin → Website content → *Partner logos*. Add, remove and reorder partners and upload logos, with an optional website link. They’re shown on Home and About and can be hidden.
* **Navigation menu:** Admin → Website content → *Navigation menu*. Edit tab labels and links, add or remove tabs, and write dropdown items as `Label | /link | description`. The red button’s text and link are editable too.

## Environment variables

See `.env.example`. Required in production: `SITE_URL`, `DATABASE_URL`, `AUTH_SECRET`, and `ADMIN_EMAIL` / `ADMIN_PASSWORD` for the first run. SMTP variables are optional.

`SITE_URL` is used at **build time** for canonical and Open Graph URLs, so set it before `npm run build`.

## Deploy

### Option A – Docker (any VPS, Render, Railway, Fly.io…) – recommended

The database is a file on a persistent volume.

```bash
cp .env.example .env
```

Fill in `SITE_URL`, `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` and optionally SMTP, then:

```bash
docker compose up -d --build
```

On start, the container runs `scripts/setup-db.mjs` (creating tables, content and the admin only if missing) and then the server on port 3000. Put it behind HTTPS (for example Caddy, Nginx, or your platform's TLS). Back up the `ciaso-data` volume.

### Option B – Vercel + Turso (database) + Hostinger (domain & email)

Vercel's file system is read-only, so the database must be hosted. **Without `DATABASE_URL` the site cannot start on Vercel.** Turso's free plan is enough.

**1. Create the database (Turso)**
- Sign up at turso.tech, create a database (e.g. `ciaso`, region close to Alberta such as `aws-us-west-2`).
- Copy the **Database URL** (`libsql://ciaso-<you>.turso.io`) and create a **token** (Database → Create token).

**2. Load the tables, content and first admin** – once, from your computer, in the project folder. Put these in `.env.local` temporarily (or a separate `.env.production.local`):

```
DATABASE_URL=libsql://ciaso-<you>.turso.io
DATABASE_AUTH_TOKEN=<token>
ADMIN_EMAIL=admin@ciaso.ca
ADMIN_PASSWORD=<a strong password, 12+ characters>
```

```bash
npm run db:setup
```

Afterwards, switch `.env.local` back to `DATABASE_URL=file:./data/ciaso.db` for local development.

**3. Environment variables on Vercel** (Project → Settings → Environment Variables, for Production):

| Name | Value |
|---|---|
| `DATABASE_URL` | `libsql://ciaso-<you>.turso.io` |
| `DATABASE_AUTH_TOKEN` | the Turso token |
| `AUTH_SECRET` | a long random string (`node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`) |
| `SITE_URL` | `https://ciaso.ca` (or your `https://….vercel.app` address until the domain is connected) |
| `SMTP_HOST` | `smtp.hostinger.com` |
| `SMTP_PORT` | `465` |
| `SMTP_USER` | `admin@ciaso.ca` |
| `SMTP_PASS` | the admin@ciaso.ca mailbox password |
| `SMTP_FROM` | `CIASO <admin@ciaso.ca>` |
| `NOTIFY_EMAIL` | `admin@ciaso.ca` |

Then **Deployments → Redeploy** (environment changes only apply to new deployments).

**4. Connect the domain (Hostinger DNS)** – in Vercel add `ciaso.ca` and `www.ciaso.ca` (Project → Settings → Domains). In Hostinger hPanel → Domains → DNS: set the `@` **A** record to `76.76.21.21` and the `www` **CNAME** to `cname.vercel-dns.com` (use the exact values Vercel shows). **Do not change the MX, SPF or DKIM records** – they keep admin@ciaso.ca email working.

Notes: uploads are limited to 4 MB per save (Vercel rejects larger requests). The form rate limiter is in-memory, so on serverless it limits per instance; add a shared store (e.g. Upstash) if spam becomes a problem.

### Option C – Plain Node server

```bash
npm ci
```

```bash
npm run build
```

```bash
npm run db:setup
```

```bash
npm start
```

### Domain cutover from the current WordPress site

The new site keeps the same URLs as ciaso.ca for /about, /faq, /testimonial, /volunteer, /workshop, /events and /contact. `/services-2` and `/contact-us` redirect to /services and /contact.

All event and workshop posts are now in the new site with their flyers. The French homepage (`/home-francais/`) is still linked, so keep it reachable or migrate it before switching DNS.

The admin dashboard is not linked from the public site. Staff go directly to `/admin`.

## Security notes

* Admin pages are protected twice: by middleware and by a session check in every page and action. Sessions are signed JWT cookies (httpOnly, SameSite=Lax, Secure in production, 8-hour expiry).
* Passwords are hashed with bcrypt (cost 12), and sign-in attempts are rate-limited.
* Server actions have Next.js's built-in origin check. The public API rejects cross-origin posts, validates with Zod, uses parameterized SQL, and has a honeypot, a minimum fill time and a per-IP rate limit.
* The CSV export guards against spreadsheet formula injection.
* Secrets live only in environment variables. `.env*` and the database file are git-ignored.
