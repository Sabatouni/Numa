import { useLocation } from "react-router-dom";

interface Props {
  title: string;
  description?: string;
  image?: string;
  type?: string;
  jsonLd?: object;
}

const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined) ?? "https://numa.family";

export default function Seo({ title, description, image, type = "website", jsonLd }: Props) {
  const { pathname } = useLocation();
  const url = `${SITE_URL}${pathname}`;
  const desc = description ?? "Timeless baby & kids essentials in natural fabrics. Inspired by Zanzibar, made for little ones everywhere.";
  const img = image ?? "https://images.unsplash.com/photo-1522771930-78848d9293e8?q=80&w=1200&auto=format&fit=crop";
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Numa Baby Essentials" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={img} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={img} />
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </>
  );
}
