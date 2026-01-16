import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  MessagePayload,
  onMessage,
} from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const requestNotificationPermission = async () => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    console.log("Notifications not supported in this browser");
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const messaging = getMessaging(app);
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });
      return token;
    }
  } catch (error) {
    console.error("Error requesting notification permission:", error);
  }
  return null;
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    const messaging = getMessaging(app);
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

import {
  subscribeTokenToTopic,
  unsubscribeTokenFromTopic,
} from "@/actions/notification";

// This calls a server action to subscribe the token to a topic
export const subscribeToDishTopic = async (menuItemId: string) => {
  const token = await requestNotificationPermission();
  if (!token) return false;

  try {
    const res = await subscribeTokenToTopic(token, `dish_notify_${menuItemId}`);
    return res.success;
  } catch (error) {
    console.error("Subscription failed", error);
    return false;
  }
};

export const unsubscribeFromDishTopic = async (menuItemId: string) => {
  const token = await requestNotificationPermission();
  if (!token) return false;

  try {
    const res = await unsubscribeTokenFromTopic(
      token,
      `dish_notify_${menuItemId}`,
    );
    return res.success;
  } catch (error) {
    console.error("Unsubscription failed", error);
    return false;
  }
};

export const checkNotificationPermission = (): NotificationPermission => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied";
  }
  return Notification.permission;
};
