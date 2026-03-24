"use client";

import { useRouter } from "next/navigation";
import { ROLES } from "@/lib/auth";

export default function RoleAuth({ currentRole }: { currentRole?: string }) {
  const router = useRouter();

  const setRole = async (role: string) => {
    await fetch("/api/auth/role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    router.refresh();
  };

  const logout = async () => {
    await fetch("/api/auth/role", { method: "DELETE" });
    router.refresh();
  };

  return (
    <div className="flex flex-wrap gap-3">
      <button
        className="rounded-md bg-black px-4 py-2 text-white"
        onClick={() => setRole(ROLES.admin)}
      >
        Login as Admin
      </button>
      <button
        className="rounded-md bg-zinc-800 px-4 py-2 text-white"
        onClick={() => setRole(ROLES.vendor)}
      >
        Login as Vendor
      </button>
      {currentRole && (
        <button className="rounded-md border px-4 py-2" onClick={logout}>
          Logout
        </button>
      )}
    </div>
  );
}
