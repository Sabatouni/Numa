const img = (n: number) => `https://images.example/photo-${n}.jpg`;

export const categories = [
  { id: "c1", name: "Baby", slug: "baby", description: "Everyday essentials", image_url: img(1), sort_order: 1, active: true },
  { id: "c2", name: "Newborn", slug: "newborn", description: "First days", image_url: img(2), sort_order: 2, active: true },
];

export const collections = [
  { id: "col1", name: "Safari Collection", slug: "safari", description: "Earth tones", image_url: img(3), type: "featured", featured: true, active: true, sort_order: 1 },
  { id: "col2", name: "Kendwa Summer", slug: "kendwa-summer", description: "Breezy muslin", image_url: img(4), type: "seasonal", featured: true, active: true, sort_order: 2 },
];

export const products = [
  {
    id: "p1", name: "Organic Muslin Romper", slug: "organic-muslin-romper",
    description: "A featherlight romper in organic muslin.", materials: "100% organic cotton",
    care_instructions: "Machine wash cold.", price: 48000, compare_at_price: 58000,
    category_id: "c1", gender: "unisex", age_range: "0-12m", status: "active", publish_at: null,
    featured: true, new_arrival: true, video_url: null, created_at: "2026-07-01T00:00:00Z",
    numa_product_images: [
      { id: "i1", product_id: "p1", url: img(10), alt: "Romper flat lay", sort_order: 0 },
      { id: "i2", product_id: "p1", url: img(11), alt: "Romper detail", sort_order: 1 },
    ],
    numa_product_variants: [
      { id: "v1", product_id: "p1", size: "0-3m", color: "Ivory", color_hex: "#f2ece1", stock: 8, sku: null },
      { id: "v2", product_id: "p1", size: "3-6m", color: "Ivory", color_hex: "#f2ece1", stock: 0, sku: null },
      { id: "v3", product_id: "p1", size: "0-3m", color: "Sand", color_hex: "#d9c9ad", stock: 5, sku: null },
    ],
  },
  {
    id: "p2", name: "Heirloom Knit Blanket", slug: "heirloom-knit-blanket",
    description: "A chunky heirloom blanket.", materials: "Organic cotton", care_instructions: "Hand wash.",
    price: 88000, compare_at_price: null, category_id: "c1", gender: "unisex", age_range: "0-36m",
    status: "active", publish_at: null, featured: true, new_arrival: false, video_url: null,
    created_at: "2026-07-02T00:00:00Z",
    numa_product_images: [{ id: "i3", product_id: "p2", url: img(12), alt: "Knit blanket", sort_order: 0 }],
    numa_product_variants: [{ id: "v4", product_id: "p2", size: "One size", color: "Taupe", color_hex: "#b3a48d", stock: 4, sku: null }],
  },
];

export const reviews = [
  { id: "r1", product_id: "p1", author_name: "Amina K.", rating: 5, content: "Unbelievably soft.", source: "instagram", approved: true, featured: true, created_at: "2026-07-10T00:00:00Z" },
  { id: "r2", product_id: null, author_name: "Grace T.", rating: 5, content: "Beautifully wrapped.", source: "whatsapp", approved: true, featured: true, created_at: "2026-07-11T00:00:00Z" },
];

export const journalCategories = [{ id: "jc1", name: "Care Guides", slug: "care-guides" }];

export const journalPosts = [
  {
    id: "j1", title: "How to care for organic muslin", slug: "care-for-organic-muslin",
    excerpt: "Muslin gets softer with every wash.", content: "<p>Wash cold on gentle.</p>",
    cover_image: img(20), category_id: "jc1", featured: true, published: true,
    published_at: "2026-07-05T00:00:00Z", seo_title: null, seo_description: null,
    created_at: "2026-07-05T00:00:00Z", numa_journal_categories: journalCategories[0],
  },
];

export const heroSlides = [
  { id: "h1", title: "Timeless essentials for little adventures", subtitle: "Inspired by Zanzibar.", cta_label: "Shop the collection", cta_link: "/shop", image_url: img(30), sort_order: 1, active: true },
];

