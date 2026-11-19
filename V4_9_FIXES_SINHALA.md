# Busan Lanka V4.9 — Mobile Packages + Admin Country Search

**මෙම release එක V4.8 project එක මත පදනම් වේ.** Database migration එකක් අවශ්‍ය නැහැ. Supabase review-feed Edge Function deployment එක එහෙමම තබන්න.

## 1. Mobile Package Popups

- Phone/tablet වල package image එක උඩින්, package summary එක ඊට පහළින් දක්වයි.
- Day 1, Day 2… cards දැන් horizontal swipe කරන්න පුළුවන්.
- Selected day එකේ full description, highlights සහ photos පළලටම පෙන්වයි.
- Day cards තෝරද්දී active state update වී selected day විස්තරයට scroll වෙයි.
- Tablet/desktop 821px+ වල original side-by-side itinerary layout පවතියි.

## 2. Admin Review Country Search

- Admin → Reviews & Moderation → Add/Edit review → Country + flag field
- `Net`, `Sri`, `UK`, `NL`, `Italy` ලෙස type කරලා filtered country option එක select කරන්න.
- Keyboard: ↑/↓, Enter, Escape.
- Country code review database එකට save වෙන්නේ select කළාට පසුව පමණයි.

## 3. Run (Ubuntu)

```bash
cd ~/Downloads
unzip Busan_Lanka_WebApp_v4_9_Mobile_Packages_Country_Search.zip
cd Busan_Lanka_WebApp_v4_9_Mobile_Packages_Country_Search
./RUN_UBUNTU.sh
```

## 4. Netlify

GitHub main branch එකට updated source push කිරීමෙන් website update වේ (if Netlify auto-deploy configured). Existing Supabase secrets unchanged. No SQL required.

## Notes

Existing live `review-feed` Edge Function, approved reviews, Supabase CMS and social enquiry code retained. Site-wide UI change only; private API keys should never be committed to GitHub.
