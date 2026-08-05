import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Review } from "../lib/types";
import { useStore } from "../context/StoreContext";
import { formatDate } from "../lib/format";
import Seo from "../components/Seo";
import { EmptyState, FadeIn, Rating, SectionHeading, Skeleton } from "../components/ui";

export default function Reviews() {
  const { setReviewModalOpen } = useStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void supabase.from("numa_reviews").select("*").eq("approved", true).order("created_at", { ascending: false })
      .then(({ data }) => { setReviews((data as Review[]) ?? []); setLoading(false); });
  }, []);

  const avg = reviews.length ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10 : null;

  return (
    <div className="container-page pt-8 sm:pt-12">
      <Seo title="Reviews | Numa Baby Essentials" description="What families say about Numa — real reviews shared through Instagram and WhatsApp." />
      <SectionHeading
        eyebrow="From our families"
        title="Kind words, honestly given"
        subtitle={avg ? `${avg} out of 5 · ${reviews.length} review${reviews.length === 1 ? "" : "s"}` : undefined}
      />
      <div className="mb-12 text-center">
        <button type="button" className="btn-primary" onClick={() => setReviewModalOpen(true)}>Leave a review</button>
        <p className="mt-3 text-[13px] font-light text-soft">Share your experience through Instagram DM or WhatsApp — whichever you prefer.</p>
      </div>
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48" />)}</div>
      ) : reviews.length === 0 ? (
        <EmptyState title="No reviews yet" subtitle="Be the first to share your Numa moment." />
      ) : (
        <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
          {reviews.map((r, i) => (
            <FadeIn key={r.id} delay={(i % 3) * 0.06} className="mb-6 break-inside-avoid border border-linen bg-ivory/60 p-7">
              <div className="flex items-center justify-between gap-3">
                <Rating value={r.rating} />
                <span className="text-[11px] uppercase tracking-[0.12em] text-soft">via {r.source === "instagram" ? "Instagram" : "WhatsApp"}</span>
              </div>
              <blockquote className="mt-4 font-light leading-relaxed text-ink/85">“{r.content}”</blockquote>
              <p className="mt-4 text-[12px] uppercase tracking-[0.18em] text-soft">{r.author_name} · {formatDate(r.created_at)}</p>
            </FadeIn>
          ))}
        </div>
      )}
    </div>
  );
}
