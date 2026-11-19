# Busan Lanka V4.5 — Admin White Screen & Compact Reviews Fix

## Fixed

1. **Admin white screen**: Fixed the invalid nested quote/template-literal expression in `admin.js` (previously reported as `Unexpected identifier 'checked'` on line 123). Admin Dashboard and Review Moderation can initialize again.
2. **Relative review submission age**: Approved guest reviews show `Just now`, `2 hours ago`, `2 days ago`, `2 weeks ago`, etc. The calculation uses the review's `created_at` value, not the "Date visited" field. Legacy CMS reviews with no submission timestamp do **not** display an invented posting date.
3. **Long review cards**: Longer review texts show five lines by default, with **Read more / Read less** to expand and collapse. Visit month and trip type remain visible below the review.
4. Updated CSS/JS references and service worker cache version to avoid reusing stale V4.4 files.
5. Added `tests/reviews-ui-v4-5-smoke.mjs` including syntax regression test for Admin JS.

## Ubuntu Local Run

```bash
cd ~/Downloads
unzip Busan_Lanka_WebApp_v4_5_Admin_Reviews_Fix.zip
cd Busan_Lanka_WebApp_v4_5_Admin_Reviews_Fix
./RUN_UBUNTU.sh
```

Public site: http://localhost:8080
Admin CMS: http://localhost:8080/admin.html

If old site is cached: hard refresh `Ctrl+Shift+R`. If a previously installed PWA still serves old files, unregister its service worker and clear cached site data, then reload. Note: clearing **site data** may erase local demo content, so first back up any unpublished local edits. Never clear local storage unless you've backed up data or it is disposable.

## Supabase

Existing V4.4 `docs/reviews_v4_4.sql` migration remains valid. No SQL migration is needed for this display-only V4.5 fix. Supabase project URL/publishable key configuration stays in `supabase-config.js`, OpenAI/Gemini secrets stay server-side. The bundled code intentionally does not include credentials.

## Checks performed

- V4.5 JS module syntax and date/card smoke tests
- Existing 28 content smoke checks and PDF, V3, Gemini smoke checks
- Reviews Edge Function test with Node 22's `--experimental-strip-types` (mock only)
- Netlify `node tools/build-netlify.mjs` build
- Chromium inline admin render at 320px: Dashboard visible, no JS runtime errors

Actual mobile hardware and live Supabase cloud interaction not tested here. This release is focused on the white-screen and review layout/date regressions.
