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
