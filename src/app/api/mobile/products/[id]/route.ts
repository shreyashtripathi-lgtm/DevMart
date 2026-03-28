import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase
      .schema("public")
      .from("products")
      .select("id, name, price, stock_quantity, image_url, is_active")
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      return NextResponse.json({ ok: false, message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      product: {
        id: data.id,
        name: data.name,
        price: Number(data.price),
        stock: Number(data.stock_quantity ?? 0),
        imageUrl: data.image_url ?? null,
      },
    });
  } catch (err) {
    return NextResponse.json({ ok: false, message: "Internal server error" }, { status: 500 });
  }
}
