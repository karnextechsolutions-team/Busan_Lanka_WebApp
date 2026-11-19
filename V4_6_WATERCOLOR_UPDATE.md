# Busan Lanka V4.6 — Uploaded Watercolor Waves UI

This is the COMPLETE V4.5 project, not a CSS-only patch. The client-supplied
1916×821 watercolor waves image is bundled as `assets/busan-original-watercolor-waves-v46.webp`
and displayed behind Destinations, Services, Packages, AI Guide, QR/Journey, Gallery, Reviews and CTA.

- PDF-inspired homepage & photographic hero slider retained.
- Real uploaded watercolor illustration used; CSS semi-transparent ivory overlay keeps text readable.
- Primary pink→blue logo subtitle gradient remains on buttons, AI, and booking actions.
- Mobile 4-tab navbar and responsive layouts retained.
- V4.5 admin syntax fix, review relative times/read more, CMS and moderation retained.
- Supabase SQL, storage and Edge Functions, Netlify build, Gemini function source retained.
- This is a visual update; no SQL migration necessary from V4.5.

## Ubuntu local run

```bash
cd ~/Downloads
unzip Busan_Lanka_WebApp_v4_6_Watercolor_Image_Design.zip
cd Busan_Lanka_WebApp_v4_6_Watercolor_Image_Design
chmod +x RUN_UBUNTU.sh
./RUN_UBUNTU.sh
```

Website: http://localhost:8080
Admin: http://localhost:8080/admin.html
Stop previously running `8080` servers first. Hard reload `Ctrl+Shift+R` if you see cached images.

## Configure Supabase & Gemini

Copy **only your own public project URL and publishable key** into `supabase-config.js`
for local run, or set `PUBLIC_SUPABASE_URL` / `PUBLIC_SUPABASE_ANON_KEY` in Netlify.
Do NOT expose any secret/API key in browser code.
Real database, AI and review storage require existing migrations/Edge Functions setup;
this ZIP does not include anyone's credentials. See `V4_4_REVIEWS_SETUP_SINHALA.md`.

## Deployment

`node tools/build-netlify.mjs` creates the safe static `dist/` with this image asset.
Only publish `dist/`; never publish your SQL, `.env`, Supabase functions or secrets.

## Visual tuning

Modify `watercolor-ui-v4-6.css` only: overlay opacity is controlled by the `rgba(255,...,.XX)` values
above each image URL. Lower `XX` for brighter color; increase for softer/lighter watercolor.
The supplied image is retained unchanged visually and only converted to WebP for performance.

## Tests

`node --check admin.js`
`node tests/smoke.mjs`
`node tests/reviews-ui-v4-5-smoke.mjs`
`node tools/build-netlify.mjs`
