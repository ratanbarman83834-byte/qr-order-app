
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  // Only POST requests are allowed
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const {
      shopId,
      customerName,
      customerPhone,
      tableNumber,
      notes,
      items,
    } = req.body;

    // Validate shop ID
    if (!shopId) {
      return res.status(400).json({
        error: "Shop ID is missing.",
      });
    }

    // Validate items
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: "Order items are missing.",
      });
    }

    let total = 0;
    const verifiedItems = [];

    // Verify every product from Firebase
    for (const item of items) {
      if (!item.productId) {
        return res.status(400).json({
          error: "Product ID is missing.",
        });
      }

      const quantity = Number(item.quantity) || 1;

      if (quantity <= 0) {
        return res.status(400).json({
          error: "Invalid product quantity.",
        });
      }

      const productDoc = await db
        .collection("products")
        .doc(item.productId)
        .get();

      if (!productDoc.exists) {
        return res.status(400).json({
          error: `Product ID (${item.productId}) database me nahi mila.`,
        });
      }

      const data = productDoc.data();

      const price = Number(data.price) || 0;

      total += price * quantity;

      verifiedItems.push({
        productId: item.productId,
        name: data.name || "Item",
        price,
        quantity,
      });
    }

    // Save order in Firestore
    const orderData = {
      // IMPORTANT: Dashboard isi shopId se orders filter karega
      shopId,

      customerName: customerName || "",
      customerPhone: customerPhone || "",
      tableNumber: tableNumber || "",
      notes: notes || "",

      items: verifiedItems,

      // Keep both fields for compatibility
      total: total,
      totalAmount: total,

      // Use the same status values everywhere
      status: "New",

      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const orderRef = await db
      .collection("orders")
      .add(orderData);

    return res.status(200).json({
      orderId: orderRef.id,
      total,
      totalAmount: total,
      status: "New",
    });
  } catch (error) {
    console.error("Create order error:", error);

    return res.status(500).json({
      error:
        error?.message ||
        "Order create nahi ho paya.",
    });
  }
}
