"use client";

import AdminVendorManager from "@/components/admin-vendor-manager";
import LogoutButton from "@/components/logout-button";
import { useState } from "react";

export default function AdminPage() {
  const tabs = ["Overview", "Users", "Vendors", "Catalog", "Orders", "Reports", "Settings"];
  const [activeTab, setActiveTab] = useState("Overview");
  const users = [
    { id: "u1", name: "Aarav Mehta", email: "aarav@shop.com", role: "admin", status: "active" },
    { id: "u2", name: "Sara Khan", email: "sara@shop.com", role: "vendor", status: "active" },
    { id: "u3", name: "Rohit Das", email: "rohit@shop.com", role: "vendor", status: "pending" },
    { id: "u4", name: "Neha Patel", email: "neha@shop.com", role: "admin", status: "active" },
  ];
  const vendorSales = [
    { id: "v1", name: "K-store", sales: 287.82 },
    { id: "v2", name: "Nova Mart", sales: 144.11 },
    { id: "v3", name: "Bright Bazaar", sales: 92.5 },
  ];
  const totalVendorSales = vendorSales.reduce((sum, v) => sum + v.sales, 0);

  return (
    <main className="min-h-screen bg-zinc-950">
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-900">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Ecommerce Admin
            </p>
            <h1 className="text-lg font-bold text-zinc-100">Control Panel</h1>
          </div>
          <div className="flex items-center gap-3">
            <input
              className="hidden rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-zinc-500 md:block"
              placeholder="Search users, products, orders..."
            />
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[240px_1fr] md:px-6">
        <aside className="h-fit rounded-2xl border border-zinc-800 bg-zinc-900 p-4 shadow-sm">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Tabs
          </p>
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm ${activeTab === tab ? "bg-zinc-800 font-medium text-white" : "text-zinc-300 hover:bg-zinc-800"}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </nav>
        </aside>

        <section className="space-y-6">
          {activeTab === "Overview" && (
            <>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-zinc-100">Overview</h2>
                <p className="mt-1 text-zinc-400">
                  Monitor platform health, approvals, users, and revenue in one
                  place.
                </p>
              </div>
              <section className="grid gap-4 md:grid-cols-4">
                <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
                  <p className="text-sm text-zinc-400">Pending approvals</p>
                  <p className="mt-2 text-2xl font-bold text-zinc-100">18</p>
                </article>
                <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
                  <p className="text-sm text-zinc-400">Active users</p>
                  <p className="mt-2 text-2xl font-bold text-zinc-100">2,410</p>
                </article>
                <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
                  <p className="text-sm text-zinc-400">Active vendors</p>
                  <p className="mt-2 text-2xl font-bold text-zinc-100">64</p>
                </article>
                <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
                  <p className="text-sm text-zinc-400">Open support cases</p>
                  <p className="mt-2 text-2xl font-bold text-zinc-100">7</p>
                </article>
              </section>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-100">Vendor Sales</h3>
                    <p className="mt-1 text-sm text-zinc-400">Overall sells across all vendors.</p>
                  </div>
                  <p className="text-2xl font-bold text-zinc-100">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(totalVendorSales)}
                  </p>
                </div>

                <div className="mt-4 overflow-hidden rounded-xl border border-zinc-800">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-950 text-zinc-400">
                      <tr>
                        <th className="px-3 py-2 font-medium">Vendor</th>
                        <th className="px-3 py-2 font-medium">Sales</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendorSales.map((v) => (
                        <tr key={v.id} className="border-t border-zinc-800 text-zinc-200">
                          <td className="px-3 py-2">{v.name}</td>
                          <td className="px-3 py-2">
                            {new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "USD",
                            }).format(v.sales)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === "Vendors" && <AdminVendorManager />}

          {activeTab === "Users" && (
            <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-zinc-100">All Users</h2>
              <p className="mt-1 text-zinc-400">View all users registered in the platform.</p>
              <div className="mt-4 overflow-hidden rounded-xl border border-zinc-800">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-950 text-zinc-400">
                    <tr>
                      <th className="px-3 py-2 font-medium">Name</th>
                      <th className="px-3 py-2 font-medium">Email</th>
                      <th className="px-3 py-2 font-medium">Role</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-t border-zinc-800 text-zinc-200">
                        <td className="px-3 py-2">{user.name}</td>
                        <td className="px-3 py-2">{user.email}</td>
                        <td className="px-3 py-2 capitalize">{user.role}</td>
                        <td className="px-3 py-2 capitalize">{user.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === "Settings" && (
            <section className="space-y-4">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-zinc-100">Settings</h2>
                <p className="mt-1 text-zinc-400">
                  Manage store profile, preferences, notifications, and account actions.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
                  <p className="text-sm font-semibold text-zinc-100">Store Profile</p>
                  <input
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500"
                    defaultValue="Ecommerce Hub"
                    placeholder="Store name"
                  />
                  <input
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500"
                    defaultValue="support@ecommercehub.com"
                    placeholder="Support email"
                  />
                  <button className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white">
                    Save Profile
                  </button>
                </div>
                <div className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
                  <p className="text-sm font-semibold text-zinc-100">Preferences</p>
                  <label className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300">
                    Email notifications
                    <input type="checkbox" defaultChecked />
                  </label>
                  <label className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300">
                    SMS alerts
                    <input type="checkbox" />
                  </label>
                  <label className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300">
                    Two-factor auth
                    <input type="checkbox" defaultChecked />
                  </label>
                </div>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
                <p className="mb-3 text-sm font-semibold text-zinc-100">Account</p>
                <LogoutButton />
              </div>
            </section>
          )}

          {activeTab !== "Overview" &&
            activeTab !== "Vendors" &&
            activeTab !== "Users" &&
            activeTab !== "Settings" && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-zinc-100">{activeTab}</h2>
              <p className="mt-1 text-zinc-400">This section is coming soon.</p>
            </div>
            )}
        </section>
      </div>
    </main>
  );
}