export const galleryItems = [
  { id: "g1", title: "Muslin mornings", media_url: img(40), type: "image", sort_order: 1, active: true },
  { id: "g2", title: null, media_url: img(41), type: "image", sort_order: 2, active: true },
];

export const socialLinks = [
  { id: "s1", platform: "instagram", url: "https://instagram.com/numa.baby", label: "Instagram", sort_order: 1, active: true },
  { id: "s2", platform: "facebook", url: "https://facebook.com/numa.baby", label: "Facebook", sort_order: 2, active: true },
  { id: "s3", platform: "tiktok", url: "https://tiktok.com/@numa.baby", label: "TikTok", sort_order: 3, active: true },
  { id: "s4", platform: "pinterest", url: "https://pinterest.com/numababy", label: "Pinterest", sort_order: 4, active: true },
  { id: "s5", platform: "threads", url: "https://threads.net/@numa.baby", label: "Threads", sort_order: 5, active: true },
  { id: "s6", platform: "youtube", url: "https://youtube.com/@numababy", label: "YouTube", sort_order: 6, active: true },
];

export const faqs = [
  { id: "f1", question: "How do I place an order?", answer: "Use the WhatsApp button on any product.", sort_order: 1, active: true },
];

export const settings = [
  { key: "site", value: { name: "Numa", tagline: "Baby Essentials", description: "Timeless baby essentials.", currency: "TZS", currency_symbol: "TSh" } },
  { key: "contact", value: { whatsapp: "255700000000", whatsapp_display: "+255 700 000 000", phone: "+255 700 000 000", email: "hello@numa.family", address: "Stone Town, Zanzibar", map_query: "Stone Town, Zanzibar", business_hours: [{ days: "Mon–Sat", hours: "9:00–18:00" }] } },
  { key: "policies", value: { privacy: "Privacy text.\n\nSecond paragraph.", shipping: "Shipping text.", returns: "Returns text." } },
  { key: "about", value: { story: "Numa began in Stone Town.\n\nSecond paragraph.", values: [{ title: "Natural Fabrics", text: "Soft and breathable." }] } },
];

export const orders = [
  {
    id: "o1", product_id: "p1", product_name: "Organic Muslin Romper", size: "0-3m", color: "Ivory",
    quantity: 1, price: 48000, customer_note: null, status: "new", created_at: "2026-07-20T00:00:00Z",
    customer_name: null, customer_whatsapp: null, customer_mobile: null, customer_email: null,
    order_number: null, tracking_token: null, whatsapp_message: null,
  },
  {
    id: "o2", product_id: "p2", product_name: "Heirloom Knit Blanket", size: "One size", color: "Taupe",
    quantity: 1, price: 88000, customer_note: "Please gift wrap", status: "contacted", created_at: "2026-07-21T00:00:00Z",
    customer_name: "Grace Temba", customer_whatsapp: "255712345678", customer_mobile: "255798765432",
    customer_email: "grace@example.com", order_number: "NUMA-260721-TRACK1",
    tracking_token: "track-token-o2", whatsapp_message: "NUMA — ORDER REQUEST...",
  },
];

export const profiles = [
  { id: "admin-1", email: "admin@numa.family", full_name: "Admin", role: "admin", created_at: "2026-07-01T00:00:00Z" },
];

export const media = [
  { id: "m1", name: "romper.jpg", path: "products/romper.webp", type: "image", folder: "products", size_bytes: 12345, width: 1200, height: 1500, mime: "image/webp", created_at: "2026-07-01T00:00:00Z" },
];

export const tables: Record<string, object[]> = {
  numa_categories: categories,
  numa_collections: collections,
  numa_products: products,
  numa_reviews: reviews,
  numa_journal_categories: journalCategories,
  numa_journal_posts: journalPosts,
  numa_hero_slides: heroSlides,
  numa_gallery_items: galleryItems,
  numa_social_links: socialLinks,
  numa_faqs: faqs,
  numa_settings: settings,
  numa_orders: orders,
  numa_profiles: profiles,
  numa_media: media,
  numa_product_collections: [{ product_id: "p1", collection_id: "col1" }],
  numa_newsletter_subscribers: [],
  numa_contact_messages: [],
};
