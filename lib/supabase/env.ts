// Zentrale Env-Pruefung. Die App soll OHNE Supabase-Keys laufen (Onboarding-
// Hinweis statt Crash) — die gesamte Domaenenlogik + Tests brauchen kein Supabase.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export function hasSupabaseEnv(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
