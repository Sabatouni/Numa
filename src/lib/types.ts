export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  active: boolean;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  type: "standard" | "featured" | "seasonal" | "limited" | "homepage";
  featured: boolean;
  active: boolean;
  sort_order: number;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt: string;
  sort_order: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string;
  color: string;
  color_hex: string;
  stock: number;
  sku: string | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  materials: string | null;
  care_instructions: string | null;
  price: number;
  compare_at_price: number | null;
  category_id: string | null;
  gender: "boys" | "girls" | "unisex";
  age_range: string;
  status: "active" | "draft" | "archived" | "scheduled";
  publish_at: string | null;
  featured: boolean;
  new_arrival: boolean;
  video_url: string | null;
  created_at: string;
  numa_product_images: ProductImage[];
  numa_product_variants: ProductVariant[];
}

export interface Review {
  id: string;
  product_id: string | null;
  author_name: string;
  rating: number;
  content: string;
  source: "instagram" | "whatsapp" | "site";
  approved: boolean;
  featured: boolean;
  created_at: string;
}

export interface JournalCategory {
  id: string;
  name: string;
  slug: string;
}

export interface JournalPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  category_id: string | null;
  featured: boolean;
  published: boolean;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  numa_journal_categories?: JournalCategory | null;
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string | null;
  cta_label: string | null;
  cta_link: string | null;
  image_url: string;
  sort_order: number;
  active: boolean;
}

export interface GalleryItem {
  id: string;
  title: string | null;
  media_url: string;
  type: "image" | "video";
  sort_order: number;
  active: boolean;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  label: string | null;
  sort_order: number;
  active: boolean;
}

export interface MediaItem {
  id: string;
  name: string;
  path: string;
  type: "image" | "video";
  folder: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  mime: string | null;
  created_at: string;
}

export interface OrderRow {
  id: string;
  product_id: string | null;
  product_name: string;
  size: string | null;
  color: string | null;
  quantity: number;
  price: number;
  customer_note: string | null;
  status: "new" | "contacted" | "completed" | "cancelled";
  created_at: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  active: boolean;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin" | "editor";
  created_at: string;
}

export interface SiteSettings {
  name: string;
  tagline: string;
  description: string;
  currency: string;
  currency_symbol: string;
}

export interface ContactSettings {
  whatsapp: string;
  whatsapp_display: string;
  phone: string;
  email: string;
  address: string;
  map_query: string;
  business_hours: { days: string; hours: string }[];
}

export interface PolicySettings {
  privacy: string;
  shipping: string;
  returns: string;
}

export interface AboutSettings {
  story: string;
  values: { title: string; text: string }[];
}
