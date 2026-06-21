import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

type CookieToSet = { name: string; value: string; options: CookieOptions };
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./env";

// Server-Client fuer Server-Komponenten und Server Actions (RLS-geschuetzt
// ueber das User-Cookie). In Next 14 ist cookies() pro Request verfuegbar.
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // In Server-Komponenten kann set() fehlschlagen (read-only) — ok,
          // die Session wird dann ueber die Middleware/Action aufgefrischt.
        }
      },
    },
  });
}
