import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { Collection, Product } from "../lib/types";
import Seo from "../components/Seo";
import LazyImage from "../components/LazyImage";
import ProductCard from "../components/ProductCard";
import QuickView from "../components/QuickView";
import { EmptyState, Spinner } from "../components/ui";
import { IconChevronLeft } from "../components/Icons";

export default function CollectionDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [quick, setQuick] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    async function load() {
      const { data: col } = await supabase.from("numa_collections").select("*").eq("slug", slug).maybeSingle();
      if (cancelled) return;
      setCollection(col as Collection | null);
      if (col) {
        const { data: links } = await supabase.from("numa_product_collections").select("product_id").eq("collection_id", (col as Collection).id);
        const ids = (links ?? []).map((l) => l.product_id as string);
        if (ids.length) {
          const { data: prods } = await supabase
            .from("numa_products")
            .select("*, numa_product_images(*), numa_product_variants(*)")
            .eq("status", "active")
            .in("id", ids);
          if (!cancelled) setProducts((prods as Product[]) ?? []);
        } else {
          setProducts([]);
        }
      }
      if (!cancelled) setLoading(false);
    }
    void load();
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) return <Spinner label="Loading collection" />;
  if (!collection) {
    return (
      <div className="container-page">
        <EmptyState title="Collection not found" action={<Link to="/collections" className="btn-outline">All collections</Link>} />
      </div>
    );
  }

  return (
    <div>
      <Seo title={`${collection.name} | Numa Baby Essentials`} description={collection.description ?? `Shop the ${collection.name} from Numa.`} image={collection.image_url ?? undefined} />
      <section className="relative">
        <LazyImage src={collection.image_url ?? ""} alt={collection.name} aspect="aspect-[16/7] min-h-[300px]" priority sizes="100vw" />
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-ink/50 via-ink/10 to-transparent">
          <div className="container-page pb-10 text-cream">
            <p className="text-[12px] uppercase tracking-[0.25em] text-cream/80">Collection</p>
            <h1 className="mt-1 text-4xl sm:text-5xl text-cream">{collection.name}</h1>
            {collection.description && <p className="mt-3 max-w-xl font-light text-cream/90">{collection.description}</p>}
          </div>
        </div>
      </section>
      <div className="container-page pt-10">
        <Link to="/collections" className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.18em] text-soft transition-colors hover:text-ink">
          <IconChevronLeft width={14} height={14} /> All collections
        </Link>
        {products.length === 0 ? (
          <EmptyState title="Pieces coming soon" subtitle="This collection is being lovingly prepared." />
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
            {products.map((p) => <ProductCard key={p.id} product={p} onQuickView={setQuick} />)}
          </div>
        )}
      </div>
      <QuickView product={quick} onClose={() => setQuick(null)} />
    </div>
  );
}
