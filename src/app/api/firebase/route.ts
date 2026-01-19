import { NextResponse } from "next/server";

export async function GET() {
  const swCode = `
    importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");
    importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");

    firebase.initializeApp({
      apiKey: "${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}",
      authDomain: "${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}",
      projectId: "${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}",
      storageBucket: "${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}",
      messagingSenderId: "${process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}",
      appId: "${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}",
    });

    const messaging = firebase.messaging();

    self.addEventListener("install", (event) => {
      self.skipWaiting();
    });

    self.addEventListener("activate", (event) => {
      event.waitUntil(self.clients.claim());
    });

    messaging.onBackgroundMessage((payload) => {
      console.log("[firebase-messaging-sw.js] Received background message ", payload);
      // Let the browser handle the notification automatically from the payload.
    });
  `;

  return new NextResponse(swCode, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    },
  });
}
