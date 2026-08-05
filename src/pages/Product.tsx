import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import type { Product, Review } from "../lib/types";
import { useStore } from "../context/StoreContext";
import { formatDate, money } from "../lib/format";
import Seo from "../components/Seo";
import LazyImage from "../components/LazyImage";
import OrderPanel from "../components/OrderPanel";
import ProductCard from "../components/ProductCard";
import Lightbox from "../components/Lightbox";
import { EmptyState, FadeIn, Rating, SectionHeading, Spinner } from "../components/ui";
import { IconChevronLeft, IconHeart, IconShare, IconZoom } from "../components/Icons";

const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined) ?? "https://numa.family";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { site, toggleWishlist, isWishlisted, setReviewModalOpen } = useStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [together, setTogether] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [imgIndex, setImgIndex] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setImgIndex(0);
    async function load() {
      const { data } = await supabase
        .from("numa_products")
        .select("*, numa_product_images(*), numa_product_variants(*)")
        .eq("slug", slug)
        .maybeSingle();
      if (cancelled) return;
      const p = data as Product | null;
      setProduct(p);
      setLoading(false);
      if (!p) return;
      const [relRes, revRes, togRes] = await Promise.all([
        supabase.from("numa_products").select("*, numa_product_images(*), numa_product_variants(*)").eq("status", "active").eq("category_id", p.category_id ?? "").neq("id", p.id).limit(4),
        supabase.from("numa_reviews").select("*").eq("approved", true).eq("product_id", p.id).order("created_at", { ascending: false }),
        supabase.from("numa_products").select("*, numa_product_images(*), numa_product_variants(*)").eq("status", "active").eq("featured", true).neq("id", p.id).limit(3),
      ]);
      if (cancelled) return;
      setRelated((relRes.data as Product[]) ?? []);
      setReviews((revRes.data as Review[]) ?? []);
      setTogether((togRes.data as Product[]) ?? []);
    }
    void load();
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) return <Spinner label="Loading product" />;
  if (!product) {
    return (
      <div className="container-page">
        <EmptyState
          title="This piece has wandered off"
          subtitle="It may have been archived or the link is incorrect."
          action={<Link to="/shop" className="btn-outline">Back to shop</Link>}
        />
      </div>
    );
  }

  const images = [...product.numa_product_images].sort((a, b) => a.sort_order - b.sort_order);
  const current = images[imgIndex] ?? images[0];
  const wished = isWishlisted(product.id);
  const avgRating = reviews.length ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10 : null;

  async function share() {
    const url = `${SITE_URL}/product/${product!.slug}`;
    if (navigator.share) {
      try { await navigator.share({ title: product!.name, url }); } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: images.map((i) => i.url),
    brand: { "@type": "Brand", name: "Numa" },
    offers: {
      "@type": "Offer",
      priceCurrency: site.currency,
      price: product.price,
      availability: product.numa_product_variants.some((v) => v.stock > 0) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${SITE_URL}/product/${product.slug}`,
    },
    ...(avgRating ? { aggregateRating: { "@type": "AggregateRating", ratingValue: avgRating, reviewCount: reviews.length } } : {}),
  };

  return (
    <div className="container-page pt-6 sm:pt-10">
      <Seo title={`${product.name} | Numa Baby Essentials`} description={product.description.slice(0, 155)} image={current?.url} type="product" jsonLd={jsonLd} />

      <nav aria-label="Breadcrumb" className="mb-6">
        <Link to="/shop" className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.18em] text-soft transition-colors hover:text-ink">
          <IconChevronLeft width={14} height={14} /> Back to shop
        </Link>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Gallery */}
        <div>
          <motion.button
            type="button"
            onClick={() => setLightbox(imgIndex)}
            className="group relative block w-full cursor-zoom-in"
            aria-label="Zoom image"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <LazyImage key={current?.id} src={current?.url ?? ""} alt={current?.alt ?? product.name} priority sizes="(max-width: 1024px) 100vw, 50vw" imgClassName="group-hover:scale-[1.03]" />
            <span className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-cream/90 text-soft opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <IconZoom width={18} height={18} />
            </span>
          </motion.button>
          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-3" role="group" aria-label="Product images">
              {images.map((img, i) => (
                <button key={img.id} type="button" onClick={() => setImgIndex(i)} aria-label={`View image ${i + 1}`} aria-pressed={i === imgIndex} className={`overflow-hidden border transition-all duration-300 ${i === imgIndex ? "border-olive" : "border-transparent opacity-70 hover:opacity-100"}`}>
                  <LazyImage src={img.url} alt="" aspect="aspect-square" sizes="120px" />
                </button>
              ))}
            </div>
          )}
          {product.video_url && (
            <video src={product.video_url} controls playsInline className="mt-3 w-full" aria-label={`${product.name} video`} preload="none" />
          )}
        </div>

        {/* Details */}
        <div>
          <p className="eyebrow">{product.gender === "unisex" ? "For everyone" : `For ${product.gender}`} · {product.age_range}</p>
          <h1 className="mt-2 text-3xl leading-tight sm:text-4xl">{product.name}</h1>
          <div className="mt-3 flex items-center gap-3">
            <p className="font-serif text-2xl">{money(product.price, site.currency_symbol)}</p>
            {product.compare_at_price && <s className="text-soft">{money(product.compare_at_price, site.currency_symbol)}</s>}
            {avgRating && (
              <span className="ml-2 flex items-center gap-2 text-[13px] text-soft"><Rating value={Math.round(avgRating)} /> {avgRating} ({reviews.length})</span>
            )}
          </div>
          <p className="mt-5 mb-8 max-w-lg text-[16px] font-light leading-relaxed text-ink/85">{product.description}</p>

          <OrderPanel product={product} />

          <div className="mt-5 flex items-center gap-3">
            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              aria-pressed={wished}
              className={`btn-outline flex-1 ${wished ? "border-claydeep text-claydeep hover:bg-claydeep" : ""}`}
            >
              <IconHeart width={16} height={16} fill={wished ? "currentColor" : "none"} /> {wished ? "Saved" : "Save to wishlist"}
            </button>
            <button type="button" onClick={() => void share()} className="btn-outline px-5" aria-label="Share this product">
              <IconShare width={16} height={16} /> {shared ? "Copied!" : "Share"}
            </button>
          </div>

          <div className="mt-10 divide-y divide-linen border-y border-linen">
            {product.materials && <Detail label="Materials" value={product.materials} />}
            {product.care_instructions && <Detail label="Care" value={product.care_instructions} />}
            <Detail label="Ordering" value="Orders are placed through WhatsApp — tap the button above and your message is pre-filled. We reply within business hours to confirm delivery and payment." />
          </div>
        </div>
      </div>

      {/* Frequently bought together */}
      {together.length > 0 && (
        <section className="mt-24" aria-label="Frequently bought together">
          <SectionHeading eyebrow="Completes the gift" title="Often paired with" />
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6">
            {together.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="mt-24" aria-label="Product reviews">
        <SectionHeading eyebrow="Kind words" title={reviews.length ? `${reviews.length} review${reviews.length === 1 ? "" : "s"}` : "No reviews yet"} />
        {reviews.length > 0 ? (
          <div className="mx-auto max-w-3xl space-y-6">
            {reviews.map((r) => (
              <FadeIn key={r.id} className="border border-linen bg-ivory/50 p-7">
                <div className="flex items-center justify-between gap-4">
                  <Rating value={r.rating} />
                  <span className="text-[12px] font-light text-soft">{formatDate(r.created_at)} · via {r.source === "instagram" ? "Instagram" : "WhatsApp"}</span>
                </div>
                <p className="mt-3 font-light leading-relaxed text-ink/85">{r.content}</p>
                <p className="mt-3 text-[12px] uppercase tracking-[0.18em] text-soft">{r.author_name}</p>
              </FadeIn>
            ))}
          </div>
        ) : (
          <p className="text-center font-light text-soft">Be the first to share your experience with this piece.</p>
        )}
        <div className="mt-8 text-center">
          <button type="button" className="btn-outline" onClick={() => setReviewModalOpen(true)}>Leave a review</button>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-24" aria-label="Related products">
          <SectionHeading eyebrow="Keep exploring" title="You may also love" />
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      <Lightbox
        items={images.map((i) => ({ url: i.url, title: i.alt }))}
        index={lightbox}
        onClose={() => setLightbox(null)}
        onNavigate={(i) => { setLightbox(i); setImgIndex(i); }}
      />
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 py-5 sm:grid-cols-[140px_1fr] sm:gap-6">
      <h3 className="text-[12px] font-sans font-normal uppercase tracking-[0.18em] text-soft">{label}</h3>
      <p className="text-[15px] font-light leading-relaxed text-ink/85">{value}</p>
    </div>
  );
}
