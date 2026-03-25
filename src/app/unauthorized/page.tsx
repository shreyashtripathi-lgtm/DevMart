import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center p-6">
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-red-900/40 bg-zinc-900 p-6 text-center shadow-sm">
        <h1 className="text-3xl font-bold text-zinc-100">Unauthorized</h1>
        <p className="text-zinc-400">
          You do not have permission to access this page.
        </p>
        <Link
          className="inline-flex rounded-lg border border-zinc-700 px-4 py-2 font-medium text-zinc-200 transition hover:bg-zinc-800"
          href="/"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
