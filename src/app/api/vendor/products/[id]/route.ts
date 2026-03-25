import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: role, error: roleError } = await supabase.rpc("current_user_role");
  if (roleError) {
    return NextResponse.json(
      { ok: false, message: roleError.message },
      { status: 500 },
    );
  }

  const roleValue = role?.toString?.() ?? "";
  if (roleValue !== "vendor") {
    return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { error: ensureError } = await supabase.rpc("ensure_user_profile_role", {
    p_role: "vendor",
  });
  if (ensureError) {
    return NextResponse.json(
      { ok: false, message: ensureError.message },
      { status: 400 },
    );
  }

  const body = (await request.json()) as {
    price?: number;
    stock?: number;
    status?: "active" | "pending";
    imageUrl?: string | null;
  };

  const updates: Record<string, unknown> = {};

  if (body.price !== undefined) {
    const price = Number(body.price);
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json({ ok: false, message: "Price must be valid" }, { status: 400 });
    }
    updates.price = price;
    updates.price_cents = Math.round(price * 100);
  }

  if (body.stock !== undefined) {
    const stock = Number(body.stock);
    if (!Number.isFinite(stock) || stock < 0) {
      return NextResponse.json({ ok: false, message: "Stock must be valid" }, { status: 400 });
    }
    updates.stock_quantity = Math.floor(stock);
  }

  if (body.status !== undefined) {
    if (body.status !== "active" && body.status !== "pending") {
      return NextResponse.json({ ok: false, message: "Invalid status" }, { status: 400 });
    }
    updates.is_active = body.status === "active";
  }

  if (body.imageUrl !== undefined) {
    const imageUrlRaw = (body.imageUrl ?? "").trim();
    const imageUrl = imageUrlRaw.length > 0 ? imageUrlRaw : null;

    if (imageUrl && !/^https?:\/\//i.test(imageUrl)) {
      return NextResponse.json(
        { ok: false, message: "Image URL must start with http(s)://" },
        { status: 400 },
      );
    }

    updates.image_url = imageUrl;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: false, message: "No updates provided" }, { status: 400 });
  }

  const { data, error } = await supabase
    .schema("public")
    .from("products")
    .update(updates)
    .eq("id", id)
    .eq("vendor_id", userData.user.id)
    .select(
      "id, vendor_id, name, price, stock_quantity, is_active, image_url, created_at, updated_at",
    )
    .single();

  if (error || !data) {
    return NextResponse.json({ ok: false, message: error?.message ?? "Unable to update" }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    product: {
      ...data,
      price: Number(data.price),
      stock: Number(data.stock_quantity ?? 0),
      status: data.is_active ? "active" : "pending",
      imageUrl: data.image_url ?? null,
    },
  });
}

