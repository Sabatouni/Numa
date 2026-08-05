import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconClose, IconStar } from "./Icons";
import { Logo } from "./Logo";

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div role="status" aria-label={label} className="flex justify-center py-16">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-pebble border-t-olive" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

/** Full-page branded loading state — the NUMA wordmark with a gentle pulse, for route-level and auth-check loads. */
export function BrandLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div role="status" aria-label={label} className="flex min-h-[60vh] flex-col items-center justify-center gap-5 py-16">
      <Logo aria-hidden className="h-7 w-auto animate-pulse text-olive sm:h-8" />
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-pebble border-t-olive" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse bg-linen ${className}`} />;
}

export function SectionHeading({ eyebrow, title, subtitle, center = true }: { eyebrow?: string; title: string; subtitle?: string; center?: boolean }) {
  return (
    <div className={`mb-10 sm:mb-14 ${center ? "text-center" : ""}`}>
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] leading-tight">{title}</h2>
      {subtitle && <p className="mt-4 text-soft font-light max-w-xl mx-auto">{subtitle}</p>}
    </div>
  );
}

export function Rating({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5" role="img" aria-label={`Rated ${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <IconStar key={i} width={size} height={size} className={i <= value ? "text-claydeep" : "text-pebble"} />
      ))}
    </div>
  );
}

export function EmptyState({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="py-20 text-center">
      <h3 className="font-serif text-2xl">{title}</h3>
      {subtitle && <p className="mt-3 text-soft font-light">{subtitle}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
  wide?: boolean;
}

export function Modal({ open, onClose, label, children, wide = false }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && ref.current) {
        const focusables = ref.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    ref.current?.querySelector<HTMLElement>("button, [href], input")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
          onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.25, 0.6, 0.3, 1] }}
            className={`relative max-h-[90vh] w-full overflow-y-auto bg-cream shadow-2xl ${wide ? "max-w-4xl" : "max-w-lg"}`}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="absolute right-4 top-4 z-10 rounded-full bg-cream/80 p-2 text-soft transition-colors hover:text-ink"
            >
              <IconClose width={18} height={18} />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function FadeIn({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.6, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
