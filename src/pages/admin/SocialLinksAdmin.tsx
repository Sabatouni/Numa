import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { SocialLink } from "../../lib/types";
import { Card, ConfirmButton, Field, PageHeader, Toggle, useToast } from "../../components/admin/AdminUI";
import { SocialIcon } from "../../components/Icons";
import { Spinner } from "../../components/ui";

const PLATFORMS = ["instagram", "facebook", "tiktok", "pinterest", "threads", "youtube", "other"];
const emptyForm = { platform: "instagram", url: "", label: "", sort_order: 0, active: true };

export default function SocialLinksAdmin() {
  const toast = useToast();
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [form, setForm] = useState<typeof emptyForm & { id?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data } = await supabase.from("numa_social_links").select("*").order("sort_order");
    setLinks((data as SocialLink[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  async function save() {
    if (!form || !form.url.trim()) { toast("URL is required", "err"); return; }
    const { id, ...payload } = form;
    const res = id
      ? await supabase.from("numa_social_links").update(payload).eq("id", id)
      : await supabase.from("numa_social_links").insert(payload);
    if (res.error) toast(res.error.message, "err");
    else { toast("Link saved"); setForm(null); void load(); }
  }

  async function remove(id: string) {
    const { error } = await supabase.from("numa_social_links").delete().eq("id", id);
    if (error) toast(error.message, "err");
    else { toast("Link removed"); void load(); }
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Social Links" subtitle="Shown in the footer and on the contact page." actions={<button type="button" className="btn-primary py-2.5" onClick={() => setForm({ ...emptyForm, sort_order: links.length + 1 })}>Add link</button>} />
      {form && (
        <Card className="mb-6">
          <div className="flex flex-wrap items-end gap-4">
            <Field label="Platform">
              <select className="input w-auto" value={form.platform} onChange={(e) => setForm((f) => f && ({ ...f, platform: e.target.value }))}>
                {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="URL"><input className="input w-72" value={form.url} onChange={(e) => setForm((f) => f && ({ ...f, url: e.target.value }))} placeholder="https://instagram.com/numa.baby" /></Field>
            <Field label="Label"><input className="input w-40" value={form.label} onChange={(e) => setForm((f) => f && ({ ...f, label: e.target.value }))} /></Field>
            <Field label="Sort"><input type="number" className="input w-20" value={form.sort_order} onChange={(e) => setForm((f) => f && ({ ...f, sort_order: Number(e.target.value) }))} /></Field>
            <div className="flex items-center gap-2 pb-1"><Toggle checked={form.active} onChange={(v) => setForm((f) => f && ({ ...f, active: v }))} label="Link active" /><span className="text-[13px]">Active</span></div>
          </div>
          <div className="mt-4 flex gap-3">
            <button type="button" className="btn-primary py-2.5" onClick={() => void save()}>Save</button>
            <button type="button" className="btn-ghost" onClick={() => setForm(null)}>Cancel</button>
          </div>
        </Card>
      )}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {links.map((l) => (
          <div key={l.id} className={`flex items-center gap-4 border bg-white/70 p-4 ${l.active ? "border-linen" : "border-dashed border-pebble opacity-60"}`}>
            <SocialIcon platform={l.platform} width={22} height={22} className="shrink-0 text-olive" />
            <div className="min-w-0 flex-1">
              <p className="text-[14px] capitalize">{l.label || l.platform}</p>
              <a href={l.url} target="_blank" rel="noopener noreferrer" className="block truncate text-[12px] text-soft hover:text-olive">{l.url}</a>
            </div>
            <button type="button" className="btn-ghost text-[12px]" onClick={() => setForm({ id: l.id, platform: l.platform, url: l.url, label: l.label ?? "", sort_order: l.sort_order, active: l.active })}>Edit</button>
            <ConfirmButton onConfirm={() => void remove(l.id)}>Delete</ConfirmButton>
          </div>
        ))}
      </div>
    </div>
  );
}
