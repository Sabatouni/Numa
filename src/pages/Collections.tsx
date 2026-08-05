import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { Collection } from "../lib/types";
import Seo from "../components/Seo";
import LazyImage from "../components/LazyImage";
import { FadeIn, SectionHeading, Skeleton } from "../components/ui";

const typeLabel: Record<Collection["type"], string> = {
  standard: "Collection",
  featured: "Featured",
  seasonal: "Seasonal",
  limited: "Limited edition",
  homepage: "Essentials",
};

export default function Collections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void supabase.from("numa_collections").select("*").eq("active", true).order("sort_order")
      .then(({ data }) => { setCollections((data as Collection[]) ?? []); setLoading(false); });
  }, []);

  return (
    <div className="container-page pt-8 sm:pt-12">
      <Seo title="Collections | Numa Baby Essentials" description="Explore Numa collections — Safari, Kendwa Summer, Heirloom and Everyday Essentials. Curated stories in natural fabric." />
      <SectionHeading eyebrow="Curated with care" title="Our collections" />
      <div className="space-y-6 sm:space-y-10">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="aspect-[16/7]" />)
          : collections.map((c, i) => (
              <FadeIn key={c.id}>
                <Link to={`/collections/${c.slug}`} className="group grid items-center gap-6 sm:grid-cols-2 sm:gap-10">
                  <LazyImage
                    src={c.image_url ?? ""}
                    alt={c.name}
                    aspect="aspect-[4/3]"
                    className={i % 2 === 1 ? "sm:order-2" : ""}
                    imgClassName="group-hover:scale-[1.04]"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                  <div className={`text-center sm:text-left ${i % 2 === 1 ? "sm:order-1 sm:text-right" : ""}`}>
                    <p className="eyebrow">{typeLabel[c.type]}</p>
                    <h2 className="mt-2 font-serif text-3xl sm:text-4xl">{c.name}</h2>
                    {c.description && <p className="mt-3 font-light leading-relaxed text-soft">{c.description}</p>}
                    <span className="btn-outline mt-6">Discover the collection</span>
                  </div>
                </Link>
              </FadeIn>
            ))}
      </div>
    </div>
  );
}
