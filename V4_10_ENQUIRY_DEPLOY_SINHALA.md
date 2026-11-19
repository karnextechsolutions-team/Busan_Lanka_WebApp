# Busan Lanka V4.10 — Fix enquiry CORS & social icons

This update preserves V4.9 mobile packages, reviews, CMS, Gemini and Supabase code. It adds bundled **Bootstrap Icons** SVG assets for WhatsApp, Telegram, Instagram and Messenger, plus a clearer network error notice. The underlying CORS failure is a **live Supabase Edge Function deployment/configuration issue**, not a frontend CSS issue.

## Fix the live enquiry API (required)

In the V4.10 project folder on Ubuntu:

```bash
npx supabase functions deploy submit-enquiry --project-ref samkndtdqtmxdsuxrnnp --no-verify-jwt
npx supabase functions list --project-ref samkndtdqtmxdsuxrnnp
```

Verify the live preflight without creating an enquiry:

```bash
curl -i -X OPTIONS 'https://samkndtdqtmxdsuxrnnp.supabase.co/functions/v1/submit-enquiry' \
  -H 'Origin: https://tranquil-marshmallow-7cd3a4.netlify.app' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: apikey,content-type'
```

**Expected:** `HTTP 204` with `access-control-allow-origin: https://tranquil-marshmallow-7cd3a4.netlify.app`.

- 404: function is not deployed to the requested project.
- 401: JWT gateway config or key handling; deploy with `--no-verify-jwt`.
- 403: origin not allowed; set `BUSAN_ALLOWED_ORIGINS` in Supabase Secrets (comma-separated, no trailing `/`) and redeploy.
- 204 but actual POST fails 503: check `BUSAN_RATE_LIMIT_SALT`, Supabase service secret and `consume_api_quota` backend setup; inspect Edge Functions logs.
- 204 but actual POST fails 502: run `docs/V4_7_ENQUIRY_CHANNELS_ADD.sql` if it was not run; inspect `tour_enquiries` table and function logs.
- 429: rate limited; do not repeatedly submit.

**Never** expose a Supabase service-role or secret key to browser JavaScript, GitHub, or Netlify publish directory.

Check `BUSAN_ALLOWED_ORIGINS` secret includes:

```
https://tranquil-marshmallow-7cd3a4.netlify.app,http://localhost:8080,http://127.0.0.1:8080
```

## Update UI / GitHub

Use the complete source or copy changed files into your existing GitHub clone. Preserve your GitHub `.git` folder and any project-specific public config. Push `main` to trigger Netlify redeploy. If Netlify uses environment variables, verify `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` are set (public/publishable key only).

## Important behavior

After the Supabase server confirms an enquiry is saved, WhatsApp opens its prefilled message. Telegram, Instagram and Messenger open the configured chat, with text copied for manual paste/send. Opening an app is **not** proof the customer sent the message. Enquiries are retained in the backend and show the requested/preferred channel.

Icons are bundled local SVGs from Bootstrap Icons (MIT license: `assets/SOCIAL_ICONS_LICENSE.txt`). No remote icon libraries or extra build dependencies.
