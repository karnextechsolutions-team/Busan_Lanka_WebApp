# V3.2 Mobile Responsive Update — 16 Nov 2026

This version is built from Busan Lanka V3.1 with the Gemini AI Edge Function preserved.

## What changed
- Mobile hero layout and automatic background-image slider stay within the screen at 320–600px.
- Readable hero heading and buttons for narrow phones; photographic backgrounds use `background-size: cover` rather than distorting images.
- Mobile bottom navigation redesigned as a floating black/gold 4-tab bar: **Home / Tours / AI Guide / My Tour**. Contact can still be reached from Plan My Trip / enquiries.
- Bottom tabs auto-hide while tour package details, contact form, live AI panel, photo lightbox or My Tour overlay are open.
- Fixed mobile horizontal scroll/overflow on the AI preview, hero, gallery, destination and itinerary sections.
- Tablet 601–820px layout refined, desktop retained.
- PWA cache name changed so visitors can receive the latest styles.

## Installation
Extract ZIP and run:

```bash
cd ~/Downloads/Busan_Lanka_WebApp_v3_2_Mobile_Fix
./RUN_UBUNTU.sh
```
Open `http://localhost:8080` and admin `http://localhost:8080/admin.html`.
If an old server still runs on port 8080, stop it (`Ctrl+C`) before starting this one.

**Already connected Supabase?** The ZIP contains a blank `supabase-config.js` template; copy your existing configured `supabase-config.js` from your working V3.1 folder into this new V3.2 folder. It should contain only the project URL and publishable/anon key, NEVER a service role key. Supabase Edge Function secrets (including `GEMINI_API_KEY`) are stored on Supabase and do not need to be re-entered when keeping the same project.

**Already edited content?** Local demo edits are browser-local. They appear only on the same site origin and browser profile; cloud-published content is read from Supabase when configured. This ZIP does not erase or migrate your cloud data.

If the browser shows old cached content: reload with `Ctrl+Shift+R`. In Chrome, DevTools → Application → Service Workers → Update can refresh the older PWA. Avoid clearing site data if you have unsaved local demo edits.

## Testing notes
- Chromium inline-rendered responsive layout at 320, 360, 375, 390, 412, 430, 600, 768, 820, 1024, 1280, 1440px: no document horizontal overflow.
- Chromium UI test with V3 JavaScript: 4 nav tabs, 4 hero slides, 6 packages, 6 destinations, AI panel opening, package day selection, no runtime errors.
- 28 pre-existing smoke checks, V3 smoke checks, Gemini request-format tests and simulated Gemini Edge Function tests passed locally.
- Live phone/device, real Gemini cloud and real Supabase production checks were not performed here.

---

# BUSAN LANKA — Smart Tourism Web App V3.1 (Gemini AI)

Version 3.1 builds directly on V2/V3 and retains the yellow/black/white public website, 6-second hero slideshow, detailed day-by-day photo itineraries, multilingual website, QR tour preview and price-free enquiries.

## What's new in V3

1. **Mobile app-style Admin CMS:** bottom tabs (Home, Packages, Media, Leads, More), collapsible sidebar drawer, touch-size input fields, responsive editing screens, Save & Publish. All V2 content editors remain available on mobile.
2. **WhatsApp tour enquiries:** when the authorized owner adds a correct international WhatsApp number in Admin → Site Settings, `Send enquiry via WhatsApp` opens a pre-filled WhatsApp chat. **The tourist must tap Send inside WhatsApp.** If not configured, it uses email or copy fallback; no fake contact details.
3. **Social pages:** manage Facebook, Instagram, YouTube, TikTok, Tripadvisor, and Google Reviews URLs in Admin → Site Settings. Public footer shows only valid configured HTTPS links.
4. **Actual Supabase leads:** optional `submit-enquiry` Edge Function validates and stores visitor enquiry information in a private database table, admin `Tour Enquiries` page reads it, and admins may mark it contacted or closed. External WhatsApp messages do not automatically appear in Supabase if the function was not deployed or the request failed.
5. **Live AI implementation:** frontend uses `travel-ai` Edge Function to call Google Gemini on the server, with site-published package context, conversation history, multilingual replies, IP-hashed per-visitor and global rate limits. No AI secret enters browser code. Unconnected mode remains explicitly labeled SAMPLE AI, never pretends to be live.
6. **Supabase content:** V2 authenticated CMS / Storage stays intact; public content reads published database JSON. SQL now includes lead tables and rate limiter.

**There are no real project keys in this ZIP.** Database connection, live AI service, actual emails/WhatsApp number, verified media and real reviews are NOT active until setup below. An empty Supabase config continues to use browser-local demo editing.

## Ubuntu local run

```bash
unzip Busan_Lanka_WebApp_v3.zip
cd Busan_Lanka_WebApp_v3
./RUN_UBUNTU.sh
```

- Website: http://localhost:8080/
- Mobile/desktop Admin: http://localhost:8080/admin.html
- Vehicle QR demo: http://localhost:8080/?tour=1

No npm dependencies required for the local frontend. Chrome responsive DevTools can simulate devices. `localhost` runs locally only: real mobile phones need an HTTPS deployment or a configured local-network development server.

## Connect your Supabase project

