import { initializeApp, type FirebaseApp } from 'firebase/app';
import { readFirebaseWebConfig } from '@/services/firebase/firebaseConfig';

let cachedApp: FirebaseApp | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!cachedApp) {
    cachedApp = initializeApp(readFirebaseWebConfig());
  }
  return cachedApp;
}
