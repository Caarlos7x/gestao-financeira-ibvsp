import { getAuth, type Auth } from 'firebase/auth';
import { getFirebaseApp } from '@/services/firebase/firebaseApp';

let cachedAuth: Auth | null = null;

export function getFirebaseAuth(): Auth {
  if (!cachedAuth) {
    cachedAuth = getAuth(getFirebaseApp());
  }
  return cachedAuth;
}
