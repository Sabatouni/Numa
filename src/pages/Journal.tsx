import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { JournalCategory, JournalPost } from "../lib/types";
import { formatDate } from "../lib/format";
import Seo from "../components/Seo";
import LazyImage from "../components/LazyImage";
import { EmptyState, FadeIn, SectionHeading, Skeleton } from "../components/ui";

export default function Journal() {
  const [posts, setPosts] = useState<JournalPost[]>([]);
  const [categories, setCategories] = useState<JournalCategory[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [postsRes, catsRes] = await Promise.all([
        supabase.from("numa_journal_posts").select("*, numa_journal_categories(*)").eq("published", true).order("published_at", { ascending: false }),
        supabase.from("numa_journal_categories").select("*").order("name"),
      ]);
      if (cancelled) return;
      setPosts((postsRes.data as JournalPost[]) ?? []);
      setCategories((catsRes.data as JournalCategory[]) ?? []);
      setLoading(false);
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  const filtered = filter ? posts.filter((p) => p.category_id === filter) : posts;
  const featured = filtered.find((p) => p.featured) ?? filtered[0];
  const rest = filtered.filter((p) => p.id !== featured?.id);

  return (
    <div className="container-page pt-8 sm:pt-12">
      <Seo title="Journal | Numa Baby Essentials" description="Care guides, stories from Zanzibar and gentle notes on raising little ones — the Numa journal." />
      <SectionHeading eyebrow="Notes & stories" title="The Numa journal" />

      <div className="mb-10 flex flex-wrap justify-center gap-2" role="group" aria-label="Filter posts by category">
        <button type="button" onClick={() => setFilter("")} aria-pressed={!filter} className={`border px-4 py-2 text-[12px] uppercase tracking-[0.15em] transition-all duration-300 ${!filter ? "border-olive bg-olive text-cream" : "border-pebble text-soft hover:border-olive"}`}>All</button>
        {categories.map((c) => (
          <button key={c.id} type="button" onClick={() => setFilter(c.id)} aria-pressed={filter === c.id} className={`border px-4 py-2 text-[12px] uppercase tracking-[0.15em] transition-all duration-300 ${filter === c.id ? "border-olive bg-olive text-cream" : "border-pebble text-soft hover:border-olive"}`}>{c.name}</button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="aspect-[4/3]" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No stories here yet" subtitle="New posts are on their way." />
      ) : (
        <>
          {featured && (
            <FadeIn>
              <Link to={`/journal/${featured.slug}`} className="group mb-14 grid items-center gap-8 lg:grid-cols-2">
                <LazyImage src={featured.cover_image ?? ""} alt={featured.title} aspect="aspect-[4/3]" imgClassName="group-hover:scale-[1.03]" priority sizes="(max-width: 1024px) 100vw, 50vw" />
                <div>
                  <p className="eyebrow">{featured.numa_journal_categories?.name ?? "Journal"} · {formatDate(featured.published_at)}</p>
                  <h2 className="mt-3 font-serif text-3xl leading-snug sm:text-4xl group-hover:text-olive transition-colors">{featured.title}</h2>
                  <p className="mt-4 font-light leading-relaxed text-soft">{featured.excerpt}</p>
                  <span className="btn-ghost mt-5 -ml-4">Read the story</span>
                </div>
              </Link>
            </FadeIn>
          )}
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((p, i) => (
              <FadeIn key={p.id} delay={(i % 3) * 0.08}>
                <Link to={`/journal/${p.slug}`} className="group block">
                  <LazyImage src={p.cover_image ?? ""} alt={p.title} aspect="aspect-[4/3]" imgClassName="group-hover:scale-[1.04]" sizes="(max-width: 640px) 100vw, 33vw" />
                  <p className="eyebrow mt-4">{p.numa_journal_categories?.name ?? "Journal"} · {formatDate(p.published_at)}</p>
                  <h3 className="mt-2 font-serif text-xl leading-snug transition-colors group-hover:text-olive">{p.title}</h3>
                  <p className="mt-2 text-[14px] font-light text-soft line-clamp-2">{p.excerpt}</p>
                </Link>
              </FadeIn>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
