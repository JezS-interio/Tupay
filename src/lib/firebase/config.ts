// src/lib/firebase/config.ts
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Lazy initialization — Firebase is NOT initialized at module import time.
// This prevents build failures when env vars are unavailable (Vercel build phase).
let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _storage: FirebaseStorage | null = null;

function getApp(): FirebaseApp {
  if (!_app) _app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  return _app;
}

function lazyProxy<T extends object>(init: () => T): T {
  let instance: T | null = null;
  return new Proxy({} as T, {
    get(_, prop) {
      if (!instance) instance = init();
      return Reflect.get(instance as T, prop);
    },
    set(_, prop, value) {
      if (!instance) instance = init();
      return Reflect.set(instance as T, prop, value);
    },
    has(_, prop) {
      if (!instance) instance = init();
      return Reflect.has(instance as T, prop);
    },
  });
}

export const auth: Auth = lazyProxy<Auth>(() => {
  if (!_auth) _auth = getAuth(getApp());
  return _auth;
});

export const db: Firestore = lazyProxy<Firestore>(() => {
  if (!_db) _db = getFirestore(getApp());
  return _db;
});

export const storage: FirebaseStorage = lazyProxy<FirebaseStorage>(() => {
  if (!_storage) _storage = getStorage(getApp());
  return _storage;
});

export default lazyProxy<FirebaseApp>(getApp);
