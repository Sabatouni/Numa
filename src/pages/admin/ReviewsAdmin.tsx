import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { Review } from "../../lib/types";
import { formatDate } from "../../lib/format";
import { Card, ConfirmButton, Field, PageHeader, Toggle, useToast } from "../../components/admin/AdminUI";
import { Rating, Spinner } from "../../components/ui";

const emptyForm = { author_name: "", rating: 5, content: "", source: "whatsapp" as Review["source"], approved: true, featured: false };

export default function ReviewsAdmin() {
  const toast = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data } = await supabase.from("numa_reviews").select("*").order("created_at", { ascending: false });
    setReviews((data as Review[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  async function patch(id: string, changes: Partial<Review>) {
    const { error } = await supabase.from("numa_reviews").update(changes).eq("id", id);
    if (error) toast(error.message, "err");
    else void load();
  }

  async function remove(id: string) {
    const { error } = await supabase.from("numa_reviews").delete().eq("id", id);
    if (error) toast(error.message, "err");
    else { toast("Review deleted"); void load(); }
  }

  async function save() {
    if (!form.author_name.trim() || !form.content.trim()) { toast("Name and review text are required", "err"); return; }
    const { error } = await supabase.from("numa_reviews").insert(form);
    if (error) toast(error.message, "err");
    else { toast("Review added"); setAdding(false); setForm(emptyForm); void load(); }
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Reviews"
        subtitle="Reviews arrive via Instagram DM or WhatsApp — add them here, then approve to publish."
        actions={<button type="button" className="btn-primary py-2.5" onClick={() => setAdding((v) => !v)}>{adding ? "Close" : "Add review"}</button>}
      />

      {adding && (
        <Card className="mb-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Customer name"><input className="input" value={form.author_name} onChange={(e) => setForm((f) => ({ ...f, author_name: e.target.value }))} /></Field>
            <Field label="Rating">
              <select className="input" value={form.rating} onChange={(e) => setForm((f) => ({ ...f, rating: Number(e.target.value) }))}>
                {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} star{r > 1 ? "s" : ""}</option>)}
              </select>
            </Field>
            <Field label="Source">
              <select className="input" value={form.source} onChange={(e) => setForm((f) => ({ ...f, source: e.target.value as Review["source"] }))}>
                <option value="whatsapp">WhatsApp</option><option value="instagram">Instagram</option><option value="site">Site</option>
              </select>
            </Field>
          </div>
          <Field label="Review"><textarea rows={3} className="input resize-none" value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} /></Field>
          <button type="button" className="btn-primary py-2.5" onClick={() => void save()}>Save review</button>
        </Card>
      )}

      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className={`border bg-white/70 p-5 ${r.approved ? "border-linen" : "border-dashed border-clay/50"}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Rating value={r.rating} />
                <span className="text-[14px]">{r.author_name}</span>
                <span className="text-[12px] text-soft">via {r.source} · {formatDate(r.created_at)}</span>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-[13px] text-soft">Approved <Toggle checked={r.approved} onChange={(v) => void patch(r.id, { approved: v })} label={`Approve review by ${r.author_name}`} /></label>
                <label className="flex items-center gap-2 text-[13px] text-soft">Homepage <Toggle checked={r.featured} onChange={(v) => void patch(r.id, { featured: v })} label={`Feature review by ${r.author_name}`} /></label>
                <ConfirmButton onConfirm={() => void remove(r.id)}>Delete</ConfirmButton>
              </div>
            </div>
            <p className="mt-3 font-light text-ink/85">{r.content}</p>
          </div>
        ))}
        {reviews.length === 0 && <p className="py-12 text-center font-light text-soft">No reviews yet.</p>}
      </div>
    </div>
  );
}
