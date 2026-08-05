import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { Collection } from "../../lib/types";
import { slugify } from "../../lib/format";
import { Card, ConfirmButton, Field, PageHeader, Toggle, useToast } from "../../components/admin/AdminUI";
import MediaPicker from "../../components/admin/MediaPicker";
import { Spinner } from "../../components/ui";

const TYPES: Collection["type"][] = ["standard", "featured", "seasonal", "limited", "homepage"];
const emptyForm = { name: "", slug: "", description: "", image_url: "", type: "standard" as Collection["type"], featured: false, active: true, sort_order: 0 };

export default function CollectionsAdmin() {
  const toast = useToast();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data } = await supabase.from("numa_collections").select("*").order("sort_order");
    setCollections((data as Collection[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  function startEdit(c?: Collection) {
    if (c) {
      setEditing(c.id);
      setForm({ name: c.name, slug: c.slug, description: c.description ?? "", image_url: c.image_url ?? "", type: c.type, featured: c.featured, active: c.active, sort_order: c.sort_order });
    } else {
      setEditing("new");
      setForm({ ...emptyForm, sort_order: collections.length + 1 });
    }
  }

  async function save() {
    if (!form.name.trim()) { toast("Name is required", "err"); return; }
    const payload = { ...form, slug: form.slug || slugify(form.name), description: form.description || null, image_url: form.image_url || null };
    const res = editing === "new"
      ? await supabase.from("numa_collections").insert(payload)
      : await supabase.from("numa_collections").update(payload).eq("id", editing);
    if (res.error) toast(res.error.message, "err");
    else { toast("Collection saved"); setEditing(null); void load(); }
  }

  async function remove(id: string) {
    const { error } = await supabase.from("numa_collections").delete().eq("id", id);
    if (error) toast(error.message, "err");
    else { toast("Collection deleted"); void load(); }
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Collections" subtitle="Curated stories — featured, seasonal, limited and homepage collections." actions={<button type="button" className="btn-primary py-2.5" onClick={() => startEdit()}>Add collection</button>} />

      {editing && (
        <Card className="mb-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name"><input className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></Field>
            <Field label="Slug"><input className="input" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))} placeholder={slugify(form.name)} /></Field>
          </div>
          <Field label="Description"><input className="input" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></Field>
          <div className="flex flex-wrap items-end gap-4">
            <Field label="Type">
              <select className="input w-auto" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as Collection["type"] }))}>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Image">
              <div className="flex items-center gap-3">
                {form.image_url && <img src={form.image_url} alt="" className="h-14 w-11 object-cover" />}
                <button type="button" className="btn-outline py-2" onClick={() => setPickerOpen(true)}>{form.image_url ? "Change" : "Choose image"}</button>
              </div>
            </Field>
            <Field label="Sort"><input type="number" className="input w-20" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))} /></Field>
            <div className="flex items-center gap-2 pb-1"><Toggle checked={form.featured} onChange={(v) => setForm((f) => ({ ...f, featured: v }))} label="Featured on homepage" /><span className="text-[13px]">Homepage</span></div>
            <div className="flex items-center gap-2 pb-1"><Toggle checked={form.active} onChange={(v) => setForm((f) => ({ ...f, active: v }))} label="Active" /><span className="text-[13px]">Active</span></div>
          </div>
          <div className="flex gap-3">
            <button type="button" className="btn-primary py-2.5" onClick={() => void save()}>Save</button>
            <button type="button" className="btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
        {collections.map((c) => (
          <div key={c.id} className={`border bg-white/70 p-4 ${c.active ? "border-linen" : "border-dashed border-pebble opacity-60"}`}>
            {c.image_url && <img src={c.image_url} alt="" className="mb-3 aspect-[4/3] w-full object-cover" loading="lazy" />}
            <p className="font-serif text-lg">{c.name}</p>
            <p className="text-[12px] text-soft">{c.type}{c.featured && " · homepage"}{!c.active && " · hidden"}</p>
            <div className="mt-3 flex justify-between">
              <button type="button" className="btn-ghost -ml-3 text-[12px]" onClick={() => startEdit(c)}>Edit</button>
              <ConfirmButton onConfirm={() => void remove(c.id)}>Delete</ConfirmButton>
            </div>
          </div>
        ))}
      </div>
      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={(url) => { setForm((f) => ({ ...f, image_url: url })); setPickerOpen(false); }} />
    </div>
  );
}
