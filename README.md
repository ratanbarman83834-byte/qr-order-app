# QR Code Ordering — real working app

A mobile-first product ordering system for a shop or café. A customer scans a
QR code, browses the menu, builds a cart, and places an order. The order is
saved to a real database, the price is verified on the server (never trusted
from the browser), and the owner gets a real push notification plus a live
dashboard.

This is a working application, not a static UI mockup — every button is
wired to a real Firestore database and a real Cloud Function.

## 1. Features

**Customer**
- Scan QR → shop menu at `/shop/:shopId`, no app install needed
- Category filter, search, product cards with live quantity steppers
- Sticky cart bar + cart drawer, totals update instantly
- Checkout form (name, phone, table/order number, notes)
- Order confirmation + a live status-tracking page that updates in real time
  as the owner changes the order's status

**Owner / admin** (`/admin`)
- Email/password login (Firebase Authentication)
- Dashboard: today's order count, sales, pending/completed counts
- Real-time order list with status changer (New → Accepted → Preparing →
  Ready → Completed, or Cancelled)
- Product management: add/edit/delete, price, category, image upload,
  available/unavailable toggle
- QR code page: view, copy link, download PNG

**Backend**
- Firestore for shops/products/orders, live-synced everywhere with
  `onSnapshot`
- A Cloud Function (`createOrder`) is the *only* way an order gets written.
  It re-reads each product's price from the database and computes the total
  itself — a customer editing devtools cannot change what they're charged.
- A second Cloud Function (`onOrderCreated`) fires automatically on every new
  order and sends a real Firebase Cloud Messaging push to the owner's phone
  or browser.
- Firestore + Storage security rules enforce all of the above at the
  database level too, not just in application code.

## 2. Tech stack

- **Frontend:** React 18, Vite, React Router, Tailwind CSS
- **Backend:** Firebase — Firestore, Authentication, Storage, Cloud
  Functions (Node 20), Cloud Messaging (FCM)

If you'd prefer a different backend later (e.g. Postgres + a Node/Express
API), the parts to swap are `src/firebase/*` and `src/services/*` — the UI
layer doesn't know how data is fetched.

## 3. Project structure

```
src/
  components/       reusable UI (ProductCard, CartDrawer, admin/*)
  pages/            route-level screens (customer + admin/*)
  layouts/          route wrappers (CustomerLayout, AdminLayout, ShopCartLayout)
  hooks/            useProducts, useOrders, useOwnerShop
  services/         Firestore/Functions calls (shopService, productService, orderService)
  firebase/         Firebase app init + FCM registration
  context/          AuthContext, CartContext
  utils/            formatCurrency, formatTime
functions/          Cloud Functions (createOrder, onOrderCreated)
scripts/            seedDemoData.mjs, injectSwEnv.mjs
public/
  firebase-messaging-sw.js   background push handler
```

## 4. Firebase project setup

1. Go to the [Firebase console](https://console.firebase.google.com) →
   Create a project.
2. **Add a web app** (`</>` icon) to the project. Copy the config values
   shown — you'll paste these into `.env` in step 6.
3. **Authentication** → Sign-in method → enable **Email/Password**.
4. **Authentication** → Users → Add user → create the owner's login (email +
   password). Copy the generated **User UID**; you'll need it to link the
   owner to their shop.
5. **Firestore Database** → Create database → start in production mode
   (the rules in this repo replace the default-deny with the real rules
   below).
6. **Storage** → Get started (for product images).
7. **Cloud Messaging** → in the "Web configuration" tab, click **Generate
   key pair** to get your VAPID key.

## 5. Environment variables

```
cp .env.example .env
```

Fill in every `VITE_FIREBASE_*` value from step 2, and
`VITE_FIREBASE_VAPID_KEY` from step 7. These are client-visible identifiers,
not secrets — real access control comes from the security rules below, not
from hiding these values.

## 6. Install and deploy security rules + functions

```
npm install
npm install -g firebase-tools   # if you don't have it
firebase login
firebase use --add              # pick your Firebase project

firebase deploy --only firestore:rules,storage:rules
cd functions && npm install && cd ..
firebase deploy --only functions
```

