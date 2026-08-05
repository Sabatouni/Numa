import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { OrderRow } from "../../lib/types";
import { formatDate, money } from "../../lib/format";
import { useStore } from "../../context/StoreContext";
import { ConfirmButton, PageHeader, StatusBadge, TableShell, useToast } from "../../components/admin/AdminUI";
import { Spinner } from "../../components/ui";

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

  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle="WhatsApp order intents logged from the storefront."
        actions={
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input w-auto py-2" aria-label="Filter by status">
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        }
      />
      {loading ? <Spinner /> : (
        <TableShell head={["Product", "Options", "Qty", "Total", "Note", "Status", "Date", ""]}>
          {orders.map((o) => (
            <tr key={o.id}>
              <td className="px-4 py-3">{o.product_name}</td>
              <td className="px-4 py-3 text-soft">{[o.size, o.color].filter(Boolean).join(" · ") || "—"}</td>
              <td className="px-4 py-3">{o.quantity}</td>
              <td className="px-4 py-3">{money(o.price, site.currency_symbol)}</td>
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
          {orders.length === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center text-soft">No orders {filter && `with status “${filter}”`} yet.</td></tr>}
        </TableShell>
      )}
      <p className="mt-4 text-[13px] font-light text-soft">Tip: an intent is logged every time a customer opens WhatsApp from a product — confirm the final order in your WhatsApp chat, then update the status here. <StatusBadge value="new" /></p>
    </div>
  );
}
