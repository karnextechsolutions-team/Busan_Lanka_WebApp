# BUSAN LANKA V4.7 — Enquiry Channels + Responsive Mobile + Reviews Carousel

## 1. Ubuntu local preview

```bash
cd ~/Downloads
unzip Busan_Lanka_WebApp_v4_7_Enquiries_Mobile_Reviews.zip
cd Busan_Lanka_WebApp_v4_7_Enquiries_Mobile_Reviews
chmod +x RUN_UBUNTU.sh
./RUN_UBUNTU.sh
```

- Website: `http://localhost:8080`
- Admin: `http://localhost:8080/admin.html`
- Stop an earlier port-8080 server with `Ctrl+C`. To refresh cached assets, use `Ctrl+Shift+R`.
- **Local Demo:** A guest enquiry is saved to **that same browser's localStorage**. Opening `admin.html` in that same browser/origin lets you see it in Tour Enquiries. It is **not shared** with other devices.
- When deploying a new version, use your existing *public* URL and publishable key in `supabase-config.js`. Never put private server keys or Gemini secrets in the frontend.

## 2. Supabase — EXISTING project (important)

If you already ran V4.4/V4.6 SQL, run **only**:

`docs/V4_7_ENQUIRY_CHANNELS_ADD.sql`

in Supabase Dashboard -> SQL Editor. This adds `tour_enquiries.preferred_channel` without deleting records. Old records will show as `unknown` instead of pretending they arrived via WhatsApp.

For a completely **new project**, use `docs/supabase.sql` (includes old CMS/reviews schema + this addition), then set the authorized admin UUID in `cms_admins` as described in the earlier setup guide.

### Deploy the updated enquiry Edge Function

From this project directory, with Supabase CLI available:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase functions deploy submit-enquiry --no-verify-jwt
```

Other existing functions (`travel-ai`, `submit-review`, `review-feed`) only need deployment if not previously deployed or if you need the new exact total review count. For the **exact total approved review count** (including more than 24 reviews), redeploy:

```bash
npx supabase functions deploy review-feed --no-verify-jwt
```

Ensure the existing `BUSAN_RATE_LIMIT_SALT` and `BUSAN_ALLOWED_ORIGINS` Secrets remain configured for the *actual* website origin (including your Netlify HTTPS URL). There is no invented WhatsApp/Telegram/Instagram/Messenger credential in this code.

## 3. Admin social settings

Admin -> Site Settings -> **Enquiry channels & inbox links**:

- WhatsApp: international phone digits, e.g. `94xxxxxxxxx`, and checkbox enabled.
- Telegram: public username `@YourBusiness` or `https://t.me/YourBusiness`, plus checkbox enabled.
- Instagram: public business username or `https://instagram.com/YourBusiness`, plus checkbox enabled.
- Messenger: business Facebook Page username / public Page URL (`https://facebook.com/YourPage`), plus checkbox enabled.

Use only verified client-owned account handles; test each inbox link on a phone. Disable unwanted channels with the checkbox. Click **Save & Publish**. Customers see only enabled channels with valid destinations. Save settings in Supabase to share them between devices.

## 4. Enquiry workflow / delivery limitation

1. Visitor fills out form and clicks a preferred app icon.
2. App attempts to **save the enquiry first** in `tour_enquiries`, including `preferred_channel`.
3. If saved, WhatsApp opens with a pre-filled draft. For Instagram, Messenger and a normal Telegram account, the text is copied and the chosen chat opens; guest must **paste and press Send**. Telegram share bots/business deep links require a separate official provider setup to prefill a specific business thread.
4. The Admin -> Tour Enquiries list contains saved leads and a button to open the configured channel's inbox. **It does not read social-media inboxes or verify whether a message was sent.** Direct inbox integration would require respective approved APIs/connectors and platform authorization.
5. A failed cloud save is shown as an error; it is not falsely reported as successful. Verify public visitors can reach the Edge Function after deployment.

To test: submit a test enquiry and check `tour_enquiries` via Supabase Table Editor; confirm `preferred_channel`, then sign in to Admin and click **Refresh** in Tour Enquiries.

## 5. Mobile & reviews

- The header has a hamburger menu at phone/tablet sizes; it includes Destinations, Services, Reviews, Tours, Why Us and Contact.
- Logo icon and company name are bigger on mobile, while the four-tab bottom nav uses a uniform icon presentation (AI is not in a separate pink/blue box).
- Reviews: 3 visible on desktop, 2 on tablet, 1 on mobile; scroll horizontally, use arrows or swipe; auto-advance while visible. Stops when hovered, keyboard focused, document hidden or reduced motion is preferred.
- Counter shows the **total approved** reviews returned by `review-feed` (includes the exact count after deploying the updated feed Edge Function) plus approved legacy CMS reviews. Pending/rejected submissions are not counted.

## 6. Build and test

```bash
node --check app.js
node --check admin.js
node tests/v47-engagement-smoke.mjs
node tests/smoke.mjs
node tests/reviews-ui-v4-5-smoke.mjs
node tests/pdf-home-v4-smoke.mjs
node --experimental-strip-types tests/reviews-backend-smoke.mjs
node tools/build-netlify.mjs
```

Netlify: build command `node tools/build-netlify.mjs`, publish directory `dist`.
Use Netlify environment variables `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` (publishable key, **not** service role). Real Supabase access and actual social-app behavior must be tested on your Netlify domain; browser-local tests cannot validate production credentials.