The Firestore rules (`firestore.rules`) do the heavy lifting for security:
- Anyone can *read* shops/products (that's the public menu).
- Only the authenticated shop owner can write products or change their shop.
- **Orders can never be created directly from the client** — only the
  `createOrder` Cloud Function (using the Admin SDK, which bypasses rules)
  can write one. This is what stops a customer from posting a fake order or
  a manipulated price straight to the database.
- A customer can read one order by its ID (needed for the tracking page)
  but can't list all orders; only the shop owner can do that.

## 7. Seed demo data

1. Project settings → Service accounts → **Generate new private key** → save
   the downloaded file as `serviceAccountKey.json` in the project root (this
   is gitignored).
2. Run:
   ```
   OWNER_UID=<the UID from step 4.4 above> npm run seed
   ```
3. This creates one demo shop ("The Corner Cafe") with 9 products (Burger,
   Pizza, Cold Coffee, French Fries, Sandwich, Momos, Tea, Fresh Lime,
   Brownie) and prints the shop's menu URL, e.g. `/shop/AbC123xyz`.

## 8. Run locally

```
npm run dev
```

- Customer menu: `http://localhost:5173/shop/<shopId>` (the ID printed by
  the seed script)
- Owner login: `http://localhost:5173/admin/login`

## 9. How the ordering flow actually works

```
Customer scans QR → GET /shop/:shopId
  → ShopPage subscribes to Firestore products (onSnapshot, live)
  → adds items → CartContext holds { productId, name, price, quantity }
  → Checkout → orderService.placeOrder() calls the "createOrder" Cloud Function
      → Function re-reads each product's CURRENT price from Firestore
      → checks each product is still available
      → computes subtotal/total itself (client-sent prices are ignored)
      → writes one document to /orders
  → onOrderCreated Cloud Function triggers automatically
      → looks up the shop's ownerUid → looks up their FCM device tokens
      → sends a real push notification: "New order · ORD123456"
  → Customer is redirected to /shop/:shopId/order/:orderId
      → subscribes live to that order document — status updates appear
        instantly whenever the owner changes it in the dashboard
  → Owner's /admin/orders also subscribes live to all of the shop's orders
      → changing the status dropdown does one Firestore update, which the
        customer's tracking page above receives in real time
```

## 10. How owner notifications work (and the fallback)

On first login, the dashboard asks the browser for notification permission
and registers a device token in `/ownerDevices/{ownerUid}`. When an order is
created, `onOrderCreated` sends a push to every registered token.

**If push notifications aren't available** — permission denied, or the
browser doesn't support them (e.g. iOS Safari has partial/limited support
depending on version and whether the site is installed to the home screen) —
the app does **not** pretend to have sent one. Instead:
- The dashboard shows a banner explaining the limitation.
- New orders still appear instantly in `/admin/orders` and `/admin` via the
  live Firestore subscription — you just won't get a phone buzz for it, so
  keep the dashboard tab open (or add it to your home screen) as a fallback.

No SMS/WhatsApp notifications are implemented. Wiring those up would mean
integrating a real provider (e.g. Twilio, or the WhatsApp Cloud API) inside
`onOrderCreated` — the trigger point already exists, but no such service is
connected in this codebase, and none is claimed.

## 11. Generating & using the QR code

`/admin/qr` shows a live QR code encoding your shop's menu URL
(`https://yourdomain.com/shop/<shopId>`), plus buttons to copy the link or
download it as a PNG to print. Since the shop ID doesn't change, there's
nothing to "regenerate" — the same code always works. If you want a QR code
per table, encode `/shop/<shopId>?table=5` and read `?table=` on the
checkout page to prefill the table number field (the `tableNumber` field
already exists in the order schema for this).

## 12. Data model

```
shops/{shopId}
  name, address, logo, ownerUid, createdAt

products/{productId}
  shopId, name, description, price, image, category, available, createdAt

orders/{orderId}
  shopId, orderCode, customerName, customerPhone, tableNumber, notes,
  items: [{ productId, productName, priceAtPurchase, quantity, subtotal }],
  subtotal, total, status, createdAt, statusUpdatedAt

ownerDevices/{ownerUid}
  tokens: [FCM device tokens]
```

`priceAtPurchase` is captured at order time by the Cloud Function, so
changing a product's price later never rewrites historical orders.

## 13. Deployment

**Frontend (Firebase Hosting):**
```
npm run build
firebase deploy --only hosting
```
`firebase.json` is already set up to serve `dist/` with SPA rewrites so
client-side routing works on refresh.

**Functions:** already covered in step 6 (`firebase deploy --only functions`).
Redeploy functions any time you change `functions/index.js`.

Any static host (Vercel, Netlify, Cloudflare Pages) works too for the
frontend — just make sure it serves `index.html` for all unmatched routes,
and that `public/firebase-messaging-sw.js` (with its placeholders replaced,
which `npm run build` does automatically) ends up at your deployed site's
root, not nested under `/assets`.

## 14. Scaling this later

The schema and rules were designed with these in mind:
- **Multiple shops / per-table QR codes:** `shops` and `orders` already
  carry `shopId`/`tableNumber`; `useOwnerShop` currently assumes one shop per
  owner — swap it for a shop-switcher once an owner manages more than one.
- **Online payment:** add a `paymentStatus` field to `orders` and a payment
  step between checkout and `createOrder`, or extend `createOrder` to create
  a payment intent first.
- **Sales reports / order history:** all order data is already in Firestore
  with `createdAt` — add a reporting page that queries by date range.
- **WhatsApp/SMS:** add the provider call inside `onOrderCreated`, next to
  the existing FCM send.

## 15. Known limitations (be upfront about these)

- One shop per owner in the current admin UI (see above).
- iOS Safari push notification support depends on the OS/browser version
  and whether the site is installed to the home screen — the dashboard
  fallback (live in-app order list) covers this case.
- No payment processing — orders are "pay at counter" style, matching the
  original brief.
