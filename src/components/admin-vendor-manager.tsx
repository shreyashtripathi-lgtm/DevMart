"use client";

import { useEffect, useState } from "react";

type Vendor = {
  id: string;
  display_name: string | null;
  created_at: string;
};

export default function AdminVendorManager() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const loadVendors = async () => {
    const response = await fetch("/api/admin/vendors");
    if (!response.ok) return;
    const json = (await response.json()) as { ok: boolean; vendors: Vendor[] };
    if (json.ok) setVendors(json.vendors);
  };

  useEffect(() => {
    const run = async () => {
      await loadVendors();
    };
    void run();
  }, []);

  const addVendor = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setTempPassword(null);

    if (!name || !email) {
      setError("Vendor name and email are required");
      return;
    }

    setLoading(true);
    const response = await fetch("/api/admin/vendors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });
    setLoading(false);

    if (!response.ok) {
      const json = await response.json().catch(() => null);
      setError(json?.message ?? "Unable to add vendor");
      return;
    }

    const json = (await response.json()) as { ok: boolean; temp_password?: string };
    if (json.temp_password) setTempPassword(json.temp_password);

    setName("");
    setEmail("");
    await loadVendors();
  };

  const displayName = (vendor: Vendor) => {
    return vendor.display_name ?? "Vendor";
  };

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-zinc-100">Vendor Management</h3>
      <p className="mt-1 text-sm text-zinc-400">Add and manage vendors from admin panel.</p>

      <form className="mt-4 grid gap-3 md:grid-cols-4" onSubmit={addVendor}>
        <input
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500"
          placeholder="Vendor name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500"
          type="email"
          placeholder="Vendor email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white">
          {loading ? "Adding..." : "Add Vendor"}
        </button>
      </form>

      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      {tempPassword && (
        <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-950/40 p-3">
          <p className="text-sm font-semibold text-zinc-100">Temporary password</p>
          <p className="mt-1 text-sm font-mono text-zinc-200">{tempPassword}</p>
        </div>
      )}

      <div className="mt-4 overflow-hidden rounded-xl border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-950 text-zinc-400">
            <tr>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((vendor) => (
              <tr key={vendor.id} className="border-t border-zinc-800 text-zinc-200">
                <td className="px-3 py-2">{displayName(vendor)}</td>
                <td className="px-3 py-2 text-zinc-400">{vendor.created_at.slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
