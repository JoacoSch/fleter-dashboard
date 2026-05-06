import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

let _auth: Auth | null = null;

export function getFirebaseAuth(): Auth {
  if (!_auth) {
    const app: FirebaseApp =
      getApps().length === 0
        ? initializeApp({
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
            authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          })
        : getApps()[0];
    _auth = getAuth(app);
  }
  return _auth;
}

export async function getAuthToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const user = getFirebaseAuth().currentUser;
  if (!user) return null;
  return user.getIdToken();
}
