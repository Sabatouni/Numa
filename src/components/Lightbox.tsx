import { useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconChevronLeft, IconChevronRight, IconClose } from "./Icons";

interface Item { url: string; title?: string | null; type?: "image" | "video" }

export default function Lightbox({ items, index, onClose, onNavigate }: { items: Item[]; index: number | null; onClose: () => void; onNavigate: (i: number) => void }) {
  const open = index !== null;
  const prev = useCallback(() => { if (index !== null) onNavigate((index - 1 + items.length) % items.length); }, [index, items.length, onNavigate]);
  const next = useCallback(() => { if (index !== null) onNavigate((index + 1) % items.length); }, [index, items.length, onNavigate]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, onClose, prev, next]);

  const item = index !== null ? items[index] : null;

  return (
    <AnimatePresence>
      {open && item && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[95] flex items-center justify-center bg-ink/90 p-4"
          role="dialog" aria-modal="true" aria-label={item.title ?? "Media viewer"}
          onClick={onClose}
        >
          <button type="button" aria-label="Close viewer" className="absolute right-5 top-5 z-10 p-2 text-cream/80 transition-colors hover:text-cream" onClick={onClose}><IconClose width={26} height={26} /></button>
          <button type="button" aria-label="Previous item" className="absolute left-2 sm:left-6 z-10 p-2 text-cream/70 transition-colors hover:text-cream" onClick={(e) => { e.stopPropagation(); prev(); }}><IconChevronLeft width={30} height={30} /></button>
          <button type="button" aria-label="Next item" className="absolute right-2 sm:right-6 z-10 p-2 text-cream/70 transition-colors hover:text-cream" onClick={(e) => { e.stopPropagation(); next(); }}><IconChevronRight width={30} height={30} /></button>
          <motion.div
            key={item.url}
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.25, 0.6, 0.3, 1] }}
            className="max-h-[85vh] max-w-5xl" onClick={(e) => e.stopPropagation()}
          >
            {item.type === "video" ? (
              <video src={item.url} controls autoPlay className="max-h-[85vh] w-auto" aria-label={item.title ?? "Video"} />
            ) : (
              <img src={item.url} alt={item.title ?? ""} className="max-h-[85vh] w-auto object-contain" />
            )}
            {item.title && <p className="mt-3 text-center font-serif text-lg text-cream/90">{item.title}</p>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
