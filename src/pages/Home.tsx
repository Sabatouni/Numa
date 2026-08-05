import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import type { Collection, GalleryItem, HeroSlide, Product, Review } from "../lib/types";
import { useStore } from "../context/StoreContext";
import Seo from "../components/Seo";
import LazyImage from "../components/LazyImage";
import ProductCard from "../components/ProductCard";
import QuickView from "../components/QuickView";
import { FadeIn, Rating, SectionHeading, Skeleton } from "../components/ui";
import { IconChevronRight, IconInstagram } from "../components/Icons";

export default function Home() {
  const { about, socials, setReviewModalOpen } = useStore();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [slide, setSlide] = useState(0);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [quick, setQuick] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const instagram = socials.find((s) => s.platform === "instagram");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [heroRes, colRes, prodRes, revRes, galRes] = await Promise.all([
        supabase.from("numa_hero_slides").select("*").eq("active", true).order("sort_order"),
        supabase.from("numa_collections").select("*").eq("active", true).eq("featured", true).order("sort_order").limit(3),
        supabase.from("numa_products").select("*, numa_product_images(*), numa_product_variants(*)").eq("status", "active").eq("featured", true).limit(8),
        supabase.from("numa_reviews").select("*").eq("approved", true).eq("featured", true).order("created_at", { ascending: false }).limit(3),
        supabase.from("numa_gallery_items").select("*").eq("active", true).order("sort_order").limit(8),
      ]);
      if (cancelled) return;
      setSlides((heroRes.data as HeroSlide[]) ?? []);
      setCollections((colRes.data as Collection[]) ?? []);
      setProducts((prodRes.data as Product[]) ?? []);
      setReviews((revRes.data as Review[]) ?? []);
      setGallery((galRes.data as GalleryItem[]) ?? []);
      setLoading(false);
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setSlide((s) => (s + 1) % slides.length), 7000);
    return () => clearInterval(t);
  }, [slides.length]);

  const active = slides[slide];

  return (
    <>
      <Seo
        title="Numa — Baby Essentials | Timeless clothing for little ones"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Store",
          name: "Numa Baby Essentials",
          description: "Timeless baby & kids essentials in natural fabrics, inspired by Zanzibar.",
          image: "https://images.unsplash.com/photo-1522771930-78848d9293e8?q=80&w=1200&auto=format&fit=crop",
        }}
      />

      {/* Hero */}
      <section className="container-page pt-6 sm:pt-10" aria-label="Featured">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 lg:order-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={active?.id ?? "placeholder"}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.6, ease: [0.25, 0.6, 0.3, 1] }}
              >
                <h1 className="text-4xl leading-[1.12] sm:text-5xl lg:text-[3.4rem]">
                  {active?.title ?? "Timeless essentials for little adventures."}
                </h1>
                <p className="mt-6 max-w-md text-[17px] font-light leading-relaxed text-soft">
                  {active?.subtitle ?? "Inspired by Zanzibar. Made for little ones."}
                </p>
                <div className="mt-9 flex flex-wrap items-center gap-4">
                  <Link to={active?.cta_link ?? "/shop"} className="btn-primary">
                    {active?.cta_label ?? "Shop the collection"}
                  </Link>
                  <Link to="/about" className="btn-ghost">Our story <IconChevronRight width={15} height={15} /></Link>
                </div>
              </motion.div>
            </AnimatePresence>
            {slides.length > 1 && (
              <div className="mt-10 flex gap-2" role="tablist" aria-label="Hero slides">
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    role="tab"
                    aria-selected={i === slide}
                    aria-label={`Slide ${i + 1}: ${s.title}`}
                    onClick={() => setSlide(i)}
                    className={`h-[3px] transition-all duration-500 ${i === slide ? "w-10 bg-olive" : "w-5 bg-pebble hover:bg-taupe"}`}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="order-1 lg:order-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={active?.id ?? "img"}
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: [0.25, 0.6, 0.3, 1] }}
              >
                {loading && slides.length === 0 ? (
                  <Skeleton className="aspect-[4/5] w-full rounded-tl-[6rem]" />
                ) : (
                  <LazyImage
                    src={active?.image_url ?? ""}
                    alt={active?.title ?? "Numa baby essentials"}
                    aspect="aspect-[4/5]"
                    className="rounded-tl-[6rem]"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mt-20 bg-ivory py-14 sm:mt-28" aria-label="Why choose Numa">
        <div className="container-page grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {about.values.map((v, i) => (
            <FadeIn key={v.title} delay={i * 0.08} className="text-center">
              <h3 className="text-[12px] font-sans font-normal uppercase tracking-[0.2em] text-ink">{v.title}</h3>
              <p className="mx-auto mt-2.5 max-w-[220px] text-[14px] font-light leading-relaxed text-soft">{v.text}</p>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Featured collections */}
      <section className="container-page mt-20 sm:mt-28" aria-label="Collections">
        <SectionHeading eyebrow="Our collections" title="Timeless pieces for every little adventure" />
        <div className="grid gap-6 sm:grid-cols-3">
          {(loading ? Array.from({ length: 3 }) : collections).map((c, i) => {
            const col = c as Collection | undefined;
            return col?.id ? (
              <FadeIn key={col.id} delay={i * 0.1}>
                <Link to={`/collections/${col.slug}`} className="group block">
                  <LazyImage src={col.image_url ?? ""} alt={col.name} aspect="aspect-[3/4]" imgClassName="group-hover:scale-[1.04]" sizes="(max-width: 640px) 100vw, 33vw" />
                  <div className="mt-4 text-center">
                    <h3 className="text-[13px] font-sans uppercase tracking-[0.2em]">{col.name}</h3>
                    <span className="mt-1.5 inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.15em] text-soft transition-colors group-hover:text-olive">
                      Discover more <IconChevronRight width={13} height={13} />
                    </span>
                  </div>
                </Link>
              </FadeIn>
            ) : (
              <Skeleton key={i} className="aspect-[3/4]" />
            );
          })}
        </div>
      </section>

      {/* Featured products */}
      <section className="container-page mt-20 sm:mt-28" aria-label="Featured products">
        <SectionHeading eyebrow="Loved by little ones" title="Featured essentials" />
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-[4/5]" />)
            : products.map((p) => <ProductCard key={p.id} product={p} onQuickView={setQuick} />)}
        </div>
        <div className="mt-12 text-center">
          <Link to="/shop" className="btn-outline">Shop everything</Link>
        </div>
      </section>

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="mt-20 bg-linen py-16 sm:mt-28 sm:py-20" aria-label="Customer reviews">
          <div className="container-page">
            <SectionHeading eyebrow="Kind words" title="From our families" />
            <div className="grid gap-8 sm:grid-cols-3">
              {reviews.map((r, i) => (
                <FadeIn key={r.id} delay={i * 0.1} className="bg-cream p-8 text-center">
                  <div className="flex justify-center"><Rating value={r.rating} /></div>
                  <blockquote className="mt-4 font-serif text-[1.1rem] italic leading-relaxed text-ink/90">“{r.content}”</blockquote>
                  <p className="mt-4 text-[12px] uppercase tracking-[0.18em] text-soft">{r.author_name}</p>
                </FadeIn>
              ))}
            </div>
            <div className="mt-10 text-center">
              <button type="button" onClick={() => setReviewModalOpen(true)} className="btn-outline">Leave a review</button>
            </div>
          </div>
        </section>
      )}

      {/* Instagram gallery */}
      {gallery.length > 0 && (
        <section className="container-page mt-20 sm:mt-28" aria-label="Instagram gallery">
          <SectionHeading eyebrow="Follow along" title="Little moments, shared" subtitle={instagram ? `Join us ${instagram.url.replace("https://", "")}` : undefined} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {gallery.map((g, i) => (
              <a key={g.id} href={instagram?.url ?? "#"} target="_blank" rel="noopener noreferrer" className="group relative block" aria-label={g.title ?? "View on Instagram"}>
                <LazyImage src={g.media_url} alt={g.title ?? "Numa moment"} aspect="aspect-square" imgClassName="group-hover:scale-[1.05]" sizes="(max-width: 640px) 50vw, 25vw" priority={i < 2} />
                <span className="absolute inset-0 flex items-center justify-center bg-ink/0 text-cream opacity-0 transition-all duration-300 group-hover:bg-ink/25 group-hover:opacity-100">
                  <IconInstagram width={22} height={22} />
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      <QuickView product={quick} onClose={() => setQuick(null)} />
    </>
  );
}
