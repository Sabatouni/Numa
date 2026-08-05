import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { JournalPost as Post } from "../lib/types";
import { formatDate } from "../lib/format";
import Seo from "../components/Seo";
import LazyImage from "../components/LazyImage";
import { EmptyState, Spinner } from "../components/ui";
import { IconChevronLeft } from "../components/Icons";

export default function JournalPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void supabase
      .from("numa_journal_posts")
      .select("*, numa_journal_categories(*)")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) { setPost(data as Post | null); setLoading(false); }
      });
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) return <Spinner label="Loading story" />;
  if (!post) {
    return (
      <div className="container-page">
        <EmptyState title="Story not found" action={<Link to="/journal" className="btn-outline">Back to journal</Link>} />
      </div>
    );
  }

  return (
    <article className="container-page pt-8 sm:pt-12">
      <Seo
        title={post.seo_title ?? `${post.title} | Numa Journal`}
        description={post.seo_description ?? post.excerpt}
        image={post.cover_image ?? undefined}
        type="article"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.excerpt,
          image: post.cover_image,
          datePublished: post.published_at,
          author: { "@type": "Organization", name: "Numa" },
        }}
      />
      <div className="mx-auto max-w-3xl">
        <Link to="/journal" className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.18em] text-soft transition-colors hover:text-ink">
          <IconChevronLeft width={14} height={14} /> Journal
        </Link>
        <p className="eyebrow mt-8">{post.numa_journal_categories?.name ?? "Journal"} · {formatDate(post.published_at)}</p>
        <h1 className="mt-3 text-4xl leading-tight sm:text-5xl">{post.title}</h1>
        <p className="mt-5 font-serif text-xl italic leading-relaxed text-soft">{post.excerpt}</p>
      </div>
      {post.cover_image && (
        <div className="mx-auto mt-10 max-w-4xl">
          <LazyImage src={post.cover_image} alt={post.title} aspect="aspect-[16/9]" priority sizes="(max-width: 1024px) 100vw, 896px" />
        </div>
      )}
      <div className="prose-numa mx-auto mt-10 max-w-3xl" dangerouslySetInnerHTML={{ __html: post.content }} />
      <div className="mx-auto mt-14 max-w-3xl border-t border-linen pt-8 text-center">
        <Link to="/journal" className="btn-outline">More stories</Link>
      </div>
    </article>
  );
}
