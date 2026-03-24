import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 p-8">
      <h1 className="text-3xl font-bold">Unauthorized</h1>
      <p className="text-zinc-600">
        You do not have permission to access this page.
      </p>
      <Link className="w-fit rounded-md border px-4 py-2" href="/">
        Back to Home
      </Link>
    </main>
  );
}
