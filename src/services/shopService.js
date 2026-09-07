import { doc, getDoc, getDocs, collection, query, where, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";

export async function getShop(shopId) {
  const snap = await getDoc(doc(db, "shops", shopId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/**
 * MVP assumption: one owner account manages one shop. To support multiple
 * shops per owner later, add a shop-switcher UI on top of this same query
 * (it already returns every shop where ownerUid matches).
 */
export async function getShopForOwner(ownerUid) {
  const q = query(collection(db, "shops"), where("ownerUid", "==", ownerUid));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const docSnap = snap.docs[0];
  return { id: docSnap.id, ...docSnap.data() };
}

export async function updateShop(shopId, data) {
  return updateDoc(doc(db, "shops", shopId), data);
}
