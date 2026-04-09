import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side Supabase instance — uses @supabase/ssr so sessions are stored
// in both localStorage and cookies, allowing middleware to read them.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
