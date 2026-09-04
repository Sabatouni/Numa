import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { TrackedOrder } from "../lib/types";
import { formatDate, money, orderStatusLabel } from "../lib/format";
import Seo from "../components/Seo";
import { EmptyState, SectionHeading, Spinner } from "../components/ui";
import { IconCheck } from "../components/Icons";
import { useStore } from "../context/StoreContext";

/** Public order tracking — /track/:token.
 *
 *  Everything shown here comes from numa_track_order(), a SECURITY DEFINER
 *  RPC that returns only order_number, status, product/variant/qty/price,
 *  currency and created_at. It never returns customer_name,
 *  customer_whatsapp, customer_mobile, customer_email, customer_note,
 *  whatsapp_message, id, product_id, or the tracking_token itself — this
 *  page has no way to show PII even by accident, and an invalid or
 *  near-match token simply yields zero rows (not an error, and not a hint
 *  that some other order might exist). */
export default function TrackOrder() {
  const { site } = useStore();
  const { token } = useParams<{ token: string }>();
  const [order, setOrder] = useState<TrackedOrder | null | undefined>(undefined); // undefined = loading

  useEffect(() => {
    let cancelled = false;
    setOrder(undefined);
    async function load() {
      if (!token) { setOrder(null); return; }
      const { data } = await supabase.rpc("numa_track_order", { p_token: token });
      if (cancelled) return;
      const rows = (data as TrackedOrder[] | null) ?? [];
      setOrder(rows[0] ?? null);
    }
    void load();
    return () => { cancelled = true; };
  }, [token]);

  return (
    <div className="container-page pt-8 sm:pt-12">
      <Seo title="Track your order | Numa Baby Essentials" description="Check the status of your Numa WhatsApp order." />
      <SectionHeading eyebrow="Order tracking" title="Track your order" />

      {order === undefined ? (
        <Spinner label="Looking up your order" />
      ) : order === null ? (
        <EmptyState
          title="Order not found"
          subtitle="This tracking link doesn't match an order. Double-check the link from your WhatsApp message, or reach out to us directly."
          action={<Link to="/contact" className="btn-outline">Contact us</Link>}
        />
      ) : (
        <div className="mx-auto max-w-lg border border-linen bg-ivory/50 p-7 sm:p-9">
          <div className="flex items-center gap-3 border-b border-linen pb-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sage/30 text-olive">
              <IconCheck width={18} height={18} />
            </span>
            <div>
              <p className="text-[12px] uppercase tracking-[0.16em] text-soft">Order reference</p>
              <p className="font-serif text-xl">{order.order_number}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            <Row label="Status" value={orderStatusLabel(order.status)} emphasis />
            <Row label="Product" value={order.product_name} />
            {(order.size || order.color) && (
              <Row label="Options" value={[order.size, order.color].filter(Boolean).join(" · ")} />
            )}
            <Row label="Quantity" value={String(order.quantity)} />
            <Row label="Total" value={money(order.price, order.currency === site.currency ? site.currency_symbol : order.currency)} />
            <Row label="Placed" value={formatDate(order.created_at)} />
          </div>

          <p className="mt-7 text-center text-[13px] font-light leading-relaxed text-soft">
            Questions about your order? Message us on WhatsApp and mention your order reference above.
          </p>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 text-[15px]">
      <span className="text-[12px] uppercase tracking-[0.15em] text-soft">{label}</span>
      <span className={emphasis ? "font-serif text-lg text-olive" : "font-light text-ink"}>{value}</span>
    </div>
  );
}
