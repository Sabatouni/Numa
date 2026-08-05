# NUMA — Baby Essentials

A luxury baby & kids clothing storefront with WhatsApp ordering and a full admin studio.
Calm, warm, and minimal — inspired by Zanzibar, built for little ones.

## Tech stack

React 19 · Vite 7 · TypeScript · Tailwind CSS · Framer Motion · React Router 7 · Supabase
(database, auth, storage) · Vitest (33-test QA suite) · ESLint (zero-warning policy)

## Folder structure

```
numa/
├── public/              # favicon, robots.txt, sitemap.xml, _redirects
├── src/
│   ├── components/      # shared UI (header, footer, product cards, modals, icons…)
│   │   └── admin/       # admin-only building blocks (uploader, rich text, tables)
│   ├── context/         # StoreContext: settings, socials, wishlist
│   ├── lib/             # supabase client, types, formatting, WhatsApp links, media
│   ├── pages/           # one file per storefront page
│   │   └── admin/       # the admin studio (/admin)
│   └── test/            # automated QA suite
├── netlify.toml         # Netlify build + SPA redirects
├── .env.example         # environment variable template (documented)
├── DEPLOYMENT.md        # step-by-step GitHub / Supabase / Netlify guide
└── QA-REPORT.md         # full QA & production readiness report
```

## Running it locally (beginner friendly)

**1. Install Node.js** — download the LTS version from https://nodejs.org (v20 or newer).
   Verify by opening a terminal and typing `node -v` — you should see a version number.

**2. Open a terminal and go to the project folder:**

```bash
cd path/to/numa
```

**3. Install dependencies** (one time, needs internet):

```bash
npm install
```

Success looks like: `added ~350 packages in 30s` with no red `ERR!` lines.

**4. Add your environment file.** Copy `.env.example` to a new file called `.env` and fill in
the values (see the Environment variables section below). If you received this project with a
`.env` already present, you can skip this step.

**5. Start the development server:**

```bash
npm run dev
```

Success looks like:

```
  VITE v7.x  ready in 400 ms
  ➜  Local:   http://localhost:5173/
```

Open that address in your browser. The storefront should load with products.
The admin studio is at http://localhost:5173/admin

**6. Run the test suite:**

```bash
npm test
```

Success looks like: `Test Files  2 passed (2)` and `Tests  33 passed (33)`.

**7. Check code quality:**

```bash
npm run lint
```

Success looks like: no output at all (zero errors, zero warnings).

**8. Build for production:**

```bash
npm run build
```

Success looks like: `✓ built in ~2s` with a list of files under `dist/`. No warnings.

**9. Preview the production build:**

```bash
npm run preview
```

Opens the built site at http://localhost:4173 — this is exactly what production serves.

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | ✅ | Your Supabase project URL (Dashboard → Settings → API). |
| `VITE_SUPABASE_ANON_KEY` | ✅ | The publishable API key. Safe in the browser — Row Level Security governs every read/write. |
| `VITE_SITE_URL` | ✅ | Your deployed domain. Used in canonical/OG tags and the product link inside WhatsApp order messages. |
| `VITE_WHATSAPP_NUMBER` | optional | Fallback WhatsApp number (digits with country code) used until you set one in Admin → Settings. Database value always wins. |
| `VITE_INSTAGRAM` … `VITE_YOUTUBE` | optional | Fallback social URLs used until links exist in Admin → Social Links. Database values always win. |

Never commit `.env` — it is git-ignored. Only `.env.example` (empty values) belongs in the repo.

## Admin studio

Sign in at `/admin` with your admin email and password.
**ADMIN_EMAIL / ADMIN_PASSWORD placeholders:** set these up in Supabase → Authentication → Users,
and make sure the user has a matching row in the `numa_profiles` table. Forgot password? Use the
link on the sign-in screen — a reset email returns you to `/admin` to choose a new password.

From the studio you can manage: products (variants, images, scheduling, bulk actions), categories,
collections, media library (drag & drop, auto WebP compression/resizing, rename/replace/delete),
orders, reviews, journal, hero slides, homepage gallery, social links, and every site setting
including the WhatsApp ordering number and policy text.

## How ordering works

No checkout, no payments online. Every product has **Order on WhatsApp**: it logs an order intent
(visible in Admin → Orders) and opens WhatsApp with a pre-filled message — product, size, colour,
quantity, price, link, and the customer's note. You confirm delivery and payment in the chat.

## Deployment

See **DEPLOYMENT.md** for the complete GitHub → Supabase → Netlify walkthrough with verification
checklists.

## Troubleshooting

**Blank page or spinner forever** — `.env` is missing or has wrong Supabase values. Copy
`.env.example` → `.env`, fill it in, restart `npm run dev`.

**"Sign-in failed" in admin** — the email/password is wrong, or the user has no row in
`numa_profiles`. Users without a profile row are signed out automatically by design.

**Products/pages load but admin data is empty** — you're signed in with a user that isn't in
`numa_profiles`. Add the row in Supabase → Table Editor → `numa_profiles`.

**Uploads fail in the media library** — check you're signed in as an admin, and that the
`numa-media` storage bucket exists (Dashboard → Storage). Only admins can write to it.

**404 on page refresh after deploying** — your host isn't redirecting all routes to
`index.html`. On Netlify this is handled by `netlify.toml` and `public/_redirects`; make sure
they deployed with the site.

**`npm install` fails** — make sure Node is v20+ (`node -v`), then delete `node_modules` and
`package-lock.json` and run `npm install` again.

## FAQ

**Can I change the currency?** Yes — Admin → Settings → Brand (code and symbol).

**How do I add another admin?** Supabase → Authentication → Users → Add user, then insert a row
with that user's id/email into `numa_profiles`.

**Where do reviews come from?** Customers pick Instagram DM or WhatsApp in the review popup; you
paste the review into Admin → Reviews, approve it, and optionally feature it on the homepage.

**How do I replace the placeholder photos?** Upload real photos in Admin → Media Library, then
set them on products, categories, collections, hero slides, and the gallery.
