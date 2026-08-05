import { useMemo, useState } from "react";
import type { Product } from "../lib/types";
import { money } from "../lib/format";
import { buildOrderMessage, waLink } from "../lib/whatsapp";
import { supabase } from "../lib/supabase";
import { useStore } from "../context/StoreContext";
import { IconMinus, IconPlus, IconWhatsApp } from "./Icons";

const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined) ?? "https://numa.family";

export default function OrderPanel({ product, compact = false }: { product: Product; compact?: boolean }) {
  const { site, contact } = useStore();
  const variants = product.numa_product_variants;
  const colors = useMemo(() => [...new Map(variants.map((v) => [v.color, v])).values()], [variants]);
  const [color, setColor] = useState(colors[0]?.color ?? "");
  const sizes = useMemo(() => variants.filter((v) => v.color === color), [variants, color]);
  const [sizeId, setSizeId] = useState<string>("");
  const selected = sizes.find((v) => v.id === sizeId) ?? sizes.find((v) => v.stock > 0) ?? sizes[0];
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const inStock = (selected?.stock ?? 0) > 0;

  function selectColor(c: string) {
    setColor(c);
    setSizeId("");
    setQty(1);
  }

  async function order() {
    const message = buildOrderMessage({
      productName: product.name,
      size: selected?.size,
      color: selected?.color,
      quantity: qty,
      priceLabel: `${money(product.price * qty, site.currency_symbol)} (${money(product.price, site.currency_symbol)} each)`,
      productUrl: `${SITE_URL}/product/${product.slug}`,
      note: note.trim() || undefined,
    });
    const url = waLink(contact.whatsapp, message);
    window.open(url, "_blank", "noopener,noreferrer");
    await supabase.from("numa_orders").insert({
      product_id: product.id,
      product_name: product.name,
      size: selected?.size ?? null,
      color: selected?.color ?? null,
      quantity: qty,
      price: product.price * qty,
      customer_note: note.trim() || null,
    });
  }

  return (
    <div>
      {colors.length > 0 && (
        <fieldset className="mb-6">
          <legend className="label">Color — {color}</legend>
          <div className="flex flex-wrap gap-2.5">
            {colors.map((v) => (
              <button
                key={v.color}
                type="button"
                onClick={() => selectColor(v.color)}
                aria-label={`Color ${v.color}`}
                aria-pressed={v.color === color}
                className={`h-9 w-9 rounded-full border-2 transition-all duration-300 ${v.color === color ? "border-olive scale-110" : "border-pebble hover:border-taupe"}`}
                style={{ backgroundColor: v.color_hex }}
              />
            ))}
          </div>
        </fieldset>
      )}

      {sizes.length > 0 && (
        <fieldset className="mb-6">
          <legend className="label">Size</legend>
          <div className="flex flex-wrap gap-2">
            {sizes.map((v) => (
              <button
                key={v.id}
                type="button"
                disabled={v.stock === 0}
                onClick={() => setSizeId(v.id)}
                aria-pressed={selected?.id === v.id}
                className={`border px-4 py-2.5 text-[13px] tracking-wide transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:line-through ${selected?.id === v.id ? "border-olive bg-olive text-cream" : "border-pebble text-ink hover:border-olive"}`}
              >
                {v.size}
              </button>
            ))}
          </div>
          <p className="mt-2.5 text-[13px] font-light text-soft" aria-live="polite">
            {inStock ? (selected && selected.stock <= 3 ? `Only ${selected.stock} left in stock` : "In stock — ready to ship") : "Currently sold out in this option"}
          </p>
        </fieldset>
      )}

      <div className="mb-6 flex items-center gap-6">
        <div>
          <span className="label" id={`qty-label-${product.id}`}>Quantity</span>
          <div className="flex items-center border border-pebble" role="group" aria-labelledby={`qty-label-${product.id}`}>
            <button type="button" className="px-3.5 py-2.5 text-soft transition-colors hover:text-ink" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))}><IconMinus width={15} height={15} /></button>
            <span className="w-8 text-center text-[15px]" aria-live="polite">{qty}</span>
            <button type="button" className="px-3.5 py-2.5 text-soft transition-colors hover:text-ink" aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(selected?.stock || 10, q + 1))}><IconPlus width={15} height={15} /></button>
          </div>
        </div>
        <div>
          <span className="label">Total</span>
          <p className="font-serif text-2xl leading-[2.65rem]">{money(product.price * qty, site.currency_symbol)}</p>
        </div>
      </div>

      {!compact && (
        <div className="mb-6">
          <label htmlFor={`note-${product.id}`} className="label">Notes for us (optional)</label>
          <textarea
            id={`note-${product.id}`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Gift wrapping, delivery preferences, questions…"
            className="input resize-none"
          />
        </div>
      )}

      <button type="button" onClick={() => void order()} disabled={!inStock} className="btn-primary w-full py-4">
        <IconWhatsApp width={18} height={18} /> Order on WhatsApp
      </button>
      <p className="mt-3 text-center text-[13px] font-light text-soft">
        Opens WhatsApp with your order details ready to send. We confirm delivery & payment in the chat.
      </p>
    </div>
  );
}
