import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

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
    .schema("public")
    .from("products")
    .select(
      "id, vendor_id, name, price, stock_quantity, is_active, image_url, created_at, updated_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 400 });
  }

  const products = (data ?? []).map((p) => ({
    ...p,
    stock: Number((p as { stock_quantity?: number | null }).stock_quantity ?? 0),
    status: (p as { is_active?: boolean | null }).is_active ? "active" : "pending",
  }));

  return NextResponse.json({ ok: true, products });
}

