# Busan Lanka — Gemini live AI setup (V3.1)

This release replaces the previous `travel-ai` OpenAI backend with Google's Gemini API. Your existing Gemini API key should already be saved in **Supabase Dashboard → Edge Functions → Secrets**. Never copy it into the browser or this chat.

## 1. Supabase Secrets

The following names must exist in the SAME Supabase project:

- `GEMINI_API_KEY` = your already-created Gemini API key (required)
- `BUSAN_RATE_LIMIT_SALT` = a strong random value used for privacy-preserving rate limiting (required)
- `BUSAN_ALLOWED_ORIGINS` = `http://localhost:8080,http://127.0.0.1:8080` during local development; append your eventual real `https://...` domain (required)
- `GEMINI_MODEL` = `gemini-3.5-flash-lite` (optional; this is the default model). Availability depends on your Gemini project/region and free-tier quota.

You do **not** need `OPENAI_API_KEY`. The previous OpenAI secret may remain unused or be deleted if no other functions rely on it.

## 2. Database (do this once)

Supabase → SQL Editor → run `docs/supabase.sql` if you have not done so already. It creates `site_content`, `cms_admins`, `tour_enquiries`, `api_rate_counters` and the quota RPC. Do not disable RLS.

Create an admin via Authentication → Users, and add their UUID to `cms_admins` as described in `README.md`.

## 3. Public frontend config

Edit `supabase-config.js` to include the **Busan Lanka** project URL and publishable key (these are public browser settings):

```javascript
export const SUPABASE = {
  url: 'https://YOUR_PROJECT_REF.supabase.co',
  anonKey: 'YOUR_PUBLISHABLE_KEY'
};
```

Never put Gemini keys, Supabase secret keys or service_role keys in browser JavaScript.

## 4. Deploy Edge Functions from Ubuntu terminal

```bash
cd ~/Downloads/Busan_Lanka_WebApp_v3
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase functions deploy travel-ai --no-verify-jwt
npx supabase functions deploy submit-enquiry --no-verify-jwt
```

`--no-verify-jwt` is needed for the guest-facing endpoints to support anonymous tourists. The functions use Origin allowlisting and database-backed rate limits; add bot protection (e.g., CAPTCHA/WAF) before public advertising.

**If you only updated the `travel-ai` function, it is enough to redeploy just `travel-ai`.** A new Secret value alone does not edit deployed function code.

## 5. Test in browser

1. Start local site: `./RUN_UBUNTU.sh`
2. Open `http://localhost:8080`
3. Click **Ask Busan AI**; ask **Tell me about Sigiriya in German.**
4. A live answer should appear and the panel status change to `AI • Gemini Live`.
5. If there is an error, see Supabase **Edge Functions → travel-ai → Logs**, browser DevTools → Network. Never share secrets or a complete API-key screenshot.

## Troubleshooting

- `Supabase is not configured`: add valid URL + publishable key to `supabase-config.js`.
- `Forbidden origin`: add your exact browser origin to `BUSAN_ALLOWED_ORIGINS` (no trailing `/`); for deployed sites use HTTPS origins.
- `Live AI is not configured`: check `GEMINI_API_KEY`, `BUSAN_RATE_LIMIT_SALT` and database/secret-key access.
- `Gemini free-tier capacity is temporarily exhausted`: check your Google AI Studio rate limits; requests may be delayed or blocked until quota resets.
- `The AI model could not be used`: check if `gemini-3.5-flash-lite` is available to your project, or set `GEMINI_MODEL` to a model you can access.
- No response / 404: deploy `travel-ai` to the correct Supabase project.
- 401 / 403 from function gateway: ensure the latest `--no-verify-jwt` deployment is active and only publishable client key is used.

## Testing and limitations

Local automated checks cover request JSON formatting, roles/history, response parsing, frontend static tests, and local HTTP file serving. A real Gemini cloud API call and your Supabase project cannot be tested without access to your private project; **do not claim it is live until you test it**.

The AI is currently **text chat**. Voice tour narration uses device speech synthesis separately; GPS-triggered educational cards are separate from live AI. Free tier has usage quotas and free-tier data-use terms — do not send guest passport numbers, payment information or sensitive personal data to the model.
