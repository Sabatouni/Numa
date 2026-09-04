import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { OrderRow } from "../../lib/types";
import { formatDate, money } from "../../lib/format";
import { toCsv, downloadCsv } from "../../lib/csv";
import { waLink } from "../../lib/whatsapp";
import { useStore } from "../../context/StoreContext";
import { ConfirmButton, PageHeader, StatusBadge, TableShell, useToast } from "../../components/admin/AdminUI";
import { Spinner } from "../../components/ui";
import { IconMail, IconPhone, IconWhatsApp } from "../../components/Icons";

const STATUSES: OrderRow["status"][] = ["new", "contacted", "completed", "cancelled"];

export default function OrdersAdmin() {
  const { site } = useStore();
  const toast = useToast();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);

  async function load() {
    let q = supabase.from("numa_orders").select("*").order("created_at", { ascending: false });
    if (filter) q = q.eq("status", filter);
    const { data } = await q;
    setOrders((data as OrderRow[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { setLoading(true); void load(); /* eslint-disable-line */ }, [filter]);

  async function setStatus(id: string, status: OrderRow["status"]) {
    const { error } = await supabase.from("numa_orders").update({ status }).eq("id", id);
    if (error) toast("Could not update order", "err");
    else { toast("Order updated"); void load(); }
  }

  async function remove(id: string) {
    const { error } = await supabase.from("numa_orders").delete().eq("id", id);
    if (error) toast("Could not delete", "err");
    else { toast("Order deleted"); void load(); }
  }

  function exportCsv() {
    const headers = [
      "Order Reference", "Customer Name", "WhatsApp", "Mobile", "Email",
      "Product", "Size", "Color", "Quantity", "Price", "Status", "Currency", "Created At", "Note",
    ];
    // Tracking tokens are deliberately never included -- a CSV can end up
    // forwarded, printed, or synced to a shared drive, and the token is a
    // customer's private lookup secret, not an internal reference.
    const rows = orders.map((o) => [
      o.order_number ?? "",
      o.customer_name ?? "",
      o.customer_whatsapp ?? "",
      o.customer_mobile ?? "",
      o.customer_email ?? "",
      o.product_name,
      o.size ?? "",
      o.color ?? "",
      o.quantity,
      o.price,
      o.status,
      site.currency,
      o.created_at,
      o.customer_note ?? "",
    ]);
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`numa-orders-${filter || "all"}-${stamp}.csv`, toCsv(headers, rows));
  }

  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle="WhatsApp order intents logged from the storefront."
        actions={
          <>
            <button type="button" className="btn-outline py-2" onClick={exportCsv} disabled={orders.length === 0}>Export CSV</button>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input w-auto py-2" aria-label="Filter by status">
              <option value="">All statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </>
        }
      />
      {loading ? <Spinner /> : (
        <TableShell head={["Order Ref", "Product", "Options", "Qty", "Total", "Customer", "Note", "Status", "Date", ""]}>
          {orders.map((o) => (
            <tr key={o.id}>
              <td className="whitespace-nowrap px-4 py-3 text-[13px] text-soft">{o.order_number ?? "—"}</td>
              <td className="px-4 py-3">{o.product_name}</td>
              <td className="px-4 py-3 text-soft">{[o.size, o.color].filter(Boolean).join(" · ") || "—"}</td>
              <td className="px-4 py-3">{o.quantity}</td>
              <td className="px-4 py-3">{money(o.price, site.currency_symbol)}</td>
              <td className="min-w-[160px] px-4 py-3">
                {o.customer_name ? (
                  <div>
                    <p className="text-ink">{o.customer_name}</p>
                    <div className="mt-1 flex items-center gap-3 text-soft">
                      {o.customer_whatsapp && (
                        <a href={waLink(o.customer_whatsapp)} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${o.customer_name}`} title={o.customer_whatsapp} className="transition-colors hover:text-olive">
                          <IconWhatsApp width={14} height={14} />
                        </a>
                      )}
                      {o.customer_mobile && (
                        <a href={`tel:${o.customer_mobile.replace(/\s/g, "")}`} aria-label={`Call ${o.customer_name}`} title={o.customer_mobile} className="transition-colors hover:text-olive">
                          <IconPhone width={14} height={14} />
                        </a>
                      )}
                      {o.customer_email && (
                        <a href={`mailto:${o.customer_email}`} aria-label={`Email ${o.customer_name}`} title={o.customer_email} className="transition-colors hover:text-olive">
                          <IconMail width={14} height={14} />
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <span className="text-soft">—</span>
                )}
              </td>
              <td className="max-w-[200px] px-4 py-3 text-soft"><span className="line-clamp-2">{o.customer_note ?? "—"}</span></td>
              <td className="px-4 py-3">
                <select value={o.status} onChange={(e) => void setStatus(o.id, e.target.value as OrderRow["status"])} className="input w-auto py-1.5 text-[13px]" aria-label={`Status for ${o.product_name}`}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
              <td className="px-4 py-3 text-soft">{formatDate(o.created_at)}</td>
              <td className="px-4 py-3 text-right"><ConfirmButton onConfirm={() => void remove(o.id)}>Delete</ConfirmButton></td>
            </tr>
          ))}
          {orders.length === 0 && <tr><td colSpan={10} className="px-4 py-10 text-center text-soft">No orders {filter && `with status “${filter}”`} yet.</td></tr>}
        </TableShell>
      )}
      <p className="mt-4 text-[13px] font-light text-soft">Tip: an intent is logged every time a customer opens WhatsApp from a product — confirm the final order in your WhatsApp chat, then update the status here. <StatusBadge value="new" /></p>
    </div>
  );
}
