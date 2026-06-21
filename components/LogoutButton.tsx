"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  return (
    <a
      href="#"
      onClick={async (e) => {
        e.preventDefault();
        await createClient().auth.signOut();
        router.refresh();
      }}
    >
      Logout
    </a>
  );
}
