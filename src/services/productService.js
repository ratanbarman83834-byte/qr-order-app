
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../firebase/config";

/** Live-subscribes to all products for a shop. Calls onChange(products[]). */
export function subscribeToProducts(shopId, onChange, onError) {
  const q = query(
    collection(db, "products"),
    where("shopId", "==", shopId),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(
    q,
    (snap) =>
      onChange(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      ),
    onError
  );
}

/** Create a new product */
export async function createProduct(shopId, data) {
  return addDoc(collection(db, "products"), {
    shopId,
    name: data.name.trim(),
    description: data.description?.trim() || "",
    price: Number(data.price),
    category: data.category,
    image: data.image?.trim() || "",
    available: data.available ?? true,
    createdAt: new Date().toISOString(),
  });
}

/** Update an existing product */
export async function updateProduct(productId, data) {
  const updates = {
    ...data,
  };

  if (updates.name !== undefined) {
    updates.name = updates.name.trim();
  }

  if (updates.description !== undefined) {
    updates.description = updates.description.trim();
  }

  if (updates.image !== undefined) {
    updates.image = updates.image.trim();
  }

  if (updates.price !== undefined) {
    updates.price = Number(updates.price);
  }

  return updateDoc(doc(db, "products", productId), updates);
}

/** Delete a product */
export async function deleteProduct(productId) {
  return deleteDoc(doc(db, "products", productId));
}

/** Toggle product availability */
export async function toggleAvailability(productId, available) {
  return updateDoc(doc(db, "products", productId), {
    available,
  });
}

export const CATEGORIES = [
  "All",
  "Drinks",
  "Food",
  "Snacks",
  "Desserts",
];

// Kept for compatibility with AdminProductsPage.
// Firebase Storage is no longer used, so nothing needs to be deleted.
export async function deleteProductImage() {
  return;
}
