import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { GalleryItem, HeroSlide } from "../../lib/types";
import { Card, ConfirmButton, Field, PageHeader, Toggle, useToast } from "../../components/admin/AdminUI";
import MediaPicker from "../../components/admin/MediaPicker";
import { Spinner } from "../../components/ui";

const emptySlide = { title: "", subtitle: "", cta_label: "", cta_link: "/shop", image_url: "", sort_order: 0, active: true };
const emptyGallery = { title: "", media_url: "", type: "image" as GalleryItem["type"], sort_order: 0, active: true };

export default function HomepageEditor() {
  const toast = useToast();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [slideForm, setSlideForm] = useState<typeof emptySlide & { id?: string } | null>(null);
  const [galleryForm, setGalleryForm] = useState<typeof emptyGallery & { id?: string } | null>(null);
  const [picker, setPicker] = useState<"slide" | "gallery" | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const [s, g] = await Promise.all([
      supabase.from("numa_hero_slides").select("*").order("sort_order"),
      supabase.from("numa_gallery_items").select("*").order("sort_order"),
    ]);
    setSlides((s.data as HeroSlide[]) ?? []);
    setGallery((g.data as GalleryItem[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  async function saveSlide() {
    if (!slideForm || !slideForm.title.trim() || !slideForm.image_url) { toast("Slide needs a title and an image", "err"); return; }
    const { id, ...payload } = slideForm;
    const res = id
      ? await supabase.from("numa_hero_slides").update(payload).eq("id", id)
      : await supabase.from("numa_hero_slides").insert(payload);
    if (res.error) toast(res.error.message, "err");
    else { toast("Hero slide saved"); setSlideForm(null); void load(); }
  }

  async function saveGallery() {
    if (!galleryForm || !galleryForm.media_url) { toast("Choose an image or video first", "err"); return; }
    const { id, ...payload } = galleryForm;
    const res = id
      ? await supabase.from("numa_gallery_items").update(payload).eq("id", id)
      : await supabase.from("numa_gallery_items").insert(payload);
    if (res.error) toast(res.error.message, "err");
    else { toast("Gallery item saved"); setGalleryForm(null); void load(); }
  }

  async function removeRow(table: "numa_hero_slides" | "numa_gallery_items", id: string) {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) toast(error.message, "err");
    else { toast("Deleted"); void load(); }
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Homepage" subtitle="Hero slides and the gallery strip shown on the front page." />

      <section aria-label="Hero slides">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-2xl">Hero slides</h2>
          <button type="button" className="btn-primary py-2.5" onClick={() => setSlideForm({ ...emptySlide, sort_order: slides.length + 1 })}>Add slide</button>
        </div>
        {slideForm && (
          <Card className="mb-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Title"><input className="input" value={slideForm.title} onChange={(e) => setSlideForm((f) => f && ({ ...f, title: e.target.value }))} /></Field>
              <Field label="Subtitle"><input className="input" value={slideForm.subtitle} onChange={(e) => setSlideForm((f) => f && ({ ...f, subtitle: e.target.value }))} /></Field>
              <Field label="Button label"><input className="input" value={slideForm.cta_label} onChange={(e) => setSlideForm((f) => f && ({ ...f, cta_label: e.target.value }))} /></Field>
              <Field label="Button link"><input className="input" value={slideForm.cta_link} onChange={(e) => setSlideForm((f) => f && ({ ...f, cta_link: e.target.value }))} placeholder="/shop" /></Field>
            </div>
            <div className="flex flex-wrap items-end gap-4">
              <Field label="Image">
                <div className="flex items-center gap-3">
                  {slideForm.image_url && <img src={slideForm.image_url} alt="" className="h-14 w-20 object-cover" />}
                  <button type="button" className="btn-outline py-2" onClick={() => setPicker("slide")}>{slideForm.image_url ? "Change" : "Choose image"}</button>
                </div>
              </Field>
              <Field label="Sort"><input type="number" className="input w-20" value={slideForm.sort_order} onChange={(e) => setSlideForm((f) => f && ({ ...f, sort_order: Number(e.target.value) }))} /></Field>
              <div className="flex items-center gap-2 pb-1"><Toggle checked={slideForm.active} onChange={(v) => setSlideForm((f) => f && ({ ...f, active: v }))} label="Slide active" /><span className="text-[13px]">Active</span></div>
            </div>
            <div className="flex gap-3">
              <button type="button" className="btn-primary py-2.5" onClick={() => void saveSlide()}>Save slide</button>
              <button type="button" className="btn-ghost" onClick={() => setSlideForm(null)}>Cancel</button>
            </div>
          </Card>
        )}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {slides.map((s) => (
            <div key={s.id} className={`border bg-white/70 p-4 ${s.active ? "border-linen" : "border-dashed border-pebble opacity-60"}`}>
              <img src={s.image_url} alt="" className="mb-3 aspect-[16/9] w-full object-cover" loading="lazy" />
              <p className="font-serif">{s.title}</p>
              <p className="text-[12px] text-soft">{s.subtitle}</p>
              <div className="mt-3 flex justify-between">
                <button type="button" className="btn-ghost -ml-3 text-[12px]" onClick={() => setSlideForm({ id: s.id, title: s.title, subtitle: s.subtitle ?? "", cta_label: s.cta_label ?? "", cta_link: s.cta_link ?? "/shop", image_url: s.image_url, sort_order: s.sort_order, active: s.active })}>Edit</button>
                <ConfirmButton onConfirm={() => void removeRow("numa_hero_slides", s.id)}>Delete</ConfirmButton>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="Homepage gallery" className="mt-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-2xl">Gallery strip</h2>
          <button type="button" className="btn-primary py-2.5" onClick={() => setGalleryForm({ ...emptyGallery, sort_order: gallery.length + 1 })}>Add item</button>
        </div>
        {galleryForm && (
          <Card className="mb-5 space-y-4">
            <div className="flex flex-wrap items-end gap-4">
              <Field label="Title (optional)"><input className="input w-56" value={galleryForm.title} onChange={(e) => setGalleryForm((f) => f && ({ ...f, title: e.target.value }))} /></Field>
              <Field label="Media">
                <div className="flex items-center gap-3">
                  {galleryForm.media_url && galleryForm.type === "image" && <img src={galleryForm.media_url} alt="" className="h-14 w-14 object-cover" />}
                  <button type="button" className="btn-outline py-2" onClick={() => setPicker("gallery")}>{galleryForm.media_url ? "Change" : "Choose"}</button>
                </div>
              </Field>
              <Field label="Sort"><input type="number" className="input w-20" value={galleryForm.sort_order} onChange={(e) => setGalleryForm((f) => f && ({ ...f, sort_order: Number(e.target.value) }))} /></Field>
              <div className="flex items-center gap-2 pb-1"><Toggle checked={galleryForm.active} onChange={(v) => setGalleryForm((f) => f && ({ ...f, active: v }))} label="Gallery item active" /><span className="text-[13px]">Active</span></div>
            </div>
            <div className="flex gap-3">
              <button type="button" className="btn-primary py-2.5" onClick={() => void saveGallery()}>Save item</button>
              <button type="button" className="btn-ghost" onClick={() => setGalleryForm(null)}>Cancel</button>
            </div>
          </Card>
        )}
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 xl:grid-cols-8">
          {gallery.map((g) => (
            <div key={g.id} className={`border p-2 ${g.active ? "border-linen" : "border-dashed border-pebble opacity-60"}`}>
              <img src={g.media_url} alt="" className="aspect-square w-full object-cover" loading="lazy" />
              <div className="mt-1.5 flex justify-between">
                <button type="button" className="btn-ghost -ml-2 px-2 text-[11px]" onClick={() => setGalleryForm({ id: g.id, title: g.title ?? "", media_url: g.media_url, type: g.type, sort_order: g.sort_order, active: g.active })}>Edit</button>
                <ConfirmButton onConfirm={() => void removeRow("numa_gallery_items", g.id)} className="btn-ghost -mr-2 px-2 text-[11px] text-claydeep">Del</ConfirmButton>
              </div>
            </div>
          ))}
        </div>
      </section>

      <MediaPicker
        open={picker !== null}
        onClose={() => setPicker(null)}
        onSelect={(url) => {
          if (picker === "slide") setSlideForm((f) => f && ({ ...f, image_url: url }));
          if (picker === "gallery") setGalleryForm((f) => f && ({ ...f, media_url: url }));
          setPicker(null);
        }}
      />
    </div>
  );
}
