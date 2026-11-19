# Busan Lanka Web App V4.4 — Reviews & Photo Moderation Setup

## Added in V4.4

- New `Reviews` link after Services (desktop) and a `Read our traveler reviews` link under Services (mobile + desktop).
- Public review form: name, country (ISO code + emoji flag), 1–5 clickable stars, headline, genuine review (15–2500 characters), month/year of visit, trip type, and 0–2 optional photos.
- On-browser WebP compression strips original photo metadata before uploading.
- Admin → **Reviews & Moderation**: view pending, approved, rejected; open two photo previews; approve, reject, edit, delete; manually add reviews with guest permission and photos.
- Existing **Legacy CMS Reviews** editor kept for earlier reviews saved in `site_content`.
- Public site displays only approved database reviews + earlier approved CMS reviews. Never fabricate review ratings.
- No public tour package prices. Mobile app-style bottom bar retains four items.

## 1. Existing Supabase Project — SQL

If V4.3 `docs/supabase.sql` already ran before, go to **Supabase Dashboard → SQL Editor → New Query**, paste and execute **`docs/reviews_v4_4.sql` ONLY**. This creates:

- `public.guest_reviews` (all submissions start `pending`)
- `storage.buckets` row for `guest-review-photos` (PRIVATE)
- RLS policies: only `cms_admins` may select pending/all reviews, upload/admin-manage private photos, and approve/reject reviews
- Anonymous visitors CANNOT insert reviews via the REST API and cannot download unapproved photos

On a completely fresh Supabase project, run **`docs/supabase.sql`** ONCE instead; that full file includes the previous CMS, enquiries, quota SQL, and this guest-review migration. Then create Supabase Auth user, insert their UUID into `public.cms_admins` as explained by the earlier README.

**Do not run both files unnecessarily** (the scripts are largely idempotent, but the migration is already appended to the complete file).

## 2. Edge Functions — deploy (required for cloud reviews)

Install/login Supabase CLI through official Supabase instructions. In the source folder:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase functions deploy submit-review --no-verify-jwt
npx supabase functions deploy review-feed --no-verify-jwt
```

Existing `travel-ai` and `submit-enquiry` functions still need to be deployed separately for live AI and customer enquiries.

Use the Supabase Dashboard → **Edge Functions → Secrets** to configure:

- `BUSAN_RATE_LIMIT_SALT`: a unique 32+ byte secret for request quota fingerprinting
- `BUSAN_ALLOWED_ORIGINS`: comma-separated exact website URLs (e.g. `https://your-netlify-site.netlify.app,http://localhost:8080,http://127.0.0.1:8080`)
- Supabase automatically supplies `SUPABASE_URL` and privileged credentials to Edge Functions; the Edge Function reads the project's `SUPABASE_SECRET_KEYS` or legacy `SUPABASE_SERVICE_ROLE_KEY`. Do not expose these secrets to browser or GitHub.

**Your previously configured Gemini key remains unchanged.** Reviews do not use Gemini.

## 3. Website database connection

For local development edit `supabase-config.js` with **Supabase Project URL** and **publishable / anon key** only. These are public client values, not the service-role key.

For Netlify, set:

```env
PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
PUBLIC_SUPABASE_ANON_KEY=sb_publishable_YOUR_KEY
```

Build is already configured in `netlify.toml`; `node tools/build-netlify.mjs` produces the safe `dist/` folder without SQL or Edge secrets.

## 4. Test review submission

1. Start local server: `./RUN_UBUNTU.sh` (normally `http://localhost:8080`).
2. Website → **Reviews → Write a review**.
3. Select **country/flag**, visited month/year, trip type, stars, enter genuine comment and select 0, 1 or **2 photos**, confirm consent, submit.
4. Under Admin → **Reviews & Moderation**, press **Refresh** and open the `pending` review.
5. Check images/content, click **Approve** or **Reject**. Only approved appears on the public site; revisit/refresh website to verify.
6. Admin can also **＋ Add review** and upload up to 2 images, but must confirm the guest permitted publication.

## Demo mode vs real cloud

Without Supabase public URL/key configured, demo reviews and uploaded images live in **that browser's localStorage only**, and only that same browser sees the submission in Admin. Demo is NOT shared with other devices, and is NOT a production guest review service. Once Supabase and both functions are configured, all new reviews are stored in the database and photo bucket.

## Security & operational notes

- Visitor uploads are validated and rate-limited server-side, and must be WebP <=2 MB each after client-side conversion; the browser picker accepts JPEG/PNG/WebP up to 6 MB each and converts them to WebP.
- Images are private by default. The public feed issues time-limited signed URLs **only for approved** review photo paths; a signed URL may continue working for up to 1 hour after rejection.
- Consent is required, and admins should not approve fraudulent/defamatory/third-party content without checking.
- Avoid uploading national IDs, passports, children's personal data, or images without permission.
- Public anonymous review submissions can attract spam; consider adding CAPTCHA/Turnstile if volume grows, monitoring rate limits, and adding a privacy/deletion policy.
- Ratings displayed in previous CMS reviews are only shown when a genuine numeric rating is stored.
- If a private uploaded review is deleted from the database, the image object may remain in the bucket. Use Supabase Storage admin controls to delete obsolete objects periodically. Avoid deleting previously uploaded content manually while a review still needs it.

## Source map

- Public page: `index.html`, `guest-reviews.css`, `guest-reviews.js`
- Country/flag list: `country-data.js`
- Shared browser DB service: `reviews-service.js`
- Admin controls: `admin.html`, `admin.js`
- Additive SQL: `docs/reviews_v4_4.sql`
- Combined SQL: `docs/supabase.sql`
- Public submission: `supabase/functions/submit-review/index.ts`
- Approved feed: `supabase/functions/review-feed/index.ts`
- Tests: `tests/reviews-backend-smoke.mjs`
