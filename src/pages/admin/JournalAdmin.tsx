import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import type { JournalPost } from "../../lib/types";
import { formatDate } from "../../lib/format";
import { ConfirmButton, PageHeader, TableShell, Toggle, useToast } from "../../components/admin/AdminUI";
import { Spinner } from "../../components/ui";

export default function JournalAdmin() {
  const toast = useToast();
  const [posts, setPosts] = useState<JournalPost[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data } = await supabase.from("numa_journal_posts").select("*, numa_journal_categories(*)").order("created_at", { ascending: false });
    setPosts((data as JournalPost[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  async function patch(id: string, changes: Partial<JournalPost>) {
    const { error } = await supabase.from("numa_journal_posts").update(changes).eq("id", id);
    if (error) toast(error.message, "err");
    else void load();
  }

  async function remove(id: string) {
    const { error } = await supabase.from("numa_journal_posts").delete().eq("id", id);
    if (error) toast(error.message, "err");
    else { toast("Post deleted"); void load(); }
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Journal" subtitle={`${posts.length} posts`} actions={<Link to="/admin/journal/new" className="btn-primary py-2.5">Write a post</Link>} />
      <TableShell head={["Post", "Category", "Published", "Featured", "Date", ""]}>
        {posts.map((p) => (
          <tr key={p.id}>
            <td className="px-4 py-3">
              <Link to={`/admin/journal/${p.id}`} className="hover:text-olive">{p.title}</Link>
              <p className="text-[12px] text-soft">/journal/{p.slug}</p>
            </td>
            <td className="px-4 py-3 text-soft">{p.numa_journal_categories?.name ?? "—"}</td>
            <td className="px-4 py-3"><Toggle checked={p.published} onChange={(v) => void patch(p.id, { published: v, published_at: v && !p.published_at ? new Date().toISOString() : p.published_at })} label={`Publish ${p.title}`} /></td>
            <td className="px-4 py-3"><Toggle checked={p.featured} onChange={(v) => void patch(p.id, { featured: v })} label={`Feature ${p.title}`} /></td>
            <td className="px-4 py-3 text-soft">{formatDate(p.published_at ?? p.created_at)}</td>
            <td className="px-4 py-3 text-right whitespace-nowrap">
              <Link to={`/admin/journal/${p.id}`} className="btn-ghost text-[12px]">Edit</Link>
              <ConfirmButton onConfirm={() => void remove(p.id)}>Delete</ConfirmButton>
            </td>
          </tr>
        ))}
        {posts.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-soft">No posts yet.</td></tr>}
      </TableShell>
    </div>
  );
}
