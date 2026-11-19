-- Busan Lanka CMS v2 / execute in your own Supabase SQL editor once.
-- Client content is public read. Changes require authenticated users explicitly in cms_admins.
-- Never place service_role keys in browser code or commit secrets.
create table if not exists public.cms_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.cms_admins enable row level security;
drop policy if exists "Admins can check own membership" on public.cms_admins;
create policy "Admins can check own membership" on public.cms_admins
  for select to authenticated using (user_id = (select auth.uid()));

create table if not exists public.site_content (
  id text primary key,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.site_content enable row level security;
drop policy if exists "Public site content" on public.site_content;
create policy "Public site content" on public.site_content
  for select to anon, authenticated using (id = 'main');
drop policy if exists "CMS admins update content" on public.site_content;
create policy "CMS admins update content" on public.site_content
  for update to authenticated
  using (id = 'main' and exists (select 1 from public.cms_admins a where a.user_id = (select auth.uid())))
  with check (id = 'main' and exists (select 1 from public.cms_admins a where a.user_id = (select auth.uid())));
insert into public.site_content(id,content) values ('main','{}'::jsonb) on conflict (id) do nothing;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('site-media','site-media',true,9437184,array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set public=true;

drop policy if exists "Busan public media" on storage.objects;
create policy "Busan public media" on storage.objects
  for select to anon, authenticated using (bucket_id = 'site-media');
drop policy if exists "Busan admins upload media" on storage.objects;
create policy "Busan admins upload media" on storage.objects
  for insert to authenticated with check (bucket_id='site-media' and exists (select 1 from public.cms_admins a where a.user_id = (select auth.uid())));
drop policy if exists "Busan admins edit media" on storage.objects;
create policy "Busan admins edit media" on storage.objects
  for update to authenticated using (bucket_id='site-media' and exists (select 1 from public.cms_admins a where a.user_id = (select auth.uid())))
  with check (bucket_id='site-media' and exists (select 1 from public.cms_admins a where a.user_id = (select auth.uid())));
drop policy if exists "Busan admins delete media" on storage.objects;
create policy "Busan admins delete media" on storage.objects
  for delete to authenticated using (bucket_id='site-media' and exists (select 1 from public.cms_admins a where a.user_id = (select auth.uid())));

-- After creating your admin user via Supabase Authentication -> Users,
-- copy its UUID from the dashboard and manually run this ONE separate statement:
-- insert into public.cms_admins(user_id) values ('YOUR-ADMIN-USER-UUID');
-- Keep this restricted to the business owner/authorized staff.

-- ==============================================================
-- Busan Lanka V3: private tour enquiries and abuse-limited Edge APIs
-- Execute this ADDITIVE section after v2 schema, or run whole file once.
-- ==============================================================
create table if not exists public.tour_enquiries (
 id uuid primary key default gen_random_uuid(),
 name text not null check (char_length(name) between 2 and 100),
 email text not null check (char_length(email) between 5 and 180),
 phone text,
 travel_days integer check (travel_days between 1 and 60),
 travel_month date,
 tour_id text,
 message text,
 locale text not null default 'en',
 status text not null default 'new' check (status in ('new','contacted','closed')),
 source text not null default 'webapp',
 created_at timestamptz not null default now()
);
alter table public.tour_enquiries enable row level security;
revoke all on public.tour_enquiries from anon;
grant select, update on public.tour_enquiries to authenticated;
drop policy if exists "Busan admins view enquiries" on public.tour_enquiries;
create policy "Busan admins view enquiries" on public.tour_enquiries for select to authenticated
 using (exists (select 1 from public.cms_admins a where a.user_id = (select auth.uid())));
drop policy if exists "Busan admins update enquiries" on public.tour_enquiries;
create policy "Busan admins update enquiries" on public.tour_enquiries for update to authenticated
 using (exists (select 1 from public.cms_admins a where a.user_id = (select auth.uid())))
 with check (exists (select 1 from public.cms_admins a where a.user_id = (select auth.uid())));
-- Anonymous visitors cannot SELECT from this table or INSERT directly.
-- submit-enquiry Edge Function inserts after validation and rate limits.
create index if not exists busan_enquiries_created_at on public.tour_enquiries(created_at desc);

create table if not exists public.api_rate_counters (
 bucket text not null,
 fingerprint text not null,
 window_started timestamptz not null,
 hits integer not null default 1,
 primary key (bucket, fingerprint, window_started)
);
alter table public.api_rate_counters enable row level security;
revoke all on public.api_rate_counters from public, anon, authenticated;

create or replace function public.consume_api_quota(p_bucket text,p_fingerprint text,p_limit integer,p_window_seconds integer)
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_hits integer;
begin
 if p_limit < 1 or p_limit > 10000 or p_window_seconds < 60 or p_window_seconds > 604800
    or length(p_bucket) > 64 or length(p_fingerprint) > 128 then return false; end if;
 insert into public.api_rate_counters(bucket,fingerprint,window_started,hits)
 values(p_bucket,p_fingerprint,to_timestamp(floor(extract(epoch from now())/p_window_seconds)*p_window_seconds),1)
 on conflict (bucket,fingerprint,window_started)
 do update set hits = public.api_rate_counters.hits + 1
 where public.api_rate_counters.hits < p_limit
 returning hits into v_hits;
 return v_hits is not null;
end;
$$;
revoke all on function public.consume_api_quota(text,text,integer,integer) from public, anon, authenticated;
grant execute on function public.consume_api_quota(text,text,integer,integer) to service_role;
-- Periodically purge old rate buckets in production (e.g. older than 14 days).


-- V4.4 Guest Reviews and Images (additive / can run repeatedly)
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


-- BUSAN LANKA V4.7 — ADDITIVE migration for an existing Supabase project.
-- Run AFTER the original docs/supabase.sql / V4.4 SQL.
-- Backfill existing enquiries as unknown rather than incorrectly assigning a channel.
ALTER TABLE public.tour_enquiries
 ADD COLUMN IF NOT EXISTS preferred_channel text NOT NULL DEFAULT 'unknown';
ALTER TABLE public.tour_enquiries DROP CONSTRAINT IF EXISTS tour_enquiries_preferred_channel_check;
ALTER TABLE public.tour_enquiries ADD CONSTRAINT tour_enquiries_preferred_channel_check
 CHECK (preferred_channel IN ('unknown','whatsapp','telegram','instagram','messenger','copy'));
CREATE INDEX IF NOT EXISTS busan_enquiry_channel_created_idx
 ON public.tour_enquiries (preferred_channel,created_at DESC);
-- Existing admin-only RLS policies remain unchanged. No anonymous table SELECT/INSERT.
