import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { Product } from "../lib/types";
import { useStore } from "../context/StoreContext";
import Seo from "../components/Seo";
import ProductCard from "../components/ProductCard";
import QuickView from "../components/QuickView";
import { EmptyState, SectionHeading, Spinner } from "../components/ui";

export default function Wishlist() {
  const { wishlist } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [quick, setQuick] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (wishlist.length === 0) { setProducts([]); setLoading(false); return; }
    let cancelled = false;
    void supabase
      .from("numa_products")
      .select("*, numa_product_images(*), numa_product_variants(*)")
      .in("id", wishlist)
      .then(({ data }) => {
        if (!cancelled) { setProducts((data as Product[]) ?? []); setLoading(false); }
      });
    return () => { cancelled = true; };
  }, [wishlist]);

  return (
    <div className="container-page pt-8 sm:pt-12">
      <Seo title="Wishlist | Numa Baby Essentials" description="Pieces you've saved for later." />
      <SectionHeading eyebrow="Saved with love" title="Your wishlist" subtitle={wishlist.length ? `${wishlist.length} piece${wishlist.length === 1 ? "" : "s"} saved` : undefined} />
      {loading ? (
        <Spinner />
      ) : products.length === 0 ? (
        <EmptyState
          title="Nothing saved yet"
          subtitle="Tap the heart on any piece to keep it here for later."
          action={<Link to="/shop" className="btn-primary">Start browsing</Link>}
        />
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
          {products.map((p) => <ProductCard key={p.id} product={p} onQuickView={setQuick} />)}
        </div>
      )}
      <QuickView product={quick} onClose={() => setQuick(null)} />
    </div>
  );
}
