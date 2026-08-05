import { Link } from "react-router-dom";
import type { Product } from "../lib/types";
import LazyImage from "./LazyImage";
import OrderPanel from "./OrderPanel";
import { Modal } from "./ui";

export default function QuickView({ product, onClose }: { product: Product | null; onClose: () => void }) {
  return (
    <Modal open={product !== null} onClose={onClose} label={product ? `Quick view: ${product.name}` : "Quick view"} wide>
      {product && (
        <div className="grid sm:grid-cols-2">
          <LazyImage
            src={product.numa_product_images[0]?.url ?? ""}
            alt={product.numa_product_images[0]?.alt ?? product.name}
            aspect="aspect-[4/5] sm:aspect-auto sm:h-full"
            priority
          />
          <div className="p-7 sm:p-9">
            <h2 className="font-serif text-3xl leading-tight">{product.name}</h2>
            <p className="mt-3 mb-6 text-[15px] font-light leading-relaxed text-soft line-clamp-3">{product.description}</p>
            <OrderPanel product={product} compact />
            <Link to={`/product/${product.slug}`} onClick={onClose} className="btn-ghost mt-4 w-full justify-center">
              View full details
            </Link>
          </div>
        </div>
      )}
    </Modal>
  );
}
