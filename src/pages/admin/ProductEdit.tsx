import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import type { Category, Collection, Product, ProductImage, ProductVariant } from "../../lib/types";
import { slugify } from "../../lib/format";
import { Card, ConfirmButton, Field, PageHeader, Toggle, useToast } from "../../components/admin/AdminUI";
import { Spinner } from "../../components/ui";
import MediaPicker from "../../components/admin/MediaPicker";
import { IconChevronLeft, IconTrash } from "../../components/Icons";

interface DraftImage { id?: string; url: string; alt: string; sort_order: number }
interface DraftVariant { id?: string; size: string; color: string; color_hex: string; stock: number; sku: string | null }

const empty = {
  name: "", slug: "", description: "", materials: "", care_instructions: "",
  price: 0, compare_at_price: null as number | null, category_id: "" as string | "",
  gender: "unisex" as Product["gender"], age_range: "0-12m",
  status: "draft" as Product["status"], publish_at: null as string | null,
  featured: false, new_arrival: false, video_url: "",
};

export default function ProductEdit() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id;
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(empty);
  const [images, setImages] = useState<DraftImage[]>([]);
  const [variants, setVariants] = useState<DraftVariant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [linkedCollections, setLinkedCollections] = useState<string[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void supabase.from("numa_categories").select("*").order("sort_order").then(({ data }) => setCategories((data as Category[]) ?? []));
    void supabase.from("numa_collections").select("*").order("sort_order").then(({ data }) => setCollections((data as Collection[]) ?? []));
  }, []);

  useEffect(() => {
    if (isNew) return;
    let cancelled = false;
    async function load() {
      const [{ data }, { data: links }] = await Promise.all([
        supabase.from("numa_products").select("*, numa_product_images(*), numa_product_variants(*)").eq("id", id).maybeSingle(),
        supabase.from("numa_product_collections").select("collection_id").eq("product_id", id),
      ]);
      if (cancelled) return;
      const p = data as Product | null;
      if (p) {
        setForm({
          name: p.name, slug: p.slug, description: p.description,
          materials: p.materials ?? "", care_instructions: p.care_instructions ?? "",
          price: p.price, compare_at_price: p.compare_at_price,
          category_id: p.category_id ?? "", gender: p.gender, age_range: p.age_range,
          status: p.status, publish_at: p.publish_at, featured: p.featured,
          new_arrival: p.new_arrival, video_url: p.video_url ?? "",
        });
        setImages([...p.numa_product_images].sort((a, b) => a.sort_order - b.sort_order).map((i: ProductImage) => ({ id: i.id, url: i.url, alt: i.alt, sort_order: i.sort_order })));
        setVariants(p.numa_product_variants.map((v: ProductVariant) => ({ id: v.id, size: v.size, color: v.color, color_hex: v.color_hex, stock: v.stock, sku: v.sku })));
        setLinkedCollections((links ?? []).map((l) => l.collection_id as string));
      }
      setLoading(false);
    }
    void load();
    return () => { cancelled = true; };
  }, [id, isNew]);

  function set<K extends keyof typeof empty>(key: K, value: (typeof empty)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function moveImage(index: number, dir: -1 | 1) {
    setImages((imgs) => {
      const next = [...imgs];
      const target = index + dir;
      if (target < 0 || target >= next.length) return imgs;
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((img, i) => ({ ...img, sort_order: i }));
    });
  }

  async function save() {
    if (!form.name.trim() || form.price <= 0) { toast("Name and a price above zero are required", "err"); return; }
    setSaving(true);
    const payload = {
      ...form,
      slug: form.slug.trim() || slugify(form.name),
      materials: form.materials || null,
      care_instructions: form.care_instructions || null,
      category_id: form.category_id || null,
      video_url: form.video_url || null,
      compare_at_price: form.compare_at_price || null,
      publish_at: form.status === "scheduled" ? form.publish_at : null,
    };
    let productId = id;
    if (isNew) {
      const { data, error } = await supabase.from("numa_products").insert(payload).select("id").single();
      if (error || !data) { toast(error?.message ?? "Save failed", "err"); setSaving(false); return; }
      productId = data.id as string;
    } else {
      const { error } = await supabase.from("numa_products").update(payload).eq("id", id);
      if (error) { toast(error.message, "err"); setSaving(false); return; }
    }

    await supabase.from("numa_product_images").delete().eq("product_id", productId);
    if (images.length) {
      await supabase.from("numa_product_images").insert(images.map((img, i) => ({ product_id: productId, url: img.url, alt: img.alt, sort_order: i })));
    }
    await supabase.from("numa_product_variants").delete().eq("product_id", productId);
    if (variants.length) {
      await supabase.from("numa_product_variants").insert(variants.map((v) => ({ product_id: productId, size: v.size, color: v.color, color_hex: v.color_hex, stock: v.stock, sku: v.sku || null })));
    }
    await supabase.from("numa_product_collections").delete().eq("product_id", productId);
    if (linkedCollections.length) {
      await supabase.from("numa_product_collections").insert(linkedCollections.map((cid) => ({ product_id: productId, collection_id: cid })));
    }
    setSaving(false);
    toast("Product saved");
    navigate("/admin/products");
  }

  async function remove() {
    if (!id) return;
    await supabase.from("numa_products").delete().eq("id", id);
    toast("Product deleted");
    navigate("/admin/products");
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <Link to="/admin/products" className="mb-4 inline-flex items-center gap-1 text-[12px] uppercase tracking-[0.15em] text-soft hover:text-ink"><IconChevronLeft width={14} height={14} /> Products</Link>
      <PageHeader
        title={isNew ? "New product" : form.name || "Edit product"}
        actions={
          <>
            {!isNew && <ConfirmButton onConfirm={() => void remove()} className="btn-ghost text-claydeep">Delete</ConfirmButton>}
            <button type="button" className="btn-primary py-2.5" disabled={saving} onClick={() => void save()}>{saving ? "Saving…" : "Save product"}</button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card className="space-y-5">
            <Field label="Name"><input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} /></Field>
            <Field label="Slug" hint="Used in the product URL. Leave blank to generate from the name.">
              <input className="input" value={form.slug} onChange={(e) => set("slug", slugify(e.target.value))} placeholder={slugify(form.name)} />
            </Field>
            <Field label="Description"><textarea rows={4} className="input resize-none" value={form.description} onChange={(e) => set("description", e.target.value)} /></Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Materials"><textarea rows={2} className="input resize-none" value={form.materials} onChange={(e) => set("materials", e.target.value)} /></Field>
              <Field label="Care instructions"><textarea rows={2} className="input resize-none" value={form.care_instructions} onChange={(e) => set("care_instructions", e.target.value)} /></Field>
            </div>
          </Card>

          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-xl">Images</h2>
              <button type="button" className="btn-outline py-2" onClick={() => setPickerOpen(true)}>Add from media library</button>
            </div>
            {images.length === 0 && <p className="text-[14px] font-light text-soft">No images yet — add at least one so the product looks beautiful in the shop.</p>}
            <ul className="space-y-3">
              {images.map((img, i) => (
                <li key={`${img.url}-${i}`} className="flex items-center gap-3 border border-linen p-2.5">
                  <img src={img.url} alt="" className="h-16 w-12 shrink-0 object-cover" loading="lazy" />
                  <input className="input py-2 text-[13px]" value={img.alt} placeholder="Alt text (describe the image)" onChange={(e) => setImages((imgs) => imgs.map((x, xi) => (xi === i ? { ...x, alt: e.target.value } : x)))} aria-label={`Alt text for image ${i + 1}`} />
                  <div className="flex shrink-0 items-center gap-1">
                    <button type="button" className="btn-ghost px-2 text-[12px]" disabled={i === 0} onClick={() => moveImage(i, -1)} aria-label="Move image up">↑</button>
                    <button type="button" className="btn-ghost px-2 text-[12px]" disabled={i === images.length - 1} onClick={() => moveImage(i, 1)} aria-label="Move image down">↓</button>
                    <button type="button" className="btn-ghost px-2 text-claydeep" onClick={() => setImages((imgs) => imgs.filter((_, xi) => xi !== i))} aria-label="Remove image"><IconTrash width={15} height={15} /></button>
                  </div>
                </li>
              ))}
            </ul>
            <Field label="Video URL (optional)"><input className="input mt-4" value={form.video_url} onChange={(e) => set("video_url", e.target.value)} placeholder="https://…" /></Field>
          </Card>

          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-xl">Variants</h2>
              <button type="button" className="btn-outline py-2" onClick={() => setVariants((v) => [...v, { size: "0-3m", color: "Ivory", color_hex: "#f2ece1", stock: 0, sku: null }])}>Add variant</button>
            </div>
            <div className="space-y-3">
              {variants.map((v, i) => (
                <div key={i} className="grid grid-cols-2 items-center gap-2 border border-linen p-2.5 sm:grid-cols-[1fr_1fr_56px_90px_1fr_36px]">
                  <input className="input py-2 text-[13px]" value={v.size} placeholder="Size" aria-label="Size" onChange={(e) => setVariants((vs) => vs.map((x, xi) => (xi === i ? { ...x, size: e.target.value } : x)))} />
                  <input className="input py-2 text-[13px]" value={v.color} placeholder="Color name" aria-label="Color name" onChange={(e) => setVariants((vs) => vs.map((x, xi) => (xi === i ? { ...x, color: e.target.value } : x)))} />
                  <input type="color" className="h-10 w-full cursor-pointer border border-pebble bg-white" value={v.color_hex} aria-label="Color swatch" onChange={(e) => setVariants((vs) => vs.map((x, xi) => (xi === i ? { ...x, color_hex: e.target.value } : x)))} />
                  <input type="number" min={0} className="input py-2 text-[13px]" value={v.stock} aria-label="Stock" onChange={(e) => setVariants((vs) => vs.map((x, xi) => (xi === i ? { ...x, stock: Number(e.target.value) } : x)))} />
                  <input className="input py-2 text-[13px]" value={v.sku ?? ""} placeholder="SKU (optional)" aria-label="SKU" onChange={(e) => setVariants((vs) => vs.map((x, xi) => (xi === i ? { ...x, sku: e.target.value } : x)))} />
                  <button type="button" className="btn-ghost px-2 text-claydeep" onClick={() => setVariants((vs) => vs.filter((_, xi) => xi !== i))} aria-label="Remove variant"><IconTrash width={15} height={15} /></button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Price"><input type="number" min={0} className="input" value={form.price} onChange={(e) => set("price", Number(e.target.value))} /></Field>
              <Field label="Compare-at price"><input type="number" min={0} className="input" value={form.compare_at_price ?? ""} onChange={(e) => set("compare_at_price", e.target.value ? Number(e.target.value) : null)} /></Field>
            </div>
            <Field label="Category">
              <select className="input" value={form.category_id} onChange={(e) => set("category_id", e.target.value)}>
                <option value="">— None —</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Gender">
                <select className="input" value={form.gender} onChange={(e) => set("gender", e.target.value as Product["gender"])}>
                  <option value="unisex">Unisex</option><option value="girls">Girls</option><option value="boys">Boys</option>
                </select>
              </Field>
              <Field label="Age range"><input className="input" value={form.age_range} onChange={(e) => set("age_range", e.target.value)} placeholder="0-12m" /></Field>
            </div>
            <Field label="Status">
              <select className="input" value={form.status} onChange={(e) => set("status", e.target.value as Product["status"])}>
                <option value="active">Active (visible)</option>
                <option value="draft">Draft (hidden)</option>
                <option value="scheduled">Scheduled</option>
                <option value="archived">Archived</option>
              </select>
            </Field>
            {form.status === "scheduled" && (
              <Field label="Publish at">
                <input type="datetime-local" className="input" value={form.publish_at ? form.publish_at.slice(0, 16) : ""} onChange={(e) => set("publish_at", e.target.value ? new Date(e.target.value).toISOString() : null)} />
              </Field>
            )}
            <div className="flex items-center justify-between"><span className="text-[14px]">Featured on homepage</span><Toggle checked={form.featured} onChange={(v) => set("featured", v)} label="Featured" /></div>
            <div className="flex items-center justify-between"><span className="text-[14px]">New arrival badge</span><Toggle checked={form.new_arrival} onChange={(v) => set("new_arrival", v)} label="New arrival" /></div>
          </Card>

          <Card>
            <h2 className="mb-4 font-serif text-xl">Collections</h2>
            <div className="space-y-2.5">
              {collections.map((c) => (
                <label key={c.id} className="flex cursor-pointer items-center gap-2.5 text-[14px] font-light">
                  <input
                    type="checkbox"
                    className="accent-olive"
                    checked={linkedCollections.includes(c.id)}
                    onChange={() => setLinkedCollections((l) => (l.includes(c.id) ? l.filter((x) => x !== c.id) : [...l, c.id]))}
                  />
                  {c.name} <span className="text-[11px] uppercase text-soft">{c.type}</span>
                </label>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(url) => {
          setImages((imgs) => [...imgs, { url, alt: form.name, sort_order: imgs.length }]);
          setPickerOpen(false);
        }}
      />
    </div>
  );
}
