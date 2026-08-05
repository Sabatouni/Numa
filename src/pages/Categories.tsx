import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { Category } from "../lib/types";
import Seo from "../components/Seo";
import LazyImage from "../components/LazyImage";
import { FadeIn, SectionHeading, Skeleton } from "../components/ui";
import { IconChevronRight } from "../components/Icons";

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void supabase.from("numa_categories").select("*").eq("active", true).order("sort_order")
      .then(({ data }) => { setCategories((data as Category[]) ?? []); setLoading(false); });
  }, []);

  return (
    <div className="container-page pt-8 sm:pt-12">
      <Seo title="Categories | Numa Baby Essentials" description="Browse Numa by category: newborn, baby, girls, boys, blankets & swaddles, accessories, gift sets and nursery." />
      <SectionHeading eyebrow="Find their favourites" title="Shop by category" />
      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4]" />)
          : categories.map((c, i) => (
              <FadeIn key={c.id} delay={(i % 4) * 0.07}>
                <Link to={`/shop?category=${c.slug}`} className="group block">
                  <LazyImage src={c.image_url ?? ""} alt={c.name} aspect="aspect-[3/4]" imgClassName="group-hover:scale-[1.05]" sizes="(max-width: 640px) 50vw, 25vw" />
                  <div className="mt-3.5 text-center">
                    <h2 className="text-[13px] font-sans uppercase tracking-[0.2em] text-ink">{c.name}</h2>
                    {c.description && <p className="mt-1 text-[13px] font-light text-soft line-clamp-1">{c.description}</p>}
                    <span className="mt-1.5 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.15em] text-soft transition-colors group-hover:text-olive">
                      Shop now <IconChevronRight width={12} height={12} />
                    </span>
                  </div>
                </Link>
              </FadeIn>
            ))}
      </div>
    </div>
  );
}
