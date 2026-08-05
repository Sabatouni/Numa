import { useRef, useState } from "react";
import type { UploadProgress } from "../../lib/media";
import { uploadMedia } from "../../lib/media";
import type { MediaItem } from "../../lib/types";
import { IconUpload } from "../Icons";

const FOLDERS = ["products", "hero", "banners", "lookbooks", "collections", "stories", "reels", "gallery", "journal", "general"];

export default function MediaUploader({ onUploaded, defaultFolder = "general" }: { onUploaded: (items: MediaItem[]) => void; defaultFolder?: string }) {
  const [folder, setFolder] = useState(defaultFolder);
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState<Record<string, UploadProgress>>({});
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (list.length === 0) return;
    setBusy(true);
    const uploaded: MediaItem[] = [];
    for (const file of list) {
      const item = await uploadMedia(file, folder, (p) => setProgress((prev) => ({ ...prev, [p.name]: p })));
      if (item) uploaded.push(item);
    }
    setBusy(false);
    if (uploaded.length) onUploaded(uploaded);
    setTimeout(() => setProgress({}), 4000);
  }

  const entries = Object.values(progress);

  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <label htmlFor="media-folder" className="label mb-0">Upload to</label>
        <select id="media-folder" value={folder} onChange={(e) => setFolder(e.target.value)} className="input w-auto py-2 text-[13px]">
          {FOLDERS.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      <div
        role="button"
        tabIndex={0}
        aria-label="Upload files: drag and drop or press Enter to browse"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); void handleFiles(e.dataTransfer.files); }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 border-2 border-dashed p-10 text-center transition-all duration-300 ${dragOver ? "border-olive bg-sage/10" : "border-pebble bg-ivory/50 hover:border-taupe"}`}
      >
        <IconUpload width={28} height={28} className="text-soft" />
        <p className="font-light text-ink">Drag & drop photos or videos here</p>
        <p className="text-[13px] font-light text-soft">or click to browse — multiple files welcome. Images are optimised & resized automatically.</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => { if (e.target.files) void handleFiles(e.target.files); e.target.value = ""; }}
        />
      </div>

      {entries.length > 0 && (
        <ul className="mt-4 space-y-2" aria-live="polite">
          {entries.map((p) => (
            <li key={p.name} className="border border-linen bg-white/70 p-3">
              <div className="flex items-center justify-between gap-3 text-[13px]">
                <span className="truncate font-light">{p.name}</span>
                <span className={`shrink-0 ${p.stage === "error" ? "text-claydeep" : p.stage === "duplicate" ? "text-bark" : "text-soft"}`}>
                  {p.stage === "done" ? "Uploaded ✓" : p.stage === "duplicate" ? "Duplicate — skipped" : p.stage === "error" ? (p.message ?? "Failed") : p.stage === "compressing" ? "Optimising…" : "Uploading…"}
                </span>
              </div>
              <div className="mt-2 h-1 w-full bg-linen" role="progressbar" aria-valuenow={p.percent} aria-valuemin={0} aria-valuemax={100} aria-label={`Upload progress for ${p.name}`}>
                <div className={`h-1 transition-all duration-500 ${p.stage === "error" ? "bg-clay" : "bg-olive"}`} style={{ width: `${p.percent}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
      {busy && <p className="mt-2 text-[12px] font-light text-soft">Uploading — keep this page open…</p>}
    </div>
  );
}
