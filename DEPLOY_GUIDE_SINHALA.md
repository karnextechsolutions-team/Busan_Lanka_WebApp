# Busan Lanka — GitHub + Netlify Deploy (Sinhala)

## 1. Upload code to GitHub

Repository: https://github.com/karnextechsolutions-team/Busan_Lanka_WebApp

```bash
cd ~/Downloads
unzip Busan_Lanka_GitHub_Netlify_Ready.zip
cd Busan_Lanka_GitHub_Netlify_Ready
chmod +x PUSH_TO_GITHUB.sh
./PUSH_TO_GITHUB.sh
```

GitHub authentication may prompt you to sign in. If the script says Git identity is missing:

```bash
git config --global user.name "YOUR GITHUB USERNAME"
git config --global user.email "YOUR GITHUB EMAIL"
./PUSH_TO_GITHUB.sh
```

You may also use the GitHub web interface, but upload the **contents of this project folder** to the repository root, not the ZIP itself.

## 2. Netlify deploy from Git

1. Go to https://app.netlify.com/start and sign in.
2. Choose **Import an existing project** → **GitHub**.
3. Pick `karnextechsolutions-team/Busan_Lanka_WebApp`.
4. Branch: `main`. Base directory: blank.
5. Build command: `node tools/build-netlify.mjs`
6. Publish directory: `dist`
7. Click **Deploy**.

`netlify.toml` already sets these values. No `npm install` or Next/Vite is necessary.

## 3. Link your real Supabase project

Netlify Site configuration → Environment variables: add the following **PUBLIC** values only:

```
PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
PUBLIC_SUPABASE_ANON_KEY=sb_publishable_YOUR_PUBLISHABLE_KEY
```

Then trigger **Deploys → Trigger deploy → Deploy project**. Both must be set; otherwise the site is intentionally preview/demo mode. NEVER place `GEMINI_API_KEY`, service_role or Supabase secret keys into Netlify public build config, repo or browser JS. Keep Gemini key in Supabase Edge Functions → Secrets.

For Gemini/enquiry functions to work in production, ensure your Supabase project has `docs/supabase.sql` applied, admin Auth configured, and both `travel-ai` and `submit-enquiry` deployed. Add your new Netlify HTTPS site URL to Supabase secret `BUSAN_ALLOWED_ORIGINS` (comma-separated with any other approved origins). Redeploy the Edge Functions if required by your provider settings.

## 4. Live test

- Browse the Netlify URL. Test mobile layout and 4-tab bottom navigation.
- Open `/admin.html`, sign in as authorized Supabase CMS admin.
- Edit a small homepage text and Save & Publish. Refresh the site in a second browser/device.
- Configure WhatsApp in Admin → Site Settings; test pre-filled enquiry and manually press Send.
- Ask AI a question and confirm Gemini live answer (not SAMPLE AI).
- Test vehicle QR with `https://YOUR-SITE.netlify.app/?tour=1`.
- Review browser Console and Supabase Function Logs for CORS / API errors.

**IMPORTANT:** The bundled tourist photos are demonstration-only. Get usage rights/approval before sending the website to customers; replace preview data and ensure approved reviews. Location stories are not verified live wildlife sightings, and continuous background GPS is not guaranteed on web.

The build publishes only public site files. SQL, Functions, docs, tests, scripts and `.env` files are excluded from `dist`.
