import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import { doc, setDoc, arrayUnion } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app, db } from "./config";

export async function registerOwnerForPush(ownerUid) {
  try {
    // Firebase Auth se currently logged-in user
    const auth = getAuth(app);
    const currentUser = auth.currentUser;

    if (!currentUser) {
      console.error("Push registration: user is not logged in");
      return "denied";
    }

    // Security: passed UID aur logged-in UID same hone chahiye
    if (currentUser.uid !== ownerUid) {
      console.error("Push registration: UID mismatch", {
        authUid: currentUser.uid,
        ownerUid,
      });
      return "error";
    }

    const supported = await isSupported().catch(() => false);

    if (!supported) {
      console.log("Firebase Messaging is not supported");
      return "unsupported";
    }

    if (!("Notification" in window)) {
      return "unsupported";
    }

    let permission = Notification.permission;

    if (permission === "default") {
      permission = await Notification.requestPermission();
    }

    if (permission !== "granted") {
      console.log("Notification permission:", permission);
      return "denied";
    }

    // Register Firebase Messaging Service Worker
    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js"
    );

    await navigator.serviceWorker.ready;

    const messaging = getMessaging(app);

    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

    if (!vapidKey) {
      console.error("VITE_FIREBASE_VAPID_KEY is missing");
      return "error";
    }

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });

    if (!token) {
      console.error("FCM token was not generated");
      return "error";
    }

    console.log("FCM token generated:", token);

    // Firestore
    await setDoc(
      doc(db, "ownerDevices", currentUser.uid),
      {
        tokens: arrayUnion(token),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    console.log("FCM token saved successfully");

    return "granted";
  } catch (err) {
    console.error("Push registration failed:", err);
    return "error";
  }
}

export async function listenForForegroundOrders(callback) {
  const supported = await isSupported().catch(() => false);

  if (!supported) return () => {};

  try {
    const messaging = getMessaging(app);

    return onMessage(messaging, (payload) => {
      console.log("Foreground FCM message:", payload);
      callback(payload);
    });
  } catch (err) {
    console.error("Foreground messaging failed:", err);
    return () => {};
  }
}