import admin from "firebase-admin";
import fs from "fs";
import path from "path";

if (!admin.apps.length) {
    const serviceAccountPath = path.join(process.cwd(), "firebase-service-account.json");

    if (fs.existsSync(serviceAccountPath)) {
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        console.log("Firebase Admin initialized using JSON file.");
    } else {
        const privateKey = process.env.FIREBASE_PRIVATE_KEY
            ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
            : undefined;

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: privateKey,
            }),
        });
        console.log("Firebase Admin initialized using environment variables.");
    }
}

export const messaging = admin.messaging();
