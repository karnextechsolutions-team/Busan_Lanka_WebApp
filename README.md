## V4.9: Mobile package itinerary + searchable country selector

- **Admin → Reviews & Moderation:** search countries by a few letters/code, choose flag/country using mouse or keyboard. Review data and Supabase SQL unchanged.
- **Public tour package popup:** mobile/tablet single-column itinerary, horizontally swipeable days, full-width day descriptions, highlights and photos. Larger mobile modal for comfortable reading.
- Existing V4.8 GET review-feed/CORS update preserved. No new SQL or function deployment required for these UI fixes.
- `node tools/build-netlify.mjs` builds static Netlify `dist/`. Deploy by pushing to GitHub-connected Netlify repository.

# CURRENT RELEASE — V4.7 Enquiry Channels, Mobile Navigation & Reviews Carousel

This ZIP is the complete V4.6 watercolor website plus the V4.7 functionality update. It retains all prior CMS, package pages, QR tour, reviews moderation, Supabase and Gemini source.

**Read `V4_7_SETUP_SINHALA.md` first for exact Ubuntu commands, existing-project SQL migration, updated Edge Function deployment, chat link limitations and testing.**

**LATEST: V4.6 — Uploaded Watercolor Waves. Read `V4_6_WATERCOLOR_UPDATE.md` for current run instructions.**

**CURRENT VERSION: V4.2 — EXACT CLIENT LOGO PALETTE (see `V4_2_EXACT_LOGO_PALETTE.md`)**

# Busan Lanka Travel & Tours — V4 PDF Homepage Edition

This complete runnable source project is based on the client's supplied `Busan Lanka Homepage.pdf` (3 pages) and the user's V3.5 source ZIP. **The previous scroll animation sections are removed.** This is a functioning website layout, not a screenshot.

## Run on Ubuntu

```bash
cd ~/Downloads
unzip Busan_Lanka_PDF_Homepage_v4.zip
cd Busan_Lanka_PDF_Homepage_v4
chmod +x RUN_UBUNTU.sh
./RUN_UBUNTU.sh
```

Visit http://localhost:8080 and http://localhost:8080/admin.html. QR demo: http://localhost:8080/?tour=1. If port 8080 is already in use, stop the old local server first. Refresh with Ctrl+Shift+R to clear old assets. Service worker cache has a new version identifier.

## Matches the supplied PDF

- Glass-style logo/navigation over a photographic Sigiriya hero with **"Wake up inside the postcard."** and the PDF's primary CTAs.
- Floating destination / travel date / travellers search form; destination filters available itinerary cards. The selected date/group size is carried into the enquiry draft. A search is not a confirmed booking or a price lookup.
- Asymmetric popular destinations layout: large Sigiriya, smaller Kandy and Golden Beaches, with a View All toggle.
- 4-card "Everything for the trip, in one place" services grid.
- Image-backed green "Why Busan Lanka" section with three translucent trust cards.
- Rounded pink–blue CTA and matte black footer, designed like PDF page 3.
- Fully responsive mobile/tablet/desktop; existing four-icon mobile navigation remains.

## Preserved from previous project

- No public package pricing; category filters, package details, complete day-by-day itineraries and individual destination photo galleries.
- Guest photos/reviews and social media, with no invented reviews or contact details.
- WhatsApp/email enquiry flow; sends a pre-filled draft the visitor must send. Database lead storage depends on Supabase setup.
- Gemini travel AI Edge Function source, multilingual UI, QR tour, voice guide and location features (all subject to their existing requirements and permissions).
- Admin CMS for hero slides, destinations/images, packages/days, gallery, reviews, translations, contact and social settings. Added editable **Why section and final CTA background images** under Site Settings. New services, why-us and CTA text is editable under Texts & Translations.
- Supabase SQL, RLS, functions, Netlify safe static build and GitHub helper scripts remain bundled.

## Supabase / deployment

