import Link from "next/link";
import { cookies } from "next/headers";
import RoleAuth from "@/components/role-auth";
import { ROLE_COOKIE } from "@/lib/auth";

export default async function Home() {
  const cookieStore = await cookies();
  const role = cookieStore.get(ROLE_COOKIE)?.value;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 p-8">
      <h1 className="text-3xl font-bold">Ecommerce App</h1>
      <p className="text-zinc-600">
        Current role: <span className="font-semibold">{role ?? "guest"}</span>
      </p>
      <RoleAuth currentRole={role} />
      <div className="flex gap-3">
        <Link className="rounded-md border px-4 py-2" href="/admin">
          Admin Dashboard
        </Link>
        <Link className="rounded-md border px-4 py-2" href="/vendor">
          Vendor Dashboard
        </Link>
      </div>
    </main>
  );
}
