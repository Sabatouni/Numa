import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { Product } from "../lib/types";
import { money } from "../lib/format";
import { useStore } from "../context/StoreContext";
import LazyImage from "./LazyImage";
import { IconEye, IconHeart } from "./Icons";

interface Props {
  product: Product;
  onQuickView?: (p: Product) => void;
  priority?: boolean;
}

export default function ProductCard({ product, onQuickView, priority = false }: Props) {
  const { site, toggleWishlist, isWishlisted } = useStore();
  const images = [...product.numa_product_images].sort((a, b) => a.sort_order - b.sort_order);
  const cover = images[0];
  const hover = images[1];
  const wished = isWishlisted(product.id);
  const totalStock = product.numa_product_variants.reduce((sum, v) => sum + v.stock, 0);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: [0.25, 0.6, 0.3, 1] }}
      className="group relative"
    >
      <div className="relative overflow-hidden">
        <Link to={`/product/${product.slug}`} aria-label={product.name} tabIndex={-1}>
          <LazyImage
            src={cover?.url ?? ""}
            alt={cover?.alt ?? product.name}
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            imgClassName="group-hover:scale-[1.04]"
          />
          {hover && (
            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 ease-soft group-hover:opacity-100">
              <LazyImage src={hover.url} alt="" aspect="aspect-[4/5]" sizes="(max-width: 640px) 50vw, 25vw" />
            </div>
          )}
        </Link>

        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {product.new_arrival && <span className="bg-cream/90 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-olive">New</span>}
          {product.compare_at_price && <span className="bg-claydeep px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white">Sale</span>}
          {totalStock === 0 && <span className="bg-ink/80 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-cream">Sold out</span>}
        </div>

        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          aria-pressed={wished}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-cream/90 transition-all duration-300 ${wished ? "text-claydeep" : "text-soft hover:text-ink"}`}
        >
          <IconHeart width={17} height={17} fill={wished ? "currentColor" : "none"} />
        </button>

        {onQuickView && (
          <button
            type="button"
            onClick={() => onQuickView(product)}
            className="absolute inset-x-3 bottom-3 hidden translate-y-2 items-center justify-center gap-2 bg-cream/95 py-3 text-[11px] uppercase tracking-[0.18em] text-ink opacity-0 transition-all duration-300 ease-soft hover:bg-cream group-hover:translate-y-0 group-hover:opacity-100 sm:flex"
          >
            <IconEye width={15} height={15} /> Quick view
          </button>
        )}
      </div>

      <div className="mt-4 text-center">
        <h3 className="font-serif text-[1.05rem] leading-snug">
          <Link to={`/product/${product.slug}`} className="transition-colors hover:text-olive">{product.name}</Link>
        </h3>
        <p className="mt-1.5 flex items-center justify-center gap-2 text-[14px] font-light">
          <span className="text-ink">{money(product.price, site.currency_symbol)}</span>
          {product.compare_at_price && <s className="text-soft/70">{money(product.compare_at_price, site.currency_symbol)}</s>}
        </p>
      </div>
    </motion.article>
  );
}
