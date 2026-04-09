import { createClient } from "@supabase/supabase-js";

// Server-side admin client — uses service role key, bypasses RLS.
// NEVER expose this to the client. Use only in /api/admin/** route handlers.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);
