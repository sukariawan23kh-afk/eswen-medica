# Task 15 — Special Offers / Image Upload / Admin Notifications (Recreate lost files)

**Agent:** full-stack-developer (Z.ai Code)
**Task ID:** 15
**Date:** 2026-10-06

## Goal
Recreate the Special Offer popups, image upload, and admin notification files lost during the sandbox reset. Also integrate ImageUpload across the admin tabs (Articles, Services, Doctors, Site Settings), add an Offers tab + a notification bell to the admin panel, and wire up `<OfferPopup />` on the public site.

## What I Did

### New API routes (all `runtime = "nodejs"`, `dynamic = "force-dynamic"`)
1. **`src/app/api/offers/route.ts`** — Public GET. Calls `ensureSiteSeeded()`, filters `active=true` + `(startAt null or <= now)` + `(endAt null or >= now)`, orders by `priority desc, createdAt desc`, takes 10. Returns `{ ok, offers:[{ id, title:{en,id}, description:{en,id}, offerType, badge, imageUrl, ctaText:{en,id}, ctaLink, priority }] }`.
2. **`src/app/api/admin/offers/route.ts`** — Admin GET (all incl. inactive, priority desc) + POST (zod-validated create). Returns full admin shape incl. `startAt/endAt` as ISO date or `""`.
3. **`src/app/api/admin/offers/[id]/route.ts`** — Admin PUT (zod-validated, all fields optional incl. startAt/endAt conversion) + DELETE.
4. **`src/app/api/admin/notifications/route.ts`** — Admin GET `?since=ISO`. Pulls latest 8 bookings + 5 articles, formats each as `{ kind, id, title, detail, createdAt }`, sorts by createdAt desc, takes 13. Returns `{ ok, items, unread, serverTime }`. `unread` = count of items with `createdAt > since`.
5. **`src/app/api/admin/upload/route.ts`** — Admin POST multipart form `file`. Validates image-only (png/jpg/jpeg/gif/webp/svg) + max 5MB. Saves to `public/images/uploads/${ts}-${rand6}.${ext}` via `fs/promises` + `mkdir({recursive:true})`. Returns `{ ok, url, filename, size }`.

### New components ("use client")
6. **`src/components/eswen/offer-popup.tsx`** — Public popup. Fetches `/api/offers`, picks the highest-priority offer not yet seen in its cooldown window (`daily=24h, weekly=7d, monthly=30d, one_time=∞`) using localStorage key `eswen_offer_seen_${id}`. Shows modal ~800ms after load via framer-motion AnimatePresence. **CRITICAL:** the `isSeen` function uses `cooldownMs` (NOT `window`) as the local var to avoid TDZ ReferenceError. Suppresses when `location.hash === "#admin"`. Card: image header w/ badge + offerType label, title, desc, CTA button (scrolls to ctaLink), "Maybe later" button. Bilingual text via `useLanguage`.
7. **`src/components/eswen/admin/offers-tab.tsx`** — Admin Offers CRUD tab. Card grid (badge, offerType label, Active/Off, title, desc, priority, CTA, image thumb) + "Add Offer" + editor modal (titleEn/Id, descEn/Id, offerType select, badge, priority, ctaTextEn/Id, ctaLink, imageUrl via ImageUpload, startAt/endAt datetime-local, active toggle). Save → POST or PUT `/api/admin/offers`. Delete → DELETE. Pattern matches services-tab.
8. **`src/components/eswen/admin/image-upload.tsx`** — Reusable control. Thumbnail preview (img or ImageIcon fallback), URL text input, Upload button (hidden file input → POST `/api/admin/upload` → `onChange(url)`), Clear button. Loading + error states. `cn` from `@/lib/utils`. Includes its own `ainput` style block (re-uses the Eswen input look).

### Integration edits
9. **`src/app/page.tsx`** — Imported `OfferPopup` and rendered `<OfferPopup />` after `<AdminPanel />` inside the main div.
10. **`src/components/eswen/admin-panel.tsx`** (the big edit):
    - Imported `OffersTab`, `ImageUpload`, plus `Bell, Gift` from lucide-react.
    - Added `"offers"` to the `tab` state type.
    - Added notification state: `notifItems`, `notifUnread`, `bellOpen`, `lastSeenKey = "eswen_admin_notif_seen"`.
    - Added `loadNotifs` (fetch `/api/admin/notifications?since=localStorage.lastSeen`), `markNotifsSeen` (set localStorage lastSeen + `setNotifUnread(0)`), and a useEffect that loads on open+authed and refreshes every 30s; a second useEffect closes the bell dropdown when the panel closes.
    - Added a Bell button to the admin header (before Logout) with a rose unread-count badge and a dropdown listing recent bookings/articles (CalendarClock / FileText icons, title, detail, timestamp) + a "Mark all read" action.
    - Added the Offers tab button (Gift icon) between Doctors and Articles.
    - Added `{tab === "offers" && <OffersTab showToast={showToast} />}` in the tab content.
    - Replaced the ArticleEditor's imageUrl text input with `<ImageUpload value={form.imageUrl} onChange={(v) => set("imageUrl", v)} />`.