`supabase-config.js` is browser-public configuration. **Never put a Gemini/OpenAI key or Supabase service-role key in it.** Actual Gemini secrets must remain on Supabase Edge Functions. The ZIP includes no private credentials. If your previous local V3.5 project has a configured `supabase-config.js`, copy *your own* public URL/publishable-key settings into the new folder before testing. Old CMS edits and genuine images can remain in Supabase; only unchanged sample hero/destination copy is automatically migrated to the PDF text. Custom edits are preserved.

Netlify: import the GitHub repository, build with `node tools/build-netlify.mjs`, publish `dist`. Set `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` in Netlify if using Supabase. See `DEPLOY_GUIDE_SINHALA.md` and `GEMINI_SETUP_SINHALA.md` for the prior backend configuration workflow.

## Test commands

```bash
node tests/smoke.mjs
node tests/v3-smoke.mjs
node tests/gemini-smoke.mjs
node tests/pdf-home-v4-smoke.mjs
node tools/build-netlify.mjs
```

Tests above cover static content/security and Netlify build, not live Supabase or real Gemini API calls. Browser layout was visually checked at 320, 360, 412, 1024 and 1440 pixel viewport widths using an inline static rendering. Complete interactive device QA should still be carried out before a public launch.

## File map

- `index.html` — public homepage markup, dialogs and mobile tabs
- `pdf-home-v4.css`, `pdf-home-v4.js` — approved PDF design and homepage interactions
- `app.js`, `data.js`, `content-store.js`, `ai-service.js` — existing functionality
- `admin.html`, `admin.js`, `admin.css` — editable CMS
- `assets/` — bundled concept photography and icon; replace with client-licensed approved photos before launch
- `docs/supabase.sql`, `supabase/functions/` — backend
- `tools/build-netlify.mjs` — restricted publication build

**Important:** PDF page 3 lists placeholder phone, email, and office details. This project intentionally displays only contact details configured by the admin. There are no invented contact details or paid package prices.

## V4.1 logo-color watercolor background

The PDF homepage layout remains unchanged. A new `brand-background-v4-2.css` and two lightweight, locally served SVG overlays in `assets/` add warm ivory, soft gold/orange/pink/red mist and gentle wave shapes behind destinations, services, tours, AI, QR Guide, gallery and CTA. Hero imagery, booking functions, CMS, and backend integrations are untouched. Deep green is a subtle accent. No autoplay video, parallax script or heavy animations were added. For production run `node tools/build-netlify.mjs`; preview with `./RUN_UBUNTU.sh`.


## Latest V4.3 improvements
Read `V4_3_UPDATE_GUIDE_SINHALA.md` for exact slider, logo pink-blue CTA, and full page editor instructions.

## V4.4 — Guest Reviews & Moderation

Guest review form (country/flag, five stars, visited month/year, trip type, title, text, up to two photos), separate Reviews navigation, and Supabase-backed moderation with private photos. Use **`V4_4_REVIEWS_SETUP_SINHALA.md`**. If your existing database already has the V4.3 schema, run **`docs/reviews_v4_4.sql`** in Supabase SQL Editor; for fresh projects use the combined **`docs/supabase.sql`**. Deploy **`submit-review`** and **`review-feed`** Edge Functions. Reviews only become public after an admin approves them. Local Demo Mode uses the same browser and is not cloud published. The public site still shows no tour prices.

## V4.5 admin/reviews stability patch

This release fixes the V4.4 Admin white screen (`admin.js` parse error), adds submitted-date-relative labels (from `created_at`), and collapses long reviews to five lines with `Read more / Read less`. See `V4_5_FIXES_SINHALA.md`. No schema migration is required if V4.4 reviews SQL is already applied.

## V4.8 — Live reviews CORS + tablet header fix

See [`V4_8_LIVE_CORS_TABLET_FIX.md`](V4_8_LIVE_CORS_TABLET_FIX.md). Public review feed now uses GET (POST remains supported for older clients); precise origin allowlisting and Edge Function JWT config are included. After deploying, set `BUSAN_ALLOWED_ORIGINS` in Supabase Secrets and redeploy `review-feed` as directed. Tablet widths now use a left-aligned brand and right-aligned Language + Menu controls.
