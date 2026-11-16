// Public browser configuration ONLY. The anon/publishable key is safe in a client
// only when the included SQL RLS policies are applied. NEVER insert a service_role key.
export const SUPABASE = {
  url: '',       // e.g. 'https://YOUR_PROJECT.supabase.co'
  anonKey: ''    // Supabase publishable / anon key; NEVER service_role
};