11. **`src/components/eswen/admin/site-settings-tab.tsx`** — Imported `ImageUpload` and replaced the entire Logo & Brand preview+input row with a single `<ImageUpload>` (label="Logo Image", previewClass="h-14 w-14 rounded-2xl"); kept helper text.
12. **`src/components/eswen/admin/services-tab.tsx`** — Imported `ImageUpload`; removed the in-grid "Image URL" text field and added `<F label="Image"><ImageUpload value={f.image} onChange={(v) => set("image", v)} /></F>` below the icon grid.
13. **`src/components/eswen/admin/doctors-tab.tsx`** — Imported `ImageUpload`; replaced the Photo URL text input with `<F label="Photo"><ImageUpload value={f.image} onChange={(v) => set("image", v)} /></F>`.

### Additional maintenance fix
- **`src/lib/db.ts`** — Hardened the dev-mode Prisma client cache. The dev server held a stale `PrismaClient` instance from before `prisma generate` had run on the `SpecialOffer` model — `db.specialOffer` was `undefined` and the route crashed with "Cannot read properties of undefined (reading 'count')". Added a `prismaClientKey` version stamp AND an explicit `typeof cached.specialOffer !== 'undefined'` check; if either fails, a fresh `PrismaClient` is created. Bumped version to `v-specialoffer-2`.

### Dev server restart
The original dev-server process got killed while I was investigating the stale-client issue (I killed `next-server` to try to force a reload, and the parent `bun run dev` exited with it). Restarted it with `(nohup setsid bash -c 'cd … && exec bun run dev' </dev/null >…/dev.log 2>&1 &)` so the `bun run dev` process reparents to init (PID 1) and survives my shell session exiting. The dev.log now shows the seeded offers + 200s across all the new endpoints.

## Verification

### Lint
`bun run lint` — 0 errors, 0 warnings.

### API smoke tests (via curl)
- `GET /api/offers` (public) → `200` with 3 seeded offers (priority desc: weekly 30 → daily 20 → monthly 10).
- `GET /api/admin/offers` (admin) → `401` without cookie; `200` with cookie, returns full admin shape incl. `startAt:""`, `endAt:""`.
- `POST /api/admin/offers` → `401` unauthed; `200` with `{ ok, offer:{ id } }` when authed + valid body; `400` on validation failure.
- `PUT /api/admin/offers/[id]` → `200` with `{ ok, offer:{ id } }`; correctly handles `startAt/endAt` ISO conversion + null.
- `DELETE /api/admin/offers/[id]` → `200` with `{ ok:true }`.
- `GET /api/admin/notifications?since=…` → `200` with merged bookings+articles sorted by `createdAt` desc, `unread` count computed from `since`.
- `POST /api/admin/upload` (multipart form, field "file") → `200` returns `{ ok, url:"/images/uploads/<ts>-<rand>.<ext>", filename, size }`; saved file accessible at the URL; rejects non-image MIME with `400 "Unsupported file type…"`; rejects 6MB file with `400 "File too large. Max 5MB."`.
- All admin endpoints return `401 { ok:false, error:"Unauthorized." }` without the admin cookie.

### Dev server (post-restart)
- `/api/offers` and `/api/site-config` both return `200`.
- OfferPopup will fetch on mount and pop the highest-priority unseen offer; `#admin` hash suppresses the popup so it doesn't cover the admin panel.
- Admin panel now has 6 tabs: Site Settings · Services · Doctors · **Offers** (new) · Articles · Bookings, plus a Bell button in the header with unread count + recent activity dropdown refreshing every 30s.

## Files Touched (summary)
**Created (8):**
- `src/app/api/offers/route.ts`
- `src/app/api/admin/offers/route.ts`
- `src/app/api/admin/offers/[id]/route.ts`
- `src/app/api/admin/notifications/route.ts`
- `src/app/api/admin/upload/route.ts`
- `src/components/eswen/offer-popup.tsx`
- `src/components/eswen/admin/offers-tab.tsx`
- `src/components/eswen/admin/image-upload.tsx`

**Edited (6):**
- `src/app/page.tsx` (added `<OfferPopup />`)
- `src/components/eswen/admin-panel.tsx` (Offers tab + bell + ImageUpload in ArticleEditor)
- `src/components/eswen/admin/site-settings-tab.tsx` (ImageUpload for logo)
- `src/components/eswen/admin/services-tab.tsx` (ImageUpload for service image)
- `src/components/eswen/admin/doctors-tab.tsx` (ImageUpload for doctor photo)
- `src/lib/db.ts` (hardened dev-mode PrismaClient cache so `db.specialOffer` is always present after `prisma generate`)

## Issues / Notes
- The `src/lib/db.ts` edit was not in the original task list but was required to fix a real bug — the dev server's `globalThis.prisma` was a stale instance from before `prisma generate` regenerated the `@prisma/client` with the `SpecialOffer` model. This caused `db.specialOffer` to be `undefined`, breaking both `/api/offers` AND `/api/site-config` (which calls `ensureSiteSeeded()` → `db.specialOffer.count()`).
- The dev server was killed and restarted during the investigation; it now runs detached via `setsid + exec` so the parent PID is init and the process survives shell exit. Future `prisma generate` calls will invalidate the cache via the `prismaClientKey` stamp.
