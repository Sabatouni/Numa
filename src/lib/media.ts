import { MEDIA_BUCKET, mediaUrl, supabase } from "./supabase";
import type { MediaItem } from "./types";

const MAX_DIM = 1600;
const IMAGE_QUALITY = 0.82;

export interface UploadProgress {
  name: string;
  stage: "compressing" | "uploading" | "done" | "error" | "duplicate";
  percent: number;
  message?: string;
}

async function compressImage(file: File): Promise<{ blob: Blob; width: number; height: number; ext: string }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", IMAGE_QUALITY));
  if (!blob) throw new Error("Compression failed");
  // Keep the original if compression somehow made it bigger
  if (blob.size >= file.size && (file.type === "image/jpeg" || file.type === "image/webp")) {
    return { blob: file, width, height, ext: file.name.split(".").pop() ?? "jpg" };
  }
  return { blob, width, height, ext: "webp" };
}

function cleanName(name: string): string {
  const base = name.replace(/\.[^.]+$/, "");
  return base.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "").slice(0, 60) || "file";
}

export async function uploadMedia(
  file: File,
  folder: string,
  onProgress: (p: UploadProgress) => void
): Promise<MediaItem | null> {
  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");
  if (!isImage && !isVideo) {
    onProgress({ name: file.name, stage: "error", percent: 0, message: "Only images and videos are supported" });
    return null;
  }

  // Duplicate check: same original name + size already uploaded
  const { data: dupe } = await supabase
    .from("numa_media")
    .select("id")
    .eq("name", file.name)
    .eq("size_bytes", file.size)
    .maybeSingle();
  if (dupe) {
    onProgress({ name: file.name, stage: "duplicate", percent: 100, message: "Already in your library — skipped" });
    return null;
  }

  let blob: Blob = file;
  let width: number | null = null;
  let height: number | null = null;
  let ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";

  if (isImage) {
    onProgress({ name: file.name, stage: "compressing", percent: 15 });
    try {
      const out = await compressImage(file);
      blob = out.blob;
      width = out.width;
      height = out.height;
      ext = out.ext;
    } catch {
      // fall back to the original file
    }
  }

  onProgress({ name: file.name, stage: "uploading", percent: 45 });
  const path = `${folder}/${Date.now().toString(36)}-${cleanName(file.name)}.${ext}`;
  const { error: upErr } = await supabase.storage.from(MEDIA_BUCKET).upload(path, blob, {
    contentType: isImage ? (ext === "webp" ? "image/webp" : file.type) : file.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (upErr) {
    onProgress({ name: file.name, stage: "error", percent: 0, message: upErr.message });
    return null;
  }

  onProgress({ name: file.name, stage: "uploading", percent: 85 });
  const { data, error: dbErr } = await supabase
    .from("numa_media")
    .insert({
      name: file.name,
      path,
      type: isImage ? "image" : "video",
      folder,
      size_bytes: file.size,
      width,
      height,
      mime: isImage && ext === "webp" ? "image/webp" : file.type,
    })
    .select("*")
    .single();
  if (dbErr || !data) {
    await supabase.storage.from(MEDIA_BUCKET).remove([path]);
    onProgress({ name: file.name, stage: "error", percent: 0, message: dbErr?.message ?? "Database insert failed" });
    return null;
  }
  onProgress({ name: file.name, stage: "done", percent: 100 });
  return data as MediaItem;
}

export async function deleteMedia(item: MediaItem): Promise<string | null> {
  const { error: storageErr } = await supabase.storage.from(MEDIA_BUCKET).remove([item.path]);
  if (storageErr) return storageErr.message;
  const { error } = await supabase.from("numa_media").delete().eq("id", item.id);
  return error ? error.message : null;
}

export async function renameMedia(item: MediaItem, newName: string): Promise<string | null> {
  const { error } = await supabase.from("numa_media").update({ name: newName }).eq("id", item.id);
  return error ? error.message : null;
}

export async function replaceMedia(item: MediaItem, file: File): Promise<string | null> {
  let blob: Blob = file;
  if (file.type.startsWith("image/")) {
    try { blob = (await (async () => { const c = await createImageBitmapCompress(file); return c; })()); } catch { blob = file; }
  }
  const { error: upErr } = await supabase.storage.from(MEDIA_BUCKET).upload(item.path, blob, { upsert: true, cacheControl: "31536000", contentType: file.type });
  if (upErr) return upErr.message;
  const { error } = await supabase.from("numa_media").update({ size_bytes: file.size, mime: file.type }).eq("id", item.id);
  return error ? error.message : null;
}

async function createImageBitmapCompress(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", IMAGE_QUALITY));
  return blob ?? file;
}

export { mediaUrl };
