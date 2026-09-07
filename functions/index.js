const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");

initializeApp();
const db = getFirestore();

/**
 * createOrder — the ONLY way an order gets written.
 *
 * The client sends productId + quantity only. This function re-reads every
 * product's current price from Firestore, checks it's still available,
 * computes subtotal/total itself, and writes the order. A customer can send
 * whatever "price" they want from devtools — it is ignored entirely.
 */
// ✅ NAYA CODE:
exports.createOrder = onCall({ cors: true }, async (request) => {  const { shopId, customerName, customerPhone, tableNumber, notes, items } =
    request.data || {};

  if (!shopId || typeof shopId !== "string") {
    throw new HttpsError("invalid-argument", "A valid shopId is required.");
  }
  if (!customerName || !customerName.trim()) {
    throw new HttpsError("invalid-argument", "Customer name is required.");
  }
  if (!Array.isArray(items) || items.length === 0) {
    throw new HttpsError("invalid-argument", "Cart is empty.");
  }
  if (items.length > 50) {
    throw new HttpsError("invalid-argument", "Too many line items.");
  }

  const shopSnap = await db.collection("shops").doc(shopId).get();
  if (!shopSnap.exists) {
    throw new HttpsError("not-found", "This shop does not exist.");
  }

  const orderItems = [];
  let subtotal = 0;

  for (const rawItem of items) {
    const productId = String(rawItem.productId || "");
    const quantity = Number(rawItem.quantity);

    if (!productId || !Number.isInteger(quantity) || quantity <= 0 || quantity > 99) {
      throw new HttpsError("invalid-argument", "Invalid item in cart.");
    }

    const productSnap = await db.collection("products").doc(productId).get();
    if (!productSnap.exists) {
      throw new HttpsError(
        "failed-precondition",
        `A product in your cart is no longer available.`
      );
    }
    const product = productSnap.data();

    if (product.shopId !== shopId) {
      throw new HttpsError("invalid-argument", "Product does not belong to this shop.");
    }
    if (product.available === false) {
      throw new HttpsError(
        "failed-precondition",
        `"${product.name}" is currently unavailable. Please remove it and try again.`
      );
    }

    const priceAtPurchase = Number(product.price);
    const lineSubtotal = priceAtPurchase * quantity;
    subtotal += lineSubtotal;

    orderItems.push({
      productId,
      productName: product.name,
      priceAtPurchase,
      quantity,
      subtotal: lineSubtotal,
    });
  }

  const total = subtotal; // extend here later for tax/discounts/delivery fee
  const orderRef = db.collection("orders").doc();
  const orderCode = `ORD${Date.now().toString().slice(-6)}`;

  const orderDoc = {
    shopId,
    orderCode,
    customerName: customerName.trim(),
    customerPhone: (customerPhone || "").trim(),
    tableNumber: (tableNumber || "").trim(),
    notes: (notes || "").trim().slice(0, 500),
    items: orderItems,
    subtotal,
    total,
    status: "New",
    createdAt: new Date().toISOString(),
    statusUpdatedAt: new Date().toISOString(),
  };

  await orderRef.set(orderDoc);

  return {
    orderId: orderRef.id,
    orderCode,
    total,
    items: orderItems,
    status: "New",
  };
});

/**
 * onOrderCreated — fires automatically whenever createOrder writes a new
 * order. Looks up the shop's owner device tokens and sends a real FCM push.
 * Decoupled from createOrder so a slow/failed push never blocks or fails
 * the customer's order placement.
 */
exports.onOrderCreated = onDocumentCreated("orders/{orderId}", async (event) => {
  const order = event.data.data();
  if (!order) return;

  const shopSnap = await db.collection("shops").doc(order.shopId).get();
  const ownerUid = shopSnap.exists ? shopSnap.data().ownerUid : null;
  if (!ownerUid) return;

  const deviceSnap = await db.collection("ownerDevices").doc(ownerUid).get();
  const tokens = deviceSnap.exists ? deviceSnap.data().tokens || [] : [];
  if (tokens.length === 0) return; // Falls back to real-time dashboard only.

  const itemSummary = order.items
    .map((i) => `${i.productName} x${i.quantity}`)
    .join(", ");

  const message = {
    notification: {
      title: `New order · ${order.orderCode}`,
      body: `${order.customerName}${order.tableNumber ? " · Table " + order.tableNumber : ""} — ${itemSummary} — ₹${order.total}`,
    },
    data: {
      orderId: event.params.orderId,
      orderCode: order.orderCode,
    },
    tokens,
  };

  const response = await getMessaging().sendEachForMulticast(message);

  // Clean up tokens that are no longer valid (uninstalled/expired).
  const staleTokens = [];
  response.responses.forEach((r, idx) => {
    if (!r.success && r.error?.code === "messaging/registration-token-not-registered") {
      staleTokens.push(tokens[idx]);
    }
  });
  if (staleTokens.length > 0) {
    await db.collection("ownerDevices").doc(ownerUid).update({
      tokens: FieldValue.arrayRemove(...staleTokens),
    });
  }
});
