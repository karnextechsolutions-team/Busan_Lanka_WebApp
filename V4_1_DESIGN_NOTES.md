# Busan Lanka V4.1 — Brand-color background enhancement

Based on the client’s Busan Lanka logo: golden saffron, sunset orange, magenta/pink, ocean blue, with green used sparingly.

- Design retains the V4 PDF homepage composition (Sigiriya hero, search bar, destinations collage, services, Why Us, tour packages, AI, QR Tour, gallery, gradient CTA).
- Replaces long flat cream/white expanses with warm ivory and translucent watercolor gradients.
- Two original hand-authored SVG backgrounds (`assets/busan-brand-mist.svg`, `assets/busan-brand-wave.svg`) add depth and wave-style separators without video/scroll animations.
- Existing Admin CMS, translations, Supabase/Gemini integration and WhatsApp enquiry code were not changed.
- Netlify build and service-worker asset cache include the new files.
- Colors and gradient positions are editable from `brand-background-v4-1.css`.
- All live Supabase/Gemini credentials must remain outside the ZIP or configured via the existing deployment workflow.
