import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
  if (!supabaseUrl || !supabaseAnonKey) throw new Error("Missing Supabase env vars");

  return createBrowserClient(supabaseUrl!, supabaseAnonKey!, {
    db: { schema: "public" },
  });
}

