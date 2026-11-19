# Busan Lanka V4.3 – Full CMS + Automatic Hero Slider + Pink/Blue Brand Buttons

## What changed
- Signature pink → blue gradient now on public CTA buttons, nav booking button, inquiry button, floating AI button and logo subtitle badge.
- Admin → Hero Slider: add/delete/reorder by deleting+adding slides; upload different images; change title, kicker and lead; auto-slide ON/OFF and interval 3–20 seconds. Existing image changes appear after Save & Publish + public refresh.
- Admin → Homepage Content: grouped editable labels and descriptions for navigation, booking form, services, Why Us, tours, AI demo, QR tour, gallery, CTA and footer; grouped editable section background images.
- Existing separate CMS tabs retained for packages/day-by-day photos, destinations, galleries, guest reviews, stories, and all translations.
- Business phone and office address can now be configured; public footer shows them when provided.
- Destination search choices now follow published destinations instead of fixed names.
- Colors for calm watercolor backgrounds remain logo-inspired; blue only used for signature CTA gradients.

## Local Ubuntu
```bash
cd ~/Downloads/Busan_Lanka_WebApp_v4_3_Full_CMS_Slider
chmod +x RUN_UBUNTU.sh
./RUN_UBUNTU.sh
```
Website: http://localhost:8080 – Admin: http://localhost:8080/admin.html

## Important: Supabase
Local demo writes to this browser only. For shared real data configure `supabase-config.js` with your public URL + publishable key, run `docs/supabase.sql` and add an authorized admin. Existing Supabase and Gemini secrets are NOT included in this ZIP.
Netlify build uses PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY environment variables, and keeps your Supabase Edge Function code out of public dist/.

## Note
Translations are editable separately per language. Optional translations fall back to English. Hero slides cannot auto-advance when motion-reduction is enabled. Real production AI and cloud storage must be tested in your own credentials environment.
