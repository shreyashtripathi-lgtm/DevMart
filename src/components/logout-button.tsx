"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
    } catch {
      // ignore; cookie cleanup still matters
    }

    await fetch("/api/auth/role", { method: "DELETE" });
    router.push("/");
    router.refresh();
  };

  return (
    <button
      className="rounded-lg border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800 disabled:opacity-60"
      type="button"
      onClick={logout}
      disabled={loading}
    >
      {loading ? "Logging out..." : "Logout"}
    </button>
  );
}
