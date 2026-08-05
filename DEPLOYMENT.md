# NUMA — Deployment Guide

Three steps: push to GitHub → confirm Supabase → deploy on Netlify. You perform the pushes and
deploys from your own accounts; everything in the project is already prepared for them.

---

## 1 · GitHub

The repo is initialised with one commit ("Initial production release") and a `.gitignore` that
excludes `node_modules`, `.env`, `dist`, `coverage`, `.vscode`, and `.DS_Store` — so your secrets
and build artifacts never reach GitHub.

Create an empty repository on github.com (no README/license — the project has them), then:

```bash
cd path/to/numa
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

If you ever need to re-initialise from scratch:

```bash
git init
git add .
git commit -m "Initial production release"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY
git push -u origin main
```

Verify: refresh the GitHub page — you should see the source tree, and **no** `.env`, `dist/` or
`node_modules/`.

---

## 2 · Supabase

The app is already wired to your existing project `nceyjgayttsaozfqiwtj` via `.env`. Everything
below was created and verified during QA — this is your confirmation checklist in the dashboard:

| Check | Where | Expect |
|---|---|---|
| Database tables | Table Editor | 19 tables prefixed `numa_` (products, categories, collections, variants, images, reviews, journal, media, settings, orders, faqs, hero_slides, gallery_items, social_links, profiles, …) |
| RLS enabled | Table Editor → each `numa_` table | Shield icon on; policies listed (public read of published content, admin-only writes) — 22/22 role-simulation tests passed in QA |
| Storage bucket | Storage | `numa-media`, public read; only admins can upload/modify (verified per-role) |
| Admin account | Authentication → Users | your admin email, confirmed |
| Admin profile | Table Editor → `numa_profiles` | one row matching that user — this is what grants studio access |
| Auth settings | Authentication → URL Configuration | after deploying, add your Netlify URL to **Site URL** and **Redirect URLs** (needed for password-reset emails to return to `/admin`) |

**Important:** change the initial admin password (Authentication → Users → … → Reset password),
and consider enabling leaked-password protection (Auth → Providers → Password).

Connecting a **different** Supabase project instead: run the four `numa_*` migrations
(Dashboard → Database → Migrations shows them in this project), create the `numa-media` bucket,
create your admin user + `numa_profiles` row, and point `.env` at the new project's URL and key.

---

## 3 · Netlify

`netlify.toml` is included and sets: build command `npm run build`, publish directory `dist`,
Node 22, SPA redirect (`/* → /index.html 200`), and long-cache headers for hashed assets.
`public/_redirects` provides the same redirect as a belt-and-braces backup.

1. **Connect** — Netlify → *Add new site* → *Import an existing project* → GitHub → pick your repo.
2. **Import** — Netlify reads `netlify.toml`; build command and publish dir are pre-filled. Don't change them.
3. **Environment variables** — Site configuration → Environment variables → add (values from your local `.env`):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SITE_URL` — your Netlify URL (or custom domain), e.g. `https://numa-baby.netlify.app`, no trailing slash
   - optionally the `VITE_WHATSAPP_NUMBER` / social fallbacks
4. **Deploy** — click *Deploy site*. First build takes ~1–2 min. Success = green "Published".
5. **Verify** — walk the checklist below. Then update `public/sitemap.xml` and `public/robots.txt`
   with your final domain, commit, push — Netlify redeploys automatically on every push to `main`.

---

## 4 · Post-deployment verification checklist

Open your live URL and check:

- [ ] Homepage loads with hero, collections, products, reviews, gallery
- [ ] Refresh on a deep link (e.g. `/shop`, `/product/organic-muslin-romper`) — no 404
- [ ] All images load (products, categories, hero, gallery)
- [ ] `/admin` shows the login screen; signing in reaches the dashboard
- [ ] Wrong password shows a friendly error; sign-out returns to login
- [ ] Password reset email arrives and returns you to `/admin` (requires step 2's Redirect URL)
- [ ] Admin: create a draft product, upload an image in Media Library, then delete both
- [ ] Product page → choose size/colour/quantity → **Order on WhatsApp** opens WhatsApp with the
      full message (test once on desktop and once on a phone)
- [ ] The order intent appears in Admin → Orders
- [ ] Reviews page → *Leave a review* → both Instagram DM and WhatsApp options open correctly
- [ ] Footer social icons open the right profiles in new tabs
- [ ] Contact form submits; message appears for the admin
- [ ] Newsletter signup shows "Joined ✓"
- [ ] Browser DevTools → Console: no errors on home, shop, product, admin
- [ ] DevTools → Network: no failed (red) requests
- [ ] Phone check: browse home/shop/product at real mobile width — no horizontal scrolling
- [ ] Run Lighthouse (DevTools → Lighthouse → Analyze) on the deployed URL — targets 90+ across
      Performance / Accessibility / Best Practices / SEO

---

## Production checklist

- ✅ Project runs locally (`npm run dev`)
- ✅ 33/33 automated tests pass (`npm test`)
- ✅ Zero lint errors/warnings (`npm run lint`)
- ✅ Production build succeeds with zero warnings (`npm run build`)
- ✅ GitHub ready (repo initialised, secrets git-ignored)
- ✅ Supabase connected (schema, RLS, storage, admin verified against the live project)
- ✅ Netlify ready (netlify.toml, SPA redirects, env template)
- ⬜ You: push to GitHub, set Netlify env vars, deploy, walk the verification checklist
- ⬜ You: change the admin password, set real domain in sitemap/robots/`VITE_SITE_URL`
