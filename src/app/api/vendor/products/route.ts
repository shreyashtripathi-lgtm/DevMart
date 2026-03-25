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
  if (roleValue !== "vendor") {
    return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .schema("public")
    .from("products")
    .select("id, name, price, stock_quantity, is_active, image_url, created_at, updated_at")
    .eq("vendor_id", userData.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 400 });
  }

  const products = (data ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    stock: Number(p.stock_quantity ?? 0),
    status: p.is_active ? "active" : "pending",
    imageUrl: p.image_url ?? null,
    created_at: p.created_at,
    updated_at: p.updated_at,
  }));

  return NextResponse.json({ ok: true, products });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    price?: number;
    stock?: number;
    status?: "active" | "pending";
    imageUrl?: string | null;
  };

  const slugify = (value: string) => {
    const cleaned = value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    return cleaned || "product";
  };

  const name = (body.name ?? "").trim();
  const price = Number(body.price);
  const stock = Number(body.stock);
  const status = body.status ?? "pending";
  const isActive = status === "active";
  const imageUrlRaw = (body.imageUrl ?? "").trim();
  const imageUrl =
    imageUrlRaw.length > 0 ? imageUrlRaw : null;

  if (imageUrl && !/^https?:\/\//i.test(imageUrl)) {
    return NextResponse.json(
      { ok: false, message: "Image URL must start with http(s)://" },
      { status: 400 },
    );
  }

  if (!name) {
    return NextResponse.json({ ok: false, message: "Name is required" }, { status: 400 });
  }
  if (!Number.isFinite(price) || price < 0) {
    return NextResponse.json({ ok: false, message: "Price must be valid" }, { status: 400 });
  }
  if (!Number.isFinite(stock) || stock < 0) {
    return NextResponse.json({ ok: false, message: "Stock must be valid" }, { status: 400 });
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
    return NextResponse.json({ ok: false, message: ensureError.message }, { status: 400 });
  }

  const slug = slugify(name);
  const priceCents = Math.round(price * 100);

  const { data, error } = await supabase
    .schema("public")
    .from("products")
    .insert({
      vendor_id: userData.user.id,
      name,
      slug,
      price,
      price_cents: priceCents,
      stock_quantity: Math.floor(stock),
      is_active: isActive,
      image_url: imageUrl,
    })
    .select(
      "id, name, vendor_id, price, stock_quantity, is_active, image_url, created_at, updated_at",
    )
    .single();

  if (error || !data) {
    return NextResponse.json(
      { ok: false, message: error?.message ?? "Unable to create product" },
      { status: 400 },
    );
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

