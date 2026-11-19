# Busan Lanka V3.4 — Vibrant Brand Edition

Client feedback: Previous versions looked too white. This release strengthens the color identity across the full website while retaining accessible typography and clear photos.

## What changed
- Full-width peach/sunset destination section
- Tropical mint/sky-blue package section
- Dark jewel-tone immersive AI guide panel
- Warm orange/coral QR tour introduction
- Deep green/blue travel photo and review gallery section
- Orange/magenta/blue conversion banner
- Refined logo-gradient accents in menus, buttons and mobile four-tab navigation
- Matching admin content studio refinements

## Visual QA
Local Chromium static-render layout checks at 320px, 412px, 768px and 1440px showed no horizontal overflow. The browser preview uses the project UI and bundled travel assets; automated test cases cover the data and configuration. Live Supabase and Gemini services cannot be verified without your project credentials.

## What did not change
The package catalog, no-public-prices rule, Supabase CMS integration, Gemini Edge Function integration, enquiry behavior, and travel story features are retained. Client-approved photography, prices, social links and real project credentials are not included.

## Run
```bash
./RUN_UBUNTU.sh
```

## Netlify
The Netlify build copies the new vibrant and admin styles into dist/. Supabase configuration stays server-variable driven in the Netlify build. Keep Gemini secrets in Supabase Edge Function Secrets only.

## Version note
Cache version in `sw.js` incremented to avoid old V3.2/V3.3 CSS being displayed in installed PWA mode.
