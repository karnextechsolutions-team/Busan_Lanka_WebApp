-- BUSAN LANKA V4.4: Guest Review & Photo Approval (additive migration).
-- Run this in Supabase SQL Editor AFTER existing docs/supabase.sql V4.3 (or run the new combined supabase.sql on a new project).
-- Public visitors may only submit via validated, rate-limited submit-review Edge Function.
-- Pending review text and photos are private until approval.
create table if not exists public.guest_reviews (
 id uuid primary key default gen_random_uuid(),
 name text not null check (char_length(name) between 2 and 90),
 country_code text not null check (country_code ~ '^[A-Z]{2}$'),
 rating smallint not null check (rating between 1 and 5),
 title text not null check (char_length(title) between 2 and 120),
 review_text text not null check (char_length(review_text) between 15 and 2500),
 visited_month date not null,
 trip_type text not null check (trip_type in ('Couples','Family','Friends','Solo','Business','Other')),
 photo_paths text[] not null default '{}'::text[] check (cardinality(photo_paths) <= 2),
 status text not null default 'pending' check (status in ('pending','approved','rejected')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists busan_guest_reviews_status_created on public.guest_reviews(status,created_at desc);
alter table public.guest_reviews enable row level security;
revoke all on public.guest_reviews from public, anon, authenticated;
grant select on public.guest_reviews to anon, authenticated;
grant insert,update,delete on public.guest_reviews to authenticated;

drop policy if exists "Guest reviews approved visible" on public.guest_reviews;
create policy "Guest reviews approved visible" on public.guest_reviews
 for select to anon,authenticated using (status='approved');
drop policy if exists "Admins view all guest reviews" on public.guest_reviews;
create policy "Admins view all guest reviews" on public.guest_reviews
 for select to authenticated using (exists(select 1 from public.cms_admins a where a.user_id=(select auth.uid())));
drop policy if exists "Admins create guest reviews" on public.guest_reviews;
create policy "Admins create guest reviews" on public.guest_reviews
 for insert to authenticated with check (exists(select 1 from public.cms_admins a where a.user_id=(select auth.uid())));
drop policy if exists "Admins modify guest reviews" on public.guest_reviews;
create policy "Admins modify guest reviews" on public.guest_reviews
 for update to authenticated using (exists(select 1 from public.cms_admins a where a.user_id=(select auth.uid())))
 with check (exists(select 1 from public.cms_admins a where a.user_id=(select auth.uid())));
drop policy if exists "Admins delete guest reviews" on public.guest_reviews;
create policy "Admins delete guest reviews" on public.guest_reviews
 for delete to authenticated using (exists(select 1 from public.cms_admins a where a.user_id=(select auth.uid())));

-- Private images: only authorized admins can upload/read via authenticated browser requests.
-- Guest uploads and short-lived public approved-image links are issued by Edge Functions (service role).
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('guest-review-photos','guest-review-photos',false,2097152,array['image/webp'])
on conflict (id) do update set public=false,file_size_limit=2097152,allowed_mime_types=array['image/webp'];

drop policy if exists "Busan admins read review photos" on storage.objects;
create policy "Busan admins read review photos" on storage.objects for select to authenticated
 using (bucket_id='guest-review-photos' and exists(select 1 from public.cms_admins a where a.user_id=(select auth.uid())));
drop policy if exists "Busan admins add review photos" on storage.objects;
create policy "Busan admins add review photos" on storage.objects for insert to authenticated
 with check (bucket_id='guest-review-photos' and exists(select 1 from public.cms_admins a where a.user_id=(select auth.uid())));
drop policy if exists "Busan admins delete review photos" on storage.objects;
create policy "Busan admins delete review photos" on storage.objects for delete to authenticated
 using (bucket_id='guest-review-photos' and exists(select 1 from public.cms_admins a where a.user_id=(select auth.uid())));
-- No anonymous Storage INSERT or SELECT policy is created. Files stay private, even if an anonymous user guesses a path.
-- Existing public.consume_api_quota and cms_admins table come from docs/supabase.sql above.
