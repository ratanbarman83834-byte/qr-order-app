/**
 * Vite doesn't process public/firebase-messaging-sw.js through its env
 * pipeline (service workers must be plain static files at the site root),
 * so after building we substitute the placeholder tokens with real values
 * from .env. These are non-secret client config values, safe to embed.
 */
import { readFileSync, writeFileSync } from "fs";
import { config } from "dotenv";

config();

const path = "dist/firebase-messaging-sw.js";
let content = readFileSync(path, "utf8");

const replacements = {
  __VITE_FIREBASE_API_KEY__: process.env.VITE_FIREBASE_API_KEY,
  __VITE_FIREBASE_AUTH_DOMAIN__: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  __VITE_FIREBASE_PROJECT_ID__: process.env.VITE_FIREBASE_PROJECT_ID,
  __VITE_FIREBASE_STORAGE_BUCKET__: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  __VITE_FIREBASE_MESSAGING_SENDER_ID__: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  __VITE_FIREBASE_APP_ID__: process.env.VITE_FIREBASE_APP_ID,
};

for (const [token, value] of Object.entries(replacements)) {
  if (!value) {
    console.warn(`Warning: ${token} is empty — check your .env file.`);
  }
  content = content.replaceAll(token, value || "");
}

writeFileSync(path, content);
console.log("Injected Firebase config into firebase-messaging-sw.js");
