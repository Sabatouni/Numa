import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { mediaUrl } from "../../lib/media";
import type { MediaItem } from "../../lib/types";
import { Modal } from "../ui";
import MediaUploader from "./MediaUploader";

export default function MediaPicker({ open, onClose, onSelect }: { open: boolean; onClose: () => void; onSelect: (url: string, item?: MediaItem) => void }) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [manualUrl, setManualUrl] = useState("");

  useEffect(() => {
    if (!open) return;
    void supabase.from("numa_media").select("*").eq("type", "image").order("created_at", { ascending: false }).limit(60)
      .then(({ data }) => setItems((data as MediaItem[]) ?? []));
  }, [open]);

  return (
    <Modal open={open} onClose={onClose} label="Choose an image" wide>
      <div className="p-6 sm:p-8">
        <h2 className="mb-5 font-serif text-2xl">Choose an image</h2>
        <MediaUploader defaultFolder="products" onUploaded={(uploaded) => setItems((prev) => [...uploaded, ...prev])} />
        <div className="mt-5 flex gap-2">
          <input value={manualUrl} onChange={(e) => setManualUrl(e.target.value)} placeholder="…or paste an image URL" className="input" aria-label="Image URL" />
          <button type="button" className="btn-outline shrink-0 py-2" disabled={!manualUrl.trim()} onClick={() => { onSelect(manualUrl.trim()); setManualUrl(""); }}>Use URL</button>
        </div>
        {items.length > 0 && (
          <div className="mt-6 grid max-h-[40vh] grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-5">
            {items.map((m) => {
              const url = mediaUrl(m.path);
              return (
                <button key={m.id} type="button" onClick={() => onSelect(url, m)} className="group relative aspect-square overflow-hidden border border-linen focus-visible:border-olive" aria-label={`Select ${m.name}`}>
                  <img src={url} alt={m.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
