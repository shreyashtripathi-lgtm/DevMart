import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import RoleAuth from "@/components/role-auth";
import { ROLE_COOKIE, ROLES } from "@/lib/auth";

export default async function Home() {
  const cookieStore = await cookies();
  const role = cookieStore.get(ROLE_COOKIE)?.value;

  if (role === ROLES.vendor) {
    redirect("/vendor");
  }

  if (role === ROLES.admin) {
    redirect("/admin");
  }

  return (
    <main className="min-h-screen bg-zinc-950">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6 md:py-14">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
          <section className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900/90 to-zinc-950 p-7 shadow-sm md:p-10">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                Ecommerce Portal
              </p>
              <h1 className="text-4xl font-bold tracking-tight text-zinc-100 md:text-5xl">
                Sign in with role access
              </h1>
              <p className="text-zinc-400">
                Choose <span className="font-medium text-zinc-200">admin</span> or{" "}
                <span className="font-medium text-zinc-200">vendor</span> to view the correct
                dashboard. This demo stores your role in a cookie.
              </p>
            </div>

            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-zinc-800/40 blur-3xl" />

            <div className="mt-7 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
                <p className="text-sm font-semibold text-zinc-100">Admin controls</p>
                <p className="mt-1 text-sm text-zinc-400">
                  Vendors, users, orders, reports, and settings.
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
                <p className="text-sm font-semibold text-zinc-100">Vendor tools</p>
                <p className="mt-1 text-sm text-zinc-400">
                  Products, inventory, pricing, and store performance.
                </p>
              </div>
            </div>
          </section>

          <div className="flex flex-col justify-center">
            <RoleAuth currentRole={role} />
            <p className="mt-4 text-center text-sm text-zinc-500">
              Tip: after signing in as admin, go to the Vendors tab to add vendors.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
