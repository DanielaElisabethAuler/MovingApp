import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options: CookieOptions };
import { SUPABASE_ANON_KEY, SUPABASE_URL, hasSupabaseEnv } from "@/lib/supabase/env";

// Frischt die Supabase-Session pro Request auf (@supabase/ssr Empfehlung).
// Ohne konfigurierte Keys ist die Middleware ein No-Op (App laeuft trotzdem).
export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });
  if (!hasSupabaseEnv()) return response;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icon-).*)"],
};
