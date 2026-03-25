import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { randomBytes } from "crypto";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: role, error: roleError } = await supabase.rpc("current_user_role");

  if (roleError) {
    return NextResponse.json(
      { ok: false, message: roleError.message },
      { status: 500 },
    );
  }

  const roleValue = role?.toString?.() ?? "";
  if (roleValue !== "admin") {
    return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("user_profiles")
    .select("id, display_name, created_at")
    .eq("role", "vendor")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, vendors: data ?? [] });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    name?: string;
  };

  if (!body.email || !body.name) {
    return NextResponse.json({ ok: false, message: "Missing email or name" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: role, error: roleError } = await supabase.rpc("current_user_role");

  if (roleError) {
    return NextResponse.json(
      { ok: false, message: roleError.message },
      { status: 500 },
    );
  }

  const roleValue = role?.toString?.() ?? "";
  if (roleValue !== "admin") {
    return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
  }

  const adminClient = createSupabaseAdminClient();
  const tempPassword = `Temp@${randomBytes(4).toString("hex")}`;

  const { data: createData, error: createError } = await adminClient.auth.admin.createUser({
    email: body.email,
    password: tempPassword,
    email_confirm: true,
  });

  if (createError || !createData.user) {
    return NextResponse.json(
      { ok: false, message: createError?.message ?? "Unable to create vendor user" },
      { status: 400 },
    );
  }

  const vendorUserId = createData.user.id;
  const { error: upsertError } = await adminClient
    .from("user_profiles")
    .upsert(
      { id: vendorUserId, role: "vendor", display_name: body.name },
      { onConflict: "id" },
    );

  if (upsertError) {
    return NextResponse.json({ ok: false, message: upsertError.message }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    vendor: { id: vendorUserId, display_name: body.name },
    temp_password: tempPassword,
  });
}

