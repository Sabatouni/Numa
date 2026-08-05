import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import type { GalleryItem } from "../lib/types";
import Seo from "../components/Seo";
import LazyImage from "../components/LazyImage";
import Lightbox from "../components/Lightbox";
import { EmptyState, SectionHeading, Skeleton, Spinner } from "../components/ui";
import { IconVideo } from "../components/Icons";

const BATCH = 12;

export default function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [visible, setVisible] = useState(BATCH);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void supabase.from("numa_gallery_items").select("*").eq("active", true).order("sort_order")
      .then(({ data }) => { setItems((data as GalleryItem[]) ?? []); setLoading(false); });
  }, []);

  useEffect(() => {
    if (visible >= items.length) return;
    const onScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 600) {
        setVisible((v) => Math.min(v + BATCH, items.length));
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [visible, items.length]);

  const shown = useMemo(() => items.slice(0, visible), [items, visible]);

  return (
    <div className="container-page pt-8 sm:pt-12">
      <Seo title="Gallery | Numa Baby Essentials" description="Little moments in natural fabric — the Numa gallery of photos and film." />
      <SectionHeading eyebrow="Little moments" title="The Numa gallery" />
      {loading ? (
        <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="mb-3 aspect-[3/4]" />)}</div>
      ) : items.length === 0 ? (
        <EmptyState title="The gallery is being curated" subtitle="Beautiful moments coming soon." />
      ) : (
        <>
          <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">
            {shown.map((g, i) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setLightbox(i)}
                className="group relative mb-3 block w-full break-inside-avoid overflow-hidden"
                aria-label={g.title ? `Open ${g.title}` : "Open media"}
              >
                {g.type === "video" ? (
                  <div className="relative">
                    <video src={g.media_url} muted playsInline preload="metadata" className="w-full" />
                    <span className="absolute inset-0 flex items-center justify-center bg-ink/20 text-cream"><IconVideo width={28} height={28} /></span>
                  </div>
                ) : (
                  <LazyImage src={g.media_url} alt={g.title ?? "Numa gallery image"} aspect={i % 3 === 0 ? "aspect-[3/4]" : i % 3 === 1 ? "aspect-square" : "aspect-[4/5]"} imgClassName="group-hover:scale-[1.05]" sizes="(max-width: 640px) 50vw, 25vw" />
                )}
                {g.title && (
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/60 to-transparent p-3 text-left font-serif text-[15px] text-cream opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    {g.title}
                  </span>
                )}
              </button>
            ))}
          </div>
          {visible < items.length && <Spinner label="Loading more" />}
        </>
      )}
      <Lightbox items={items.map((g) => ({ url: g.media_url, title: g.title, type: g.type }))} index={lightbox} onClose={() => setLightbox(null)} onNavigate={setLightbox} />
    </div>
  );
}
