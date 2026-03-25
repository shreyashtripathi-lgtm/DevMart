"use client";

import { useEffect, useMemo, useState } from "react";
import LogoutButton from "@/components/logout-button";

type ProductStatus = "active" | "pending";
type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  status: ProductStatus;
  imageUrl?: string | null;
};

type OrderStatus = "pending" | "packed" | "shipped" | "delivered" | "cancelled";
type OrderItem = { id: string; name: string; qty: number; unitPrice: number };
type Order = {
  id: string;
  customerName: string;
  createdAt: string;
  status: OrderStatus;
  items: OrderItem[];
};

const initialProducts: Product[] = [
  { id: "p1", name: "K-Store Mug", price: 12.99, stock: 18, status: "active", imageUrl: null },
  { id: "p2", name: "K-Store T-Shirt", price: 24.99, stock: 7, status: "active", imageUrl: null },
  { id: "p3", name: "Custom Hoodie", price: 39.99, stock: 0, status: "pending", imageUrl: null },
];

const initialOrders: Order[] = [
  {
    id: "o1",
    customerName: "Priya Singh",
    createdAt: "2026-03-24",
    status: "packed",
    items: [
      { id: "i1", name: "K-Store Mug", qty: 2, unitPrice: 12.99 },
      { id: "i2", name: "K-Store T-Shirt", qty: 1, unitPrice: 24.99 },
    ],
  },
  {
    id: "o2",
    customerName: "Daniel Carter",
    createdAt: "2026-03-23",
    status: "pending",
    items: [{ id: "i3", name: "K-Store Mug", qty: 1, unitPrice: 12.99 }],
  },
];

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export default function VendorDashboard() {
  const tabs = ["Overview", "Products", "Inventory", "Orders", "Profile"];
  const [activeTab, setActiveTab] = useState("Overview");

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [productsLoading, setProductsLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState<number>(0);
  const [productStock, setProductStock] = useState<number>(0);
  const [productStatus, setProductStatus] = useState<ProductStatus>("pending");
  const [productImageUrl, setProductImageUrl] = useState<string>("");
  const [productError, setProductError] = useState("");
  const [productSubmitting, setProductSubmitting] = useState(false);

  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const editingProduct = useMemo(
    () => products.find((p) => p.id === editingProductId) ?? null,
    [editingProductId, products],
  );
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editStock, setEditStock] = useState<number>(0);
  const [editStatus, setEditStatus] = useState<ProductStatus>("active");
  const [editImageUrl, setEditImageUrl] = useState<string>("");

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(orders[0]?.id ?? null);
  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId) ?? null,
    [orders, selectedOrderId],
  );
  const [orderStatusDraft, setOrderStatusDraft] = useState<OrderStatus>(
    orders[0]?.status ?? "pending",
  );

  const kpis = useMemo(() => {
    const totalProducts = products.length;
    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
    const outOfStock = products.filter((p) => p.stock === 0).length;
    const pendingOrders = orders.filter((o) => o.status === "pending").length;
    const shippedOrders = orders.filter((o) => o.status === "shipped").length;
    return { totalProducts, lowStock, outOfStock, pendingOrders, shippedOrders };
  }, [orders, products]);

  const refreshProducts = async () => {
    setProductsLoading(true);
    try {
      const response = await fetch("/api/vendor/products");
      const json = (await response.json()) as { ok: boolean; products: Product[] };
      if (json.ok) setProducts(json.products);
    } catch {
      // ignore
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      await refreshProducts();
    };
    void run();
  }, []);

  const addProduct = (event: React.FormEvent<HTMLFormElement>) => {
    void (async () => {
      event.preventDefault();
      setProductError("");
      if (!productName.trim()) {
        setProductError("Product name is required");
        return;
      }
      if (productPrice < 0 || productStock < 0) {
        setProductError("Price and stock must be valid");
        return;
      }

      const imageUrlRaw = productImageUrl.trim();
      if (imageUrlRaw && !/^https?:\/\//i.test(imageUrlRaw)) {
        setProductError("Image URL must start with http(s)://");
        return;
      }

      setProductSubmitting(true);
      try {
        const response = await fetch("/api/vendor/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: productName.trim(),
            price: productPrice,
            stock: Math.floor(productStock),
            status: productStatus,
            imageUrl: imageUrlRaw.length > 0 ? imageUrlRaw : null,
          }),
        });

        if (!response.ok) {
          const json = await response.json().catch(() => null);
          setProductError(json?.message ?? "Unable to add product");
          return;
        }

        setProductName("");
        setProductPrice(0);
        setProductStock(0);
        setProductStatus("pending");
        setProductImageUrl("");
        await refreshProducts();
      } finally {
        setProductSubmitting(false);
      }
    })();
  };

  const startEditing = (product: Product) => {
    setEditingProductId(product.id);
    setEditPrice(product.price);
    setEditStock(product.stock);
    setEditStatus(product.status);
    setEditImageUrl(product.imageUrl ?? "");
  };

  const saveEdit = () => {
    if (!editingProductId) return;
    void (async () => {
      setProductError("");
      const response = await fetch(`/api/vendor/products/${editingProductId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: editPrice,
          stock: Math.floor(editStock),
          status: editStatus,
          imageUrl: editImageUrl.trim().length > 0 ? editImageUrl.trim() : null,
        }),
      });

      if (!response.ok) {
        const json = await response.json().catch(() => null);
        setProductError(json?.message ?? "Unable to update product");
        return;
      }

      await refreshProducts();
      setEditingProductId(null);
    })();
  };

  const cancelEdit = () => {
    setEditingProductId(null);
  };

  const adjustStock = (productId: string, delta: number) => {
    void (async () => {
      const product = products.find((p) => p.id === productId);
      if (!product) return;
      const nextStock = Math.max(0, product.stock + delta);

      const response = await fetch(`/api/vendor/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: nextStock }),
      });

      if (!response.ok) return;
      await refreshProducts();
    })();
  };

  const updateSelectedOrderStatus = () => {
    if (!selectedOrderId) return;
    setOrders((prev) =>
      prev.map((o) => (o.id === selectedOrderId ? { ...o, status: orderStatusDraft } : o)),
    );
  };

  const orderTotal = (order: Order) =>
    order.items.reduce((sum, it) => sum + it.qty * it.unitPrice, 0);

  const totalSales = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + orderTotal(o), 0);

  return (
    <main className="min-h-screen bg-zinc-950">
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-900">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Ecommerce Vendor
            </p>
            <h1 className="text-lg font-bold text-zinc-100">Vendor Control Panel</h1>
          </div>
          <div className="flex items-center gap-3">
            <input
              className="hidden rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-zinc-500 md:block"
              placeholder="Search orders, products..."
            />
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[240px_1fr] md:px-6">
        <aside className="h-fit rounded-2xl border border-zinc-800 bg-zinc-900 p-4 shadow-sm">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Tabs
          </p>
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                  activeTab === tab
                    ? "bg-zinc-800 font-medium text-white"
                    : "text-zinc-300 hover:bg-zinc-800"
                }`}
                onClick={() => setActiveTab(tab)}
                type="button"
              >
                {tab}
              </button>
            ))}
          </nav>
        </aside>

        <section className="space-y-6">
          {activeTab === "Overview" && (
            <>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-zinc-100">Overview</h2>
                <p className="mt-1 text-zinc-400">
                  Manage your catalog, inventory, and orders from one place.
                </p>
              </div>
              <section className="grid gap-4 md:grid-cols-4">
                <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
                  <p className="text-sm text-zinc-400">Total products</p>
                  <p className="mt-2 text-2xl font-bold text-zinc-100">{kpis.totalProducts}</p>
                </article>
                <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
                  <p className="text-sm text-zinc-400">Low stock</p>
                  <p className="mt-2 text-2xl font-bold text-zinc-100">{kpis.lowStock}</p>
                </article>
                <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
                  <p className="text-sm text-zinc-400">Out of stock</p>
                  <p className="mt-2 text-2xl font-bold text-zinc-100">{kpis.outOfStock}</p>
                </article>
                <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
                  <p className="text-sm text-zinc-400">Orders pending</p>
                  <p className="mt-2 text-2xl font-bold text-zinc-100">{kpis.pendingOrders}</p>
                </article>
              </section>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
                <p className="text-sm font-semibold text-zinc-100">Total sales</p>
                <p className="mt-2 text-3xl font-bold text-zinc-100">
                  {formatMoney(totalSales)}
                </p>
                <p className="mt-1 text-sm text-zinc-400">
                  Sum of all non-cancelled orders for this vendor.
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
                <p className="text-sm font-semibold text-zinc-100">Recent orders</p>
                <div className="mt-4 overflow-hidden rounded-xl border border-zinc-800">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-950 text-zinc-400">
                      <tr>
                        <th className="px-3 py-2 font-medium">Order</th>
                        <th className="px-3 py-2 font-medium">Customer</th>
                        <th className="px-3 py-2 font-medium">Status</th>
                        <th className="px-3 py-2 font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr
                          key={o.id}
                          className="border-t border-zinc-800 text-zinc-200"
                          onClick={() => {
                            setSelectedOrderId(o.id);
                            setOrderStatusDraft(o.status);
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          <td className="px-3 py-2">{o.id.toUpperCase()}</td>
                          <td className="px-3 py-2">{o.customerName}</td>
                          <td className="px-3 py-2 capitalize">{o.status}</td>
                          <td className="px-3 py-2">{formatMoney(orderTotal(o))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === "Products" && (
            <>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-zinc-100">Products</h2>
                <p className="mt-1 text-zinc-400">Add products, set price, and control listing status.</p>
              </div>

              <section className="grid gap-4 md:grid-cols-2">
                <form
                  className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm"
                  onSubmit={addProduct}
                >
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-zinc-300">Product name</p>
                      <input
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-zinc-500"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        placeholder="e.g. K-Store Mug"
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-zinc-300">Product image URL (optional)</p>
                      <input
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-zinc-500"
                        value={productImageUrl}
                        onChange={(e) => setProductImageUrl(e.target.value)}
                        placeholder="https://example.com/product.jpg"
                      />
                      {productImageUrl.trim().length > 0 ? (
                        <div className="mt-2 flex items-center gap-3">
                          <img
                            className="h-12 w-12 rounded-lg border border-zinc-800 bg-zinc-950 object-cover"
                            src={productImageUrl.trim()}
                            alt="Selected product"
                          />
                          <p className="text-xs text-zinc-400">Will be shown in your catalog list.</p>
                        </div>
                      ) : null}
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-zinc-300">Price</p>
                        <input
                          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-zinc-500"
                          type="number"
                          step="0.01"
                          min={0}
                          value={productPrice}
                          onChange={(e) => setProductPrice(Number(e.target.value))}
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-zinc-300">Stock</p>
                        <input
                          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-zinc-500"
                          type="number"
                          min={0}
                          value={productStock}
                          onChange={(e) => setProductStock(Number(e.target.value))}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-zinc-300">Listing status</p>
                      <select
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-zinc-500"
                        value={productStatus}
                        onChange={(e) => setProductStatus(e.target.value as ProductStatus)}
                      >
                        <option value="pending">Pending</option>
                        <option value="active">Active</option>
                      </select>
                    </div>
                    <button
                      className="w-full rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-white disabled:opacity-60"
                      disabled={productSubmitting || productsLoading}
                      type="submit"
                    >
                      {productSubmitting ? "Adding..." : "Add Product"}
                    </button>
                    {productError && <p className="text-sm text-red-400">{productError}</p>}
                  </div>
                </form>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-zinc-100">Your catalog</p>
                    <p className="text-xs text-zinc-400">
                      {productsLoading ? "Loading..." : `${products.length} items`}
                    </p>
                  </div>
                  <div className="mt-4 overflow-hidden rounded-xl border border-zinc-800">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-zinc-950 text-zinc-400">
                        <tr>
                          <th className="px-3 py-2 font-medium">Name</th>
                          <th className="px-3 py-2 font-medium">Price</th>
                          <th className="px-3 py-2 font-medium">Stock</th>
                          <th className="px-3 py-2 font-medium">Status</th>
                          <th className="px-3 py-2 font-medium" />
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((p) => (
                          <tr key={p.id} className="border-t border-zinc-800 text-zinc-200">
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-3">
                                {p.imageUrl ? (
                                  <img
                                    className="h-10 w-10 rounded-lg border border-zinc-800 bg-zinc-950 object-cover"
                                    src={p.imageUrl}
                                    alt={p.name}
                                  />
                                ) : null}
                                <span className="truncate">{p.name}</span>
                              </div>
                            </td>
                            <td className="px-3 py-2">{formatMoney(p.price)}</td>
                            <td className="px-3 py-2">{p.stock}</td>
                            <td className="px-3 py-2 capitalize">{p.status}</td>
                            <td className="px-3 py-2">
                              <button
                                className="rounded-lg border border-zinc-700 px-3 py-1 text-xs text-zinc-200 transition hover:bg-zinc-800"
                                type="button"
                                onClick={() => startEditing(p)}
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {editingProduct && (
                    <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
                      <p className="text-sm font-semibold text-zinc-100">Edit {editingProduct.name}</p>
                      <div className="mt-3 grid gap-3 md:grid-cols-3">
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-zinc-300">Price</p>
                          <input
                            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-zinc-500"
                            type="number"
                            step="0.01"
                            min={0}
                            value={editPrice}
                            onChange={(e) => setEditPrice(Number(e.target.value))}
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-zinc-300">Stock</p>
                          <input
                            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-zinc-500"
                            type="number"
                            min={0}
                            value={editStock}
                            onChange={(e) => setEditStock(Number(e.target.value))}
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-zinc-300">Status</p>
                          <select
                            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-zinc-500"
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value as ProductStatus)}
                          >
                            <option value="pending">Pending</option>
                            <option value="active">Active</option>
                          </select>
                        </div>
                      </div>
                      <div className="mt-3 space-y-1">
                        <p className="text-xs font-medium text-zinc-300">Image URL</p>
                        <input
                          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-zinc-500"
                          value={editImageUrl}
                          onChange={(e) => setEditImageUrl(e.target.value)}
                          placeholder="https://example.com/product.jpg"
                        />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white"
                          type="button"
                          onClick={saveEdit}
                        >
                          Save
                        </button>
                        <button
                          className="rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800"
                          type="button"
                          onClick={cancelEdit}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}

          {activeTab === "Inventory" && (
            <>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-zinc-100">Inventory</h2>
                <p className="mt-1 text-zinc-400">Quickly adjust stock for your products.</p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
                <div className="overflow-hidden rounded-xl border border-zinc-800">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-950 text-zinc-400">
                      <tr>
                        <th className="px-3 py-2 font-medium">Product</th>
                        <th className="px-3 py-2 font-medium">Stock</th>
                        <th className="px-3 py-2 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p.id} className="border-t border-zinc-800 text-zinc-200">
                          <td className="px-3 py-2">{p.name}</td>
                          <td className="px-3 py-2">{p.stock}</td>
                          <td className="px-3 py-2">
                            <div className="flex flex-wrap gap-2">
                              <button
                                className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1 text-xs text-zinc-200 transition hover:bg-zinc-800"
                                type="button"
                                onClick={() => adjustStock(p.id, -1)}
                              >
                                -1
                              </button>
                              <button
                                className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1 text-xs text-zinc-200 transition hover:bg-zinc-800"
                                type="button"
                                onClick={() => adjustStock(p.id, 1)}
                              >
                                +1
                              </button>
                              <button
                                className="rounded-lg bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-900 hover:bg-white"
                                type="button"
                                onClick={() => adjustStock(p.id, 5)}
                              >
                                +5
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === "Orders" && (
            <>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-zinc-100">Orders</h2>
                <p className="mt-1 text-zinc-400">Update fulfillment status and track order details.</p>
              </div>

              <section className="grid gap-4 md:grid-cols-[1fr_340px]">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
                  <div className="overflow-hidden rounded-xl border border-zinc-800">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-zinc-950 text-zinc-400">
                        <tr>
                          <th className="px-3 py-2 font-medium">Order</th>
                          <th className="px-3 py-2 font-medium">Customer</th>
                          <th className="px-3 py-2 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((o) => (
                          <tr
                            key={o.id}
                            className={`border-t border-zinc-800 text-zinc-200 ${
                              o.id === selectedOrderId ? "bg-zinc-950/40" : ""
                            }`}
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              setSelectedOrderId(o.id);
                              setOrderStatusDraft(o.status);
                            }}
                          >
                            <td className="px-3 py-2">{o.id.toUpperCase()}</td>
                            <td className="px-3 py-2">{o.customerName}</td>
                            <td className="px-3 py-2 capitalize">{o.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
                  {!selectedOrder ? (
                    <p className="text-sm text-zinc-400">Select an order.</p>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-zinc-100">
                        {selectedOrder.id.toUpperCase()}
                      </p>
                      <p className="mt-1 text-sm text-zinc-400">{selectedOrder.customerName}</p>
                      <p className="mt-1 text-sm text-zinc-400">{selectedOrder.createdAt}</p>
                      <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
                        <p className="text-sm font-semibold text-zinc-100">Items</p>
                        <div className="mt-3 space-y-2 text-sm text-zinc-200">
                          {selectedOrder.items.map((it) => (
                            <div
                              key={it.id}
                              className="flex items-center justify-between gap-2"
                            >
                              <span className="truncate">{it.name}</span>
                              <span>
                                {it.qty} x {formatMoney(it.unitPrice)}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 flex items-center justify-between text-sm text-zinc-300">
                          <span>Total</span>
                          <span>{formatMoney(orderTotal(selectedOrder))}</span>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        <p className="text-sm font-semibold text-zinc-100">Fulfillment status</p>
                        <select
                          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-zinc-500"
                          value={orderStatusDraft}
                          onChange={(e) => setOrderStatusDraft(e.target.value as OrderStatus)}
                        >
                          <option value="pending">Pending</option>
                          <option value="packed">Packed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button
                          className="w-full rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white"
                          type="button"
                          onClick={updateSelectedOrderStatus}
                        >
                          Update Status
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </section>
            </>
          )}

          {activeTab === "Profile" && (
            <>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-zinc-100">Profile</h2>
                <p className="mt-1 text-zinc-400">Vendor account details and store preferences.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
                  <p className="text-sm font-semibold text-zinc-100">Store</p>
                  <div className="mt-4 space-y-3">
                    <input
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-zinc-500"
                      defaultValue="Nova Mart"
                    />
                    <input
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-zinc-500"
                      defaultValue="contact@novamart.com"
                    />
                    <button className="w-full rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white">
                      Save Changes
                    </button>
                  </div>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
                  <p className="text-sm font-semibold text-zinc-100">Notifications</p>
                  <div className="mt-4 space-y-2 text-sm text-zinc-200">
                    <label className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2">
                      Order updates
                      <input type="checkbox" defaultChecked />
                    </label>
                    <label className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2">
                      Low stock alerts
                      <input type="checkbox" defaultChecked />
                    </label>
                    <label className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2">
                      Marketing emails
                      <input type="checkbox" />
                    </label>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