1. Create or open the **correct Busan Lanka** Supabase project (do not use another client's project).
2. Supabase Dashboard → SQL Editor → run **`docs/supabase.sql`**. This is additive to the previous schema and creates the `site_content`, `cms_admins`, `tour_enquiries`, `api_rate_counters` tables and `site-media` Storage bucket.
3. Supabase Authentication → Users → create an admin user with a strong password. Copy its **User UUID**. Then in SQL Editor run:

   ```sql
   insert into public.cms_admins(user_id) values ('YOUR_ADMIN_AUTH_UUID') on conflict (user_id) do nothing;
   ```

4. Edit **`supabase-config.js`**: paste only the project `https://<PROJECT_REF>.supabase.co` URL and **publishable (or legacy anon) API key**. These values are public, protected by the included RLS policies. **NEVER paste the service_role / secret key or GEMINI_API_KEY into any browser file.**
5. Run the website again. The Admin page requires real Supabase Auth sign-in when cloud config is populated. Login, edit something, hit **Save & Publish**, refresh the public website in a different device and confirm the content is synced.
6. Admin → Site Settings: enter actual Busan Lanka WhatsApp number using **country code and digits only**, email and actual social HTTPS URLs. Save & Publish. Test enquiry chat with a real device.
7. Admin → Hero Slider / Packages / Gallery / Reviews → replace demonstration images and text with client-owned content and permission-based reviews. Do not publish sample tourist testimonials.

### Deploy the two Edge Functions for live AI + saved enquiries

Supabase CLI is required for deployment; `npx supabase` can be used on a suitable Node installation (or install CLI using Supabase's supported installation method). From the extracted project folder:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
# Set project secrets using an interactive secure CLI environment.
# DO NOT put secret values in a public repository or client-side JavaScript.

# GEMINI_API_KEY is already saved in Supabase Dashboard > Edge Functions > Secrets
npx supabase secrets set BUSAN_RATE_LIMIT_SALT=YOUR_RANDOM_LONG_PRIVATE_SECRET
npx supabase secrets set BUSAN_ALLOWED_ORIGINS=https://yourdomain.com,http://localhost:8080
npx supabase functions deploy travel-ai --no-verify-jwt
npx supabase functions deploy submit-enquiry --no-verify-jwt
```

The `--no-verify-jwt` flag permits tourists without accounts; **these public endpoints use database-backed abuse quotas, allowed Origin checks and server-side credentials**. A publishable API key is not a secret. Keep domain origins current, enable budget alerts/cost monitoring and add CAPTCHA/WAF before wider marketing. If the Supabase function is deployed under a different URL, adapt `ai-service.js`. The Gemini model defaults to `gemini-3.5-flash-lite`; set `GEMINI_MODEL` using Supabase Secrets to choose another supported model. See `GEMINI_SETUP_SINHALA.md`.

**Test in production:** inspect the browser console and Supabase Function Logs. Ask AI a Sri Lanka question; it should respond with `AI • Live`. Submit a test tour enquiry; the guest must press **Send** in WhatsApp, and a separate record should show in Admin → Tour Enquiries if `submit-enquiry` succeeded. Never assume WhatsApp delivered a message simply because the chat opened.

### Security / operational notes

- **Content/admin:** only authenticated user IDs in `cms_admins` can publish or read leads due to RLS. Avoid disabling RLS.
- **Guests' personal data:** enquiry storage contains contact data. Add a formal privacy notice, appropriate retention/deletion policy, and consent/marketing terms before go-live. Never use the enquiry data for unauthorized marketing.
- **Abuse limiting:** DB RPC uses atomic rate counters with hashed per-IP fingerprints and daily global caps. It is a baseline, not a guaranteed bot-blocking solution; proxy headers and origin checks can be spoofed, so use CAPTCHA/WAF and provider spending limits. Periodically delete stale counters.
- **Live AI:** errors are visibly reported if the Edge Function or Gemini secret is missing. The app does NOT silently call live AI in local demo mode. Always verify heritage facts and wildlife notices before publishing.
- **GPS/notifications:** QR tours are an active-tab web experience. Continuous phone-locked background GPS is not guaranteed by a PWA and needs native-app development. No fabricated real-time elephant alerts.
- **Photos:** the bundled images are preview-only samples; confirm commercial publication rights with the client before deploying.
- **Reviews:** no imaginary testimonials are seeded. Use genuine customer-approved reviews only.
- **Enquiries:** the primary WhatsApp flow works without Supabase once a real WhatsApp number is configured; saving leads is optional but requires the backend.
- **Testing:** Node syntax and local HTTP tests pass; automated Chromium navigation is restricted by the execution environment and therefore has NOT been counted as a browser pass. Do real Android/iOS QA before deployment.

## Files to know

- `index.html`, `app.js`, `styles.css`, `theme-v2.css`: public UI
- `admin.html`, `admin.js`, `admin.css`: responsive admin CMS and private leads
- `content-store.js`: RLS-backed Supabase CMS data and local fallback
- `ai-service.js`: public client for Supabase Functions (no secrets)
- `docs/supabase.sql`: schema/RLS/quotas
- `supabase/functions/travel-ai/index.ts`: server-side Gemini AI integration
- `GEMINI_SETUP_SINHALA.md`: step-by-step Gemini deployment and troubleshooting
- `supabase/functions/submit-enquiry/index.ts`: secure enquiry storage
- `supabase-config.js`: **public** URL and publishable key placeholders

Supabase Edge Functions automatically receive `SUPABASE_SECRET_KEYS` (new 2026 format) or legacy `SUPABASE_SERVICE_ROLE_KEY` from the hosted project. This code supports both formats; new secret keys are sent on `apikey`, never as `Authorization: Bearer`.

**Never send private API keys in screenshots or this chat; configure them in a secure environment.**

---

## Deploy on Netlify (GitHub integration)
See [DEPLOY_GUIDE_SINHALA.md](DEPLOY_GUIDE_SINHALA.md). Netlify builds only whitelisted public files into `dist/` via `node tools/build-netlify.mjs`. Set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY as Netlify build environment variables. Gemini remains server-side on Supabase Edge Functions.
