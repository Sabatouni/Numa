import { useState } from "react";

interface Props {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  aspect?: string;
  priority?: boolean;
  sizes?: string;
}

function srcSetFor(src: string): string | undefined {
  if (!src.includes("images.unsplash.com")) return undefined;
  const base = src.replace(/([?&])w=\d+/, "$1w=__W__");
  if (!base.includes("w=__W__")) return undefined;
  return [480, 768, 1200, 1800].map((w) => `${base.replace("w=__W__", String(w))} ${w}w`).join(", ");
}

export default function LazyImage({ src, alt, className = "", imgClassName = "", aspect = "aspect-[4/5]", priority = false, sizes = "(max-width: 768px) 100vw, 50vw" }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const srcSet = srcSetFor(src);

  return (
    <div className={`relative overflow-hidden bg-linen ${aspect} ${className}`}>
      {!error ? (
        <img
          src={src}
          srcSet={srcSet}
          sizes={srcSet ? sizes : undefined}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          fetchPriority={priority ? "high" : undefined}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-soft ${loaded ? "opacity-100" : "opacity-0"} ${imgClassName}`}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-soft/50 text-xs uppercase tracking-widest">Numa</div>
      )}
    </div>
  );
}
