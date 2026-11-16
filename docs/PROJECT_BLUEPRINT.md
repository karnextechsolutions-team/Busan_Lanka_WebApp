# Busan Lanka — Project Blueprint (Development Phase 1)

## Product objectives

**Primary user:** international tourists considering a trip to Sri Lanka. The public site is a quotation/enquiry-driven tourism website, not a visible-price storefront.

1. Visitor sees inspiring, authentic images of Sri Lanka.
2. Visitor can view days, destinations and day-by-day itineraries for each package **without public price information**.
3. Visitor can request a custom trip directly from the business using verified WhatsApp/email once configured.
4. Site suggests a language from browser settings, with an obvious manual selector. Later a trusted approximate GeoIP country lookup can also suggest (NOT force) a language. A country is not a language.
5. Busan AI Guide helps with general information (preview is a small local knowledge base; production requires a secure server-side API plus curated sources).
6. Vehicle QR leads to `https://example-domain.com/?tour=1` and opens the guided experience. Guest chooses language, listens to (or skips) the welcome, and selectively grants location/sound/notification permissions.
7. While the web page is visible and active, browser GPS can trigger a story near verified geofenced landmarks. On the device, guest can read or hear it.
8. Later, when verified authoritative movement/advisory data exists, wildlife-zone education or alerts can be enabled. **Never call an unverified risk zone a live sighting.**

## Device layouts

- Mobile (up to 600px): native-app-style bottom navigation, single-column packages, modal bottom sheets, full-screen tour and AI panels.
- Tablet (601–820px): dual-column cards; responsive navigation and tour layout.
- Desktop: top navigation, full hero, multi-column tours, hover details, AI preview.

## Status at this handoff

**Interactive starter / preview, not a completed production backend.** This ZIP is a dependency-free, static PWA demo with configurable client enquiry channel and optional Netlify AI function source.

Implemented:
- Mobile / tablet / desktop responsive front-end
- Packages and daily routes; no prices
- Destinations, gallery placeholders and honest pending-reviews state
- English / German / French / Russian / Korean / Sinhala UI and guided welcome translations
- Browser-language suggestion; manual language switch (stored locally)
- Enquiry form; prepares WhatsApp message, email or clipboard based on verified contact settings
- AI chat interface: sample knowledge base with serverless AI hook disabled until configured
- QR tour entry route (`?tour=1`)
- Welcome audio via browser speech synthesis, skip, location/notification/sound permissions
- On-screen foreground GPS proximity for two cultural demo zones (Sigiriya/Galle)
- Cultural stories with read/listen, sample wildlife education card, chime
- Local PWA manifest + offline cache for supported devices

Not implemented or ready for a public launch:
- Supabase CMS/admin, auth, durable enquiry DB, online payments (not requested), live itinerary management, QR trip authentication
- True location-based real-time wildlife sightings, vetted geofence boundaries
- Guaranteed quality local-language neural voices (device voices vary)
- True background GPS while phone is locked; a native mobile app may be required for reliable background location and local notifications
- Web Push subscription and server delivery (web Notifications API while app active is not the same as Web Push)
- Verified real client photos/reviews and actual package itineraries, translations reviewed by native speakers
- AI rate limiting, monitoring, approved source knowledge base, token budgets and abuse handling
- Actual owner verified WhatsApp number, business email, privacy policy and consent notices

## Phase delivery path

**Phase 1 — Real content and direct enquiries:** Add all authentic packages, real guest reviews with consent, photo gallery, business WhatsApp number/email, domains and SEO. Build a Supabase CMS/admin and real enquiry storage; deploy to HTTPS.

**Phase 2 — Production AI and narrated tours:** Add secure OpenAI API integration, source-grounded tourism knowledge store, multilingual neural TTS voices if required, content review panel and guided-trip session storage with privacy.

**Phase 3 — Smart journeys:** Verified attraction geofences, official hazard/advisory feed ingestion, permission settings, history/education panels, consent-based push where supported. Build native app if dependable background GPS is a strict requirement.

## Content/data model for future Supabase

- `packages(id,slug,days,nights,category,hero_image,status,sort_order)`
- `package_translations(package_id,locale,title,description)`
- `package_days(package_id,day_number,title,body,location_id)`
- `locations(id,name,lat,lng,category,verified_by,verified_at)`
- `stories(id,location_id,type,radius_m,source_url,review_status)`
- `story_translations(story_id,locale,title,narration)`
- `gallery(id,image_path,caption,owner_permission,public_visible)`
- `reviews(id,reviewer_display_name,content,source,consent_at,status)`
- `enquiries(id,name,email,trip_days,travel_month,message,package_id,status)`
- `trip_sessions(id,visitor_ref,started_at,ended_at,locale,consent_version)`
- `alerts(id,zone_id,type,source_url,verified_at,expires_at,status)`
- `admin_users(id,role)`

RLS/permissions: publish only approved records; guests may submit enquiries through a controlled endpoint only; only admins can edit. Keep guest location ephemeral by default, do not store movement history without explicit informed consent.

## Acceptance checks

1. 375×812 viewport: header, hero, 1-column package cards, bottom navigation, full-screen tour.
2. 768×1024 viewport: 2-column layout; no horizontal overflow.
3. 1440×900 viewport: standard desktop header, 3-column package cards.
4. `?tour=1` opens welcome without immediately asking permissions or auto-playing speech.
5. Skip intro works; tour works without location granted.
6. Geolocation triggers historical stories only near specified location when app is open.
7. Wildlife demo NEVER auto-triggers from GPS and NEVER implies live sighting.
8. Direct contact uses verified business details only; no invented number or address.
9. All package pages hide public prices; mobile and desktop.
10. Changes to languages never alter functionality or content availability.
