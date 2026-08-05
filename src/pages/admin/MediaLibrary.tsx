import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";
import { deleteMedia, mediaUrl, renameMedia, replaceMedia } from "../../lib/media";
import type { MediaItem } from "../../lib/types";
import { ConfirmButton, PageHeader, useToast } from "../../components/admin/AdminUI";
import MediaUploader from "../../components/admin/MediaUploader";
import { Spinner } from "../../components/ui";
import { IconVideo } from "../../components/Icons";

const FOLDERS = ["all", "products", "hero", "banners", "lookbooks", "collections", "stories", "reels", "gallery", "journal", "general"];

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaLibrary() {
  const toast = useToast();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [folder, setFolder] = useState("all");
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [renaming, setRenaming] = useState("");
  const [loading, setLoading] = useState(true);
  const replaceRef = useRef<HTMLInputElement>(null);

  async function load() {
    let q = supabase.from("numa_media").select("*").order("created_at", { ascending: false });
    if (folder !== "all") q = q.eq("folder", folder);
    const { data } = await q;
    setItems((data as MediaItem[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { setLoading(true); setSelected(null); void load(); /* eslint-disable-line */ }, [folder]);

  async function handleDelete(item: MediaItem) {
    const err = await deleteMedia(item);
    if (err) toast(err, "err");
    else { toast("Deleted"); setSelected(null); void load(); }
  }

  async function handleRename() {
    if (!selected || !renaming.trim()) return;
    const err = await renameMedia(selected, renaming.trim());
    if (err) toast(err, "err");
    else { toast("Renamed"); void load(); setSelected({ ...selected, name: renaming.trim() }); }
  }

  async function handleReplace(file: File) {
    if (!selected) return;
    const err = await replaceMedia(selected, file);
    if (err) toast(err, "err");
    else { toast("Replaced — the same URL now serves the new file"); void load(); }
  }

  async function copyUrl(item: MediaItem) {
    await navigator.clipboard.writeText(mediaUrl(item.path));
    toast("URL copied");
  }

  return (
    <div>
      <PageHeader title="Media Library" subtitle="Photos, videos, banners, lookbooks and campaign imagery — stored on Supabase Storage." />
      <MediaUploader onUploaded={() => void load()} defaultFolder={folder === "all" ? "general" : folder} />

      <div className="mt-8 mb-5 flex flex-wrap gap-2" role="group" aria-label="Filter by folder">
        {FOLDERS.map((f) => (
          <button key={f} type="button" onClick={() => setFolder(f)} aria-pressed={folder === f} className={`border px-3.5 py-1.5 text-[12px] uppercase tracking-[0.12em] transition-all duration-300 ${folder === f ? "border-olive bg-olive text-cream" : "border-pebble text-soft hover:border-olive"}`}>
            {f}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : items.length === 0 ? (
        <p className="py-12 text-center font-light text-soft">Nothing in this folder yet — drop some files above.</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 xl:grid-cols-6">
            {items.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => { setSelected(m); setRenaming(m.name); }}
                className={`group relative aspect-square overflow-hidden border transition-all duration-300 ${selected?.id === m.id ? "border-olive ring-2 ring-olive/40" : "border-linen hover:border-taupe"}`}
                aria-label={`Select ${m.name}`}
              >
                {m.type === "video" ? (
                  <span className="flex h-full w-full items-center justify-center bg-linen text-soft"><IconVideo width={26} height={26} /></span>
                ) : (
                  <img src={mediaUrl(m.path)} alt={m.name} loading="lazy" className="h-full w-full object-cover" />
                )}
                <span className="absolute inset-x-0 bottom-0 truncate bg-ink/60 px-1.5 py-1 text-[10px] text-cream opacity-0 transition-opacity group-hover:opacity-100">{m.name}</span>
              </button>
            ))}
          </div>

          <aside className="h-fit border border-linen bg-white/70 p-5 lg:sticky lg:top-8" aria-label="Media details">
            {selected ? (
              <>
                {selected.type === "video" ? (
                  <video src={mediaUrl(selected.path)} controls className="w-full" aria-label={selected.name} />
                ) : (
                  <img src={mediaUrl(selected.path)} alt={selected.name} className="w-full object-cover" />
                )}
                <dl className="mt-4 space-y-1 text-[13px] font-light text-soft">
                  <div className="flex justify-between gap-2"><dt>Folder</dt><dd className="text-ink">{selected.folder}</dd></div>
                  <div className="flex justify-between gap-2"><dt>Size</dt><dd className="text-ink">{formatBytes(selected.size_bytes)}</dd></div>
                  {selected.width && <div className="flex justify-between gap-2"><dt>Dimensions</dt><dd className="text-ink">{selected.width} × {selected.height}</dd></div>}
                </dl>
                <div className="mt-4 flex gap-2">
                  <input value={renaming} onChange={(e) => setRenaming(e.target.value)} className="input py-2 text-[13px]" aria-label="Rename file" />
                  <button type="button" className="btn-outline shrink-0 px-4 py-2 text-[11px]" onClick={() => void handleRename()}>Rename</button>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button type="button" className="btn-outline py-2 text-[11px]" onClick={() => void copyUrl(selected)}>Copy URL</button>
                  <button type="button" className="btn-outline py-2 text-[11px]" onClick={() => replaceRef.current?.click()}>Replace file</button>
                </div>
                <input ref={replaceRef} type="file" accept="image/*,video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleReplace(f); e.target.value = ""; }} />
                <div className="mt-3 text-center">
                  <ConfirmButton onConfirm={() => void handleDelete(selected)}>Delete file</ConfirmButton>
                </div>
              </>
            ) : (
              <p className="py-8 text-center text-[14px] font-light text-soft">Select a file to preview, rename, replace or delete it.</p>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
