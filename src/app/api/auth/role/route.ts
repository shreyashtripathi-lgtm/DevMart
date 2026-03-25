import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isRole, ROLE_COOKIE } from "@/lib/auth";

export async function POST(request: Request) {
  const { role } = await request.json();

  if (typeof role !== "string" || !isRole(role)) {
    return NextResponse.json({ message: "Invalid role" }, { status: 400 });
  }

  const cookieStore = await cookies();
  cookieStore.set(ROLE_COOKIE, role, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(ROLE_COOKIE);
  return NextResponse.json({ ok: true });
}
