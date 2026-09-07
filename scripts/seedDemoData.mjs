/**
 * Seeds one demo shop with realistic products so you can test the full
 * ordering flow immediately after setup.
 *
 * Usage:
 *   1. Create an owner account: Firebase Console → Authentication → Add user
 *      (email + password). Copy that user's UID.
 *   2. Download a service account key: Project settings → Service accounts
 *      → Generate new private key → save as ./serviceAccountKey.json
 *      (already gitignored).
 *   3. Run: OWNER_UID=<paste-uid-here> node scripts/seedDemoData.mjs
 *
 * This uses the Admin SDK, so it bypasses Firestore security rules — that's
 * expected and safe for a one-off setup script run by you, the developer,
 * not by end users.
 */
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";

const ownerUid = process.env.OWNER_UID;
if (!ownerUid) {
  console.error("Set OWNER_UID to the Firebase Auth UID of your owner account.");
  process.exit(1);
}

const serviceAccount = JSON.parse(
  readFileSync(new URL("../serviceAccountKey.json", import.meta.url))
);

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const DEMO_PRODUCTS = [
  { name: "Burger", price: 120, category: "Food", description: "Grilled patty, cheese, lettuce, house sauce." },
  { name: "Pizza", price: 250, category: "Food", description: "Wood-fired, mozzarella, basil." },
  { name: "Cold Coffee", price: 80, category: "Drinks", description: "Chilled, blended with ice cream." },
  { name: "French Fries", price: 100, category: "Snacks", description: "Crispy, salted, served hot." },
  { name: "Sandwich", price: 90, category: "Food", description: "Grilled veg sandwich with chutney." },
  { name: "Momos", price: 120, category: "Snacks", description: "Steamed dumplings with spicy chutney." },
  { name: "Tea", price: 30, category: "Drinks", description: "Classic masala chai." },
  { name: "Fresh Lime", price: 50, category: "Drinks", description: "Sweet, salted, or soda — your call." },
  { name: "Brownie", price: 90, category: "Desserts", description: "Warm chocolate brownie." },
];

async function seed() {
  const shopRef = db.collection("shops").doc();
  await shopRef.set({
    name: "The Corner Cafe",
    address: "12 MG Road, Siliguri",
    logo: "",
    ownerUid,
    createdAt: new Date().toISOString(),
  });

  const batch = db.batch();
  DEMO_PRODUCTS.forEach((product) => {
    const productRef = db.collection("products").doc();
    batch.set(productRef, {
      ...product,
      shopId: shopRef.id,
      image: "",
      available: true,
      createdAt: new Date().toISOString(),
    });
  });
  await batch.commit();

  console.log("Seeded shop:", shopRef.id);
  console.log("Customer menu URL: /shop/" + shopRef.id);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
