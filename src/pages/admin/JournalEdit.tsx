import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import type { JournalCategory, JournalPost } from "../../lib/types";
import { slugify } from "../../lib/format";
import { Card, Field, PageHeader, Toggle, useToast } from "../../components/admin/AdminUI";
import RichText from "../../components/admin/RichText";
import MediaPicker from "../../components/admin/MediaPicker";
import { Spinner } from "../../components/ui";
import { IconChevronLeft } from "../../components/Icons";

const empty = { title: "", slug: "", excerpt: "", content: "", cover_image: "", category_id: "", featured: false, published: false, seo_title: "", seo_description: "" };

export default function JournalEdit() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id;
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(empty);
  const [categories, setCategories] = useState<JournalCategory[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void supabase.from("numa_journal_categories").select("*").order("name").then(({ data }) => setCategories((data as JournalCategory[]) ?? []));
  }, []);

  useEffect(() => {
    if (isNew) return;
    let cancelled = false;
    void supabase.from("numa_journal_posts").select("*").eq("id", id).maybeSingle().then(({ data }) => {
      if (cancelled) return;
      const p = data as JournalPost | null;
      if (p) setForm({ title: p.title, slug: p.slug, excerpt: p.excerpt, content: p.content, cover_image: p.cover_image ?? "", category_id: p.category_id ?? "", featured: p.featured, published: p.published, seo_title: p.seo_title ?? "", seo_description: p.seo_description ?? "" });
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [id, isNew]);

  async function save() {
    if (!form.title.trim()) { toast("Title is required", "err"); return; }
    setSaving(true);
    const payload = {
      ...form,
      slug: form.slug || slugify(form.title),
      cover_image: form.cover_image || null,
      category_id: form.category_id || null,
      seo_title: form.seo_title || null,
      seo_description: form.seo_description || null,
      published_at: form.published ? new Date().toISOString() : null,
    };
    const res = isNew
      ? await supabase.from("numa_journal_posts").insert(payload)
      : await supabase.from("numa_journal_posts").update(payload).eq("id", id);
    setSaving(false);
    if (res.error) toast(res.error.message, "err");
    else { toast("Post saved"); navigate("/admin/journal"); }
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <Link to="/admin/journal" className="mb-4 inline-flex items-center gap-1 text-[12px] uppercase tracking-[0.15em] text-soft hover:text-ink"><IconChevronLeft width={14} height={14} /> Journal</Link>
      <PageHeader title={isNew ? "New post" : "Edit post"} actions={<button type="button" className="btn-primary py-2.5" disabled={saving} onClick={() => void save()}>{saving ? "Saving…" : "Save post"}</button>} />
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card className="space-y-4">
            <Field label="Title"><input className="input" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></Field>
            <Field label="Excerpt"><textarea rows={2} className="input resize-none" value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} /></Field>
            <div>
              <span className="label">Content</span>
              <RichText label="Post content" value={form.content} onChange={(html) => setForm((f) => ({ ...f, content: html }))} />
            </div>
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="space-y-4">
            <Field label="Slug"><input className="input" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))} placeholder={slugify(form.title)} /></Field>
            <Field label="Category">
              <select className="input" value={form.category_id} onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}>
                <option value="">— None —</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Cover image">
              <div className="flex items-center gap-3">
                {form.cover_image && <img src={form.cover_image} alt="" className="h-14 w-20 object-cover" />}
                <button type="button" className="btn-outline py-2" onClick={() => setPickerOpen(true)}>{form.cover_image ? "Change" : "Choose"}</button>
              </div>
            </Field>
            <div className="flex items-center justify-between"><span className="text-[14px]">Published</span><Toggle checked={form.published} onChange={(v) => setForm((f) => ({ ...f, published: v }))} label="Published" /></div>
            <div className="flex items-center justify-between"><span className="text-[14px]">Featured</span><Toggle checked={form.featured} onChange={(v) => setForm((f) => ({ ...f, featured: v }))} label="Featured" /></div>
          </Card>
          <Card className="space-y-4">
            <h2 className="font-serif text-lg">SEO</h2>
            <Field label="SEO title"><input className="input" value={form.seo_title} onChange={(e) => setForm((f) => ({ ...f, seo_title: e.target.value }))} /></Field>
            <Field label="SEO description"><textarea rows={2} className="input resize-none" value={form.seo_description} onChange={(e) => setForm((f) => ({ ...f, seo_description: e.target.value }))} /></Field>
          </Card>
        </div>
      </div>
      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={(url) => { setForm((f) => ({ ...f, cover_image: url })); setPickerOpen(false); }} />
    </div>
  );
}
