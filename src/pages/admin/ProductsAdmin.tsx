import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import type { Product } from "../../lib/types";
import { money, slugify } from "../../lib/format";
import { useStore } from "../../context/StoreContext";
import { ConfirmButton, PageHeader, StatusBadge, TableShell, useToast } from "../../components/admin/AdminUI";
import { Spinner } from "../../components/ui";

function uniqueSuffix(): string {
  return Date.now().toString(36);
}

export default function ProductsAdmin() {
  const { site } = useStore();
  const toast = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    let q = supabase.from("numa_products").select("*, numa_product_images(*), numa_product_variants(*)").order("created_at", { ascending: false });
    if (search) q = q.ilike("name", `%${search}%`);
    if (status) q = q.eq("status", status);
    const { data } = await q;
    setProducts((data as Product[]) ?? []);
    setSelected([]);
    setLoading(false);
  }, [search, status]);

  useEffect(() => { setLoading(true); void load(); }, [load]);

  async function update(ids: string[], patch: Partial<Product>) {
    const { error } = await supabase.from("numa_products").update(patch).in("id", ids);
    if (error) toast(error.message, "err");
    else { toast(`Updated ${ids.length} product${ids.length === 1 ? "" : "s"}`); void load(); }
  }

  async function removeMany(ids: string[]) {
    const { error } = await supabase.from("numa_products").delete().in("id", ids);
    if (error) toast(error.message, "err");
    else { toast("Deleted"); void load(); }
  }

  async function duplicate(p: Product) {
    const { data: created, error } = await supabase
      .from("numa_products")
      .insert({
        name: `${p.name} (copy)`,
        slug: `${p.slug}-copy-${uniqueSuffix()}`,
        description: p.description,
        materials: p.materials,
        care_instructions: p.care_instructions,
        price: p.price,
        compare_at_price: p.compare_at_price,
        category_id: p.category_id,
        gender: p.gender,
        age_range: p.age_range,
        status: "draft",
        featured: false,
        new_arrival: p.new_arrival,
        video_url: p.video_url,
      })
      .select("id")
      .single();
    if (error || !created) { toast(error?.message ?? "Duplicate failed", "err"); return; }
    const newId = created.id as string;
    const images = p.numa_product_images.map((i) => ({ product_id: newId, url: i.url, alt: i.alt, sort_order: i.sort_order }));
    const variants = p.numa_product_variants.map((v) => ({ product_id: newId, size: v.size, color: v.color, color_hex: v.color_hex, stock: v.stock, sku: v.sku }));
    if (images.length) await supabase.from("numa_product_images").insert(images);
    if (variants.length) await supabase.from("numa_product_variants").insert(variants);
    toast("Duplicated as draft");
    void load();
  }

  function toggleAll() {
    setSelected((s) => (s.length === products.length ? [] : products.map((p) => p.id)));
  }

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle={`${products.length} products`}
        actions={<Link to="/admin/products/new" className="btn-primary py-2.5">Add product</Link>}
      />
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…" className="input w-64" aria-label="Search products" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input w-auto py-2.5" aria-label="Filter by status">
          <option value="">All statuses</option>
          {["active", "draft", "scheduled", "archived"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {selected.length > 0 && (
          <div className="ml-auto flex flex-wrap items-center gap-2 border border-sand bg-linen px-3 py-2">
            <span className="text-[13px] text-soft">{selected.length} selected</span>
            <button type="button" className="btn-ghost text-[12px]" onClick={() => void update(selected, { featured: true })}>Feature</button>
            <button type="button" className="btn-ghost text-[12px]" onClick={() => void update(selected, { status: "draft" })}>Hide</button>
            <button type="button" className="btn-ghost text-[12px]" onClick={() => void update(selected, { status: "archived" })}>Archive</button>
            <button type="button" className="btn-ghost text-[12px]" onClick={() => void update(selected, { status: "active" })}>Restore</button>
            <ConfirmButton onConfirm={() => void removeMany(selected)}>Delete</ConfirmButton>
          </div>
        )}
      </div>

      {loading ? <Spinner /> : (
        <TableShell head={["", "Product", "Price", "Stock", "Status", "Flags", ""]}>
          <tr className="bg-linen/40">
            <td className="px-4 py-2"><input type="checkbox" checked={selected.length === products.length && products.length > 0} onChange={toggleAll} aria-label="Select all products" className="accent-olive" /></td>
            <td colSpan={6} className="px-4 py-2 text-[12px] uppercase tracking-[0.12em] text-soft">Select all</td>
          </tr>
          {products.map((p) => {
            const stock = p.numa_product_variants.reduce((s, v) => s + v.stock, 0);
            return (
              <tr key={p.id}>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(p.id)}
                    onChange={() => setSelected((s) => (s.includes(p.id) ? s.filter((x) => x !== p.id) : [...s, p.id]))}
                    aria-label={`Select ${p.name}`}
                    className="accent-olive"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {p.numa_product_images[0] && <img src={p.numa_product_images[0].url} alt="" className="h-11 w-9 shrink-0 object-cover" loading="lazy" />}
                    <div>
                      <Link to={`/admin/products/${p.id}`} className="hover:text-olive">{p.name}</Link>
                      <p className="text-[12px] text-soft">/{p.slug || slugify(p.name)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{money(p.price, site.currency_symbol)}</td>
                <td className={`px-4 py-3 ${stock === 0 ? "text-claydeep" : ""}`}>{stock}</td>
                <td className="px-4 py-3"><StatusBadge value={p.status} /></td>
                <td className="px-4 py-3 text-[12px] text-soft">{[p.featured && "Featured", p.new_arrival && "New"].filter(Boolean).join(" · ") || "—"}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button type="button" className="btn-ghost text-[12px]" onClick={() => void duplicate(p)}>Duplicate</button>
                  <Link to={`/admin/products/${p.id}`} className="btn-ghost text-[12px]">Edit</Link>
                </td>
              </tr>
            );
          })}
          {products.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-soft">No products found.</td></tr>}
        </TableShell>
      )}
    </div>
  );
}
