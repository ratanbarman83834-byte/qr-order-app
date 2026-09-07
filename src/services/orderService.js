
import 
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../firebase/config";

/**
 * Places an order by calling our Vercel Serverless API.
 */
export async function placeOrder({
  shopId,
  customerName,
  customerPhone,
  tableNumber,
  notes,
  items,
}) {
  const response = await fetch("/api/createOrder", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      shopId,
      customerName,
      customerPhone: customerPhone || "",
      tableNumber: tableNumber || "",
      notes: notes || "",
      items: items.map((i) => ({
        productId: i.productId || i.id,
        quantity: i.quantity,
      })),
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    throw new Error(
      errorData.error ||
        "Order place nahi ho paya. Phir se try karein."
    );
  }

  return await response.json();
}

/**
 * Live status for the customer-facing order tracking page.
 */
export function subscribeToOrder(orderId, onChange, onError) {
  return onSnapshot(
    doc(db, "orders", orderId),
    (snap) => {
      if (!snap.exists()) {
        onChange(null);
        return;
      }

      onChange({
        id: snap.id,
        ...snap.data(),
      });
    },
    onError
  );
}

/**
 * Live order list for the admin dashboard.
 */
export function subscribeToShopOrders(shopId, onChange, onError) {
  // DEBUG
  console.log("🔍 Admin Orders shopId:", shopId);

  if (!shopId) {
    console.warn("⚠️ shopId missing. Orders query stopped.");
    onChange([]);
    return () => {};
  }

  const q = query(
    collection(db, "orders"),
    where("shopId", "==", shopId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    q,
    (snap) => {
      console.log("📦 Orders found:", snap.size);

      const orders = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      console.log("📋 Orders:", orders);

      onChange(orders);
    },
    (error) => {
      console.error("❌ Orders query error:", error);

      if (onError) {
        onError(error);
      }
    }
  );
}

/**
 * Available order statuses.
 */
export const ORDER_STATUSES = [
  "New",
  "Accepted",
  "Preparing",
  "Ready",
  "Completed",
  "Cancelled",
];

/**
 * Update order status.
 */
export async function updateOrderStatus(orderId, status) {
  if (!orderId) {
    throw new Error("Order ID is missing.");
  }

  if (!status) {
    throw new Error("Order status is missing.");
  }

  return updateDoc(doc(db, "orders", orderId), {
    status,
    statusUpdatedAt: new Date().toISOString(),
  });
}

