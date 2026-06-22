"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      className="btn full"
      onClick={async () => {
        await createClient().auth.signOut();
        router.refresh();
      }}
    >
      Ausloggen
    </button>
  );
}
