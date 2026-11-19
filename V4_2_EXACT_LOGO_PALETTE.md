# Busan Lanka V4.2 — Exact Client Logo Palette

This version updates the PDF-approved homepage (V4.1) to the client-supplied logo palette, without altering JS features, business data or Supabase SQL.

## Exact brand colors
- Forest green: `#1B673D` (minimal accent)
- Gold: `#E99E45`
- Pale gold: `#FAD888`
- Pink: `#F4566C`
- Red: `#CC0503`
- Orange: `#F75703`

## Visual improvements
- Warm off-white background, no cool blue or purple wash
- Original watercolor mist SVG with all six exact palette colors
- Soft curved brand-color wave SVG in main sections
- Richer destinations, services, tour catalogue, AI guide, gallery and final CTA sections
- Matching hero action buttons, destination tags, mobile bottom nav and admin accents
- No videos, scroll animation, data schema changes or external animation dependencies
- Versioned service worker cache and Netlify build allow the new theme to show reliably

## Run
```bash
./RUN_UBUNTU.sh
```
Open `http://localhost:8080` and `http://localhost:8080/admin.html`.

## Deploy (Netlify)
Build command: `node tools/build-netlify.mjs`
Publish directory: `dist`
Use only `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` for the browser build. Supabase Edge Function secrets such as `GEMINI_API_KEY` must remain server-side.

## Verification
`node tests/smoke.mjs && node tests/pdf-home-v4-smoke.mjs && node tests/v3-smoke.mjs && node tests/gemini-smoke.mjs && node tests/brand-background-v4-2-smoke.mjs && node tools/build-netlify.mjs`
