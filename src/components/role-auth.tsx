"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ROLES, isRole } from "@/lib/auth";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export default function RoleAuth({ currentRole }: { currentRole?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(() => (currentRole === ROLES.admin ? ROLES.admin : ROLES.vendor));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const signIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError || !data.user) {
        setError(signInError?.message ?? "Unable to sign in");
        return;
      }

      const userId = data.user.id;
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (profileError || !profile) {
        setError(profileError?.message ?? "No profile found for this user");
        return;
      }

      const nextRole = profile.role as string;
      if (isRole(nextRole)) {
        setRole(nextRole);
        await fetch("/api/auth/role", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: nextRole }),
        });
        router.push(nextRole === ROLES.admin ? "/admin" : "/vendor");
        router.refresh();
        return;
      }

      await fetch("/api/auth/role", { method: "DELETE" });
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
    } catch {
      // ignore; cookie cleanup still matters
    }
    await fetch("/api/auth/role", { method: "DELETE" });
    router.refresh();
  };

  return (
    <form
      className="w-full max-w-md space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-lg backdrop-blur"
      onSubmit={signIn}
    >
      {currentRole && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3">
          <p className="text-sm text-zinc-300">
            Signed in as{" "}
            <span className="font-semibold text-zinc-100 capitalize">{currentRole}</span>
          </p>
        </div>
      )}

      <div className="space-y-1">
        <p className="text-sm font-medium text-zinc-300">Email</p>
        <input
          id="email"
          name="email"
          autoComplete="email"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 placeholder:text-zinc-500 caret-zinc-100 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-700/60"
          type="email"
          placeholder="you@store.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-zinc-300">Password</p>
        <input
          id="password"
          name="password"
          autoComplete="current-password"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 placeholder:text-zinc-500 caret-zinc-100 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-700/60"
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-zinc-300">Role</p>
        <select
          id="role"
          name="role"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-700/60"
          value={role}
          onChange={(e) => {
            const value = e.target.value;
            if (isRole(value)) setRole(value);
          }}
        >
          <option value={ROLES.vendor}>Vendor</option>
          <option value={ROLES.admin}>Admin</option>
        </select>
      </div>
      <button
        className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 font-medium text-white transition hover:bg-zinc-700 disabled:opacity-60"
        type="submit"
        disabled={loading}
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
      {currentRole && (
        <button
          className="w-full rounded-lg border border-zinc-700 px-4 py-2.5 text-zinc-200 transition hover:bg-zinc-800"
          type="button"
          onClick={logout}
        >
          Logout
        </button>
      )}
      {error && <p className="text-sm text-red-400">{error}</p>}
    </form>
  );
}
