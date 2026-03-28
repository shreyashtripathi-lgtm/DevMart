import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim() ?? "";

  try {
    const supabase = createSupabaseAdminClient();

    let query = supabase
      .schema("public")
      .from("products")
      .select("id, name, price, stock_quantity, image_url, created_at")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    console.log("query", query);
    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ ok: false, message: error.message }, { status: 400 });
    }

    const products = (data ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      stock: Number(p.stock_quantity ?? 0),
      imageUrl: p.image_url ?? null,
    }));

    return NextResponse.json({ ok: true, products });
  } catch (err) {
    return NextResponse.json({ ok: false, message: "Internal server error" }, { status: 500 });
  }
}
