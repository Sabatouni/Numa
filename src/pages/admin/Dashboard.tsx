import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import type { OrderRow } from "../../lib/types";
import { formatDate, money } from "../../lib/format";
import { useStore } from "../../context/StoreContext";
import { Card, PageHeader, StatusBadge, TableShell } from "../../components/admin/AdminUI";

interface Counts { products: number; orders: number; reviews: number; posts: number; messages: number; subscribers: number }

export default function Dashboard() {
  const { site } = useStore();
  const [counts, setCounts] = useState<Counts | null>(null);
  const [recent, setRecent] = useState<OrderRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const count = (table: string, column?: string, value?: string | boolean) => {
        const q = supabase.from(table).select("id", { count: "exact", head: true });
        return column !== undefined && value !== undefined ? q.eq(column, value) : q;
      };
      const [p, o, r, j, m, s, recentRes] = await Promise.all([
        count("numa_products"),
        count("numa_orders", "status", "new"),
        count("numa_reviews", "approved", false),
        count("numa_journal_posts"),
        count("numa_contact_messages", "read", false),
        count("numa_newsletter_subscribers"),
        supabase.from("numa_orders").select("*").order("created_at", { ascending: false }).limit(6),
      ]);
      if (cancelled) return;
      setCounts({
        products: p.count ?? 0,
        orders: o.count ?? 0,
        reviews: r.count ?? 0,
        posts: j.count ?? 0,
        messages: m.count ?? 0,
        subscribers: s.count ?? 0,
      });
      setRecent((recentRes.data as OrderRow[]) ?? []);
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  const stats = [
    { label: "Products", value: counts?.products, to: "/admin/products" },
    { label: "New order intents", value: counts?.orders, to: "/admin/orders" },
    { label: "Pending reviews", value: counts?.reviews, to: "/admin/reviews" },
    { label: "Journal posts", value: counts?.posts, to: "/admin/journal" },
    { label: "Unread messages", value: counts?.messages, to: "/admin/settings" },
    { label: "Subscribers", value: counts?.subscribers, to: "/admin/settings" },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="A calm overview of the shop." />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className="border border-linen bg-white/70 p-5 transition-colors hover:border-sage">
            <p className="font-serif text-3xl">{s.value ?? "–"}</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-soft">{s.label}</p>
          </Link>
        ))}
      </div>

      <Card className="mt-8 p-0">
        <div className="flex items-center justify-between p-5 pb-3">
          <h2 className="font-serif text-xl">Latest order intents</h2>
          <Link to="/admin/orders" className="btn-ghost text-[12px]">View all</Link>
        </div>
        <TableShell head={["Product", "Options", "Qty", "Total", "Status", "Date"]}>
          {recent.map((o) => (
            <tr key={o.id}>
              <td className="px-4 py-3">{o.product_name}</td>
              <td className="px-4 py-3 text-soft">{[o.size, o.color].filter(Boolean).join(" · ") || "—"}</td>
              <td className="px-4 py-3">{o.quantity}</td>
              <td className="px-4 py-3">{money(o.price, site.currency_symbol)}</td>
              <td className="px-4 py-3"><StatusBadge value={o.status} /></td>
              <td className="px-4 py-3 text-soft">{formatDate(o.created_at)}</td>
            </tr>
          ))}
          {recent.length === 0 && (
            <tr><td colSpan={6} className="px-4 py-8 text-center text-soft">No order intents yet — they appear when customers tap “Order on WhatsApp”.</td></tr>
          )}
        </TableShell>
      </Card>
    </div>
  );
}
