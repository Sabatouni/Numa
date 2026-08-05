import { createContext, useCallback, useContext, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-serif text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-[14px] font-light text-soft">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`border border-linen bg-white/70 p-6 ${className}`}>{children}</div>;
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[12px] font-light text-soft">{hint}</span>}
    </label>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300 ${checked ? "bg-olive" : "bg-pebble"}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-300 ${checked ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

export function TableShell({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto border border-linen bg-white/70">
      <table className="w-full min-w-[640px] text-left text-[14px]">
        <thead>
          <tr className="border-b border-linen">
            {head.map((h, i) => (
              <th key={`${h}-${i}`} scope="col" className="px-4 py-3 text-[11px] font-normal uppercase tracking-[0.15em] text-soft">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-linen font-light">{children}</tbody>
      </table>
    </div>
  );
}

export function StatusBadge({ value }: { value: string }) {
  const colors: Record<string, string> = {
    active: "bg-sage/30 text-olive",
    draft: "bg-pebble/40 text-soft",
    archived: "bg-linen text-soft",
    scheduled: "bg-sand/60 text-bark",
    new: "bg-clay/20 text-claydeep",
    contacted: "bg-sand/60 text-bark",
    completed: "bg-sage/30 text-olive",
    cancelled: "bg-linen text-soft",
  };
  return <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.1em] ${colors[value] ?? "bg-linen text-soft"}`}>{value}</span>;
}

interface Toast { id: number; message: string; kind: "ok" | "err" }
const ToastContext = createContext<(message: string, kind?: "ok" | "err") => void>(() => undefined);
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((message: string, kind: "ok" | "err" = "ok") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-[99] flex -translate-x-1/2 flex-col items-center gap-2" aria-live="polite">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.p
              key={t.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`rounded-full px-5 py-2.5 text-[13px] shadow-lg ${t.kind === "ok" ? "bg-ink text-cream" : "bg-clay text-white"}`}
            >
              {t.message}
            </motion.p>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function ConfirmButton({ onConfirm, children, className = "btn-ghost text-claydeep" }: { onConfirm: () => void; children: ReactNode; className?: string }) {
  const [armed, setArmed] = useState(false);
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        if (armed) { onConfirm(); setArmed(false); }
        else { setArmed(true); setTimeout(() => setArmed(false), 2500); }
      }}
    >
      {armed ? "Confirm?" : children}
    </button>
  );
}
