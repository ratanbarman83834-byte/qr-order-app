import admin from 'firebase-admin';

// Initialize Firebase Admin (Only once)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  // CORS Headers allow karein
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { shopId, customerName, customerPhone, tableNumber, notes, items } = req.body;

    let total = 0;
    const verifiedItems = [];

    // Server-side price lookup (Security)
    for (const item of items) {
      const productDoc = await db.collection('shops').doc(shopId).collection('products').doc(item.productId).get();
      if (!productDoc.exists) {
        return res.status(400).json({ error: `Product not found` });
      }
      const data = productDoc.data();
      total += data.price * item.quantity;
      verifiedItems.push({
        productId: item.productId,
        name: data.name,
        price: data.price,
        quantity: item.quantity,
      });
    }

    // Save order in Firestore
    const orderRef = await db.collection('orders').add({
      shopId,
      customerName,
      customerPhone: customerPhone || "",
      tableNumber: tableNumber || "",
      notes: notes || "",
      items: verifiedItems,
      total,
      status: "New",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(200).json({
      orderId: orderRef.id,
      total,
      status: "New"
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}