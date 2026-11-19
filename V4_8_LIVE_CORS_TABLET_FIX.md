# Busan Lanka V4.8 — Live Reviews + Tablet Header Fix

## Why reviews show as 0

The V4.7 public review-feed used POST with `apikey` and `Content-Type` headers, causing a browser CORS OPTIONS preflight. The screenshot shows the preflight failed for origin `https://tranquil-marshmallow-7cd3a4.netlify.app`. This means the browser could not read the review response; it does **not** mean that the data was deleted. Common causes: missing exact origin in `BUSAN_ALLOWED_ORIGINS`, function not deployed, or JWT verification intercepting OPTIONS before the function runs.

V4.8 loads the approved-only public feed via simple GET (no custom request headers), keeping POST backward compatibility. Its CORS origin check permits the exact Netlify preview site shown in the screenshot, `http://localhost:8080`, `http://127.0.0.1:8080`, and any explicitly configured origins. No wildcard CORS policy is used. On a custom domain, you must set the matching allowed origin in Supabase Secrets.

## 1 — Configure Supabase Secrets (required for custom domains)

Supabase dashboard > Edge Functions > Secrets:

`BUSAN_ALLOWED_ORIGINS` = `https://tranquil-marshmallow-7cd3a4.netlify.app,http://localhost:8080,http://127.0.0.1:8080`

For any future custom domain, append `,https://www.yourdomain.com`. No trailing slash. Keep `BUSAN_RATE_LIMIT_SALT`, `GEMINI_API_KEY`, and other existing secrets unchanged.

## 2 — Deploy

From the project folder:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase functions deploy review-feed --no-verify-jwt
npx supabase functions deploy submit-review --no-verify-jwt
```

Supabase Project ref is the part before `.supabase.co` in the URL. The functions' `verify_jwt = false` entries are also in `supabase/config.toml`. These are public endpoints with independent origin/rate-limit validation; never put secret keys in frontend files.

## 3 — Verify OPTIONS (legacy clients) and GET (new V4.8 client)

```bash
curl -i -X OPTIONS 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/review-feed' \
  -H 'Origin: https://tranquil-marshmallow-7cd3a4.netlify.app' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: apikey,content-type'

curl -i 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/review-feed' \
  -H 'Origin: https://tranquil-marshmallow-7cd3a4.netlify.app'
```

Expected: OPTIONS = 204, GET = 200 containing `reviews` and `total`. If OPTIONS is 403, origin config is wrong; if 401, turn off JWT verification/redeploy; if 404, deploy the function. For GET 503/502, inspect Supabase Edge Function logs for missing service credentials, reviews table, storage or SQL policies.

If GET is 200 but `total: 0`, check Supabase Table Editor > `guest_reviews` and verify some rows have `status = approved`. Pending or rejected reviews do not display. Legacy CMS reviews are separate.

## 4 — Update GitHub and Netlify

Push the V4.8 project to `main` and wait for Netlify redeploy, or upload the new `dist` static build. Browser refresh with Ctrl+Shift+R or private browsing. Do not upload `.env`, a service-role key or Gemini key to GitHub/Netlify.

## 5 — Tablet fix

`tablet-header-v4-8.css` loaded last. Below 1140px it switches to a right-aligned hamburger + language controls and reserves space for the brand. At small phone widths it progressively scales the logo/title without overlap. The existing 4-tab bottom navigation remains unchanged.
