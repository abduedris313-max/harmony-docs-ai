/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { ChatMessage, KnowledgeDocument } from '../types';

function getEnvVar(key: string): string {
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[key]) {
      return String((import.meta as any).env[key]);
    }
  } catch (_) {}
  try {
    if (typeof process !== 'undefined' && process.env && (process.env as any)[key]) {
      return String((process.env as any)[key]);
    }
  } catch (_) {}
  return '';
}

export const FIREBASE_CONFIG = {
  apiKey: getEnvVar('VITE_FIREBASE_API_KEY') || 'AIzaSyD2x5XPLdbW53lrJOieeAhGEdR3KKKvLCg',
  authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN') || 'concrete-lead-kc9s2.firebaseapp.com',
  projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID') || 'concrete-lead-kc9s2',
  storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET') || 'concrete-lead-kc9s2.appspot.com',
  messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID') || '841412345678',
  appId: getEnvVar('VITE_FIREBASE_APP_ID') || '1:841412345678:web:1a2b3c4d5e6f7g8h9i0j1k',
};

let app: any = null;
let auth: any = null;
let db: any = null;
let isFirebaseAvailable = false;

try {
  if (getApps().length === 0) {
    app = initializeApp(FIREBASE_CONFIG);
  } else {
    app = getApps()[0];
  }
  auth = getAuth(app);
  db = getFirestore(app);
  isFirebaseAvailable = true;
} catch (e) {
  console.warn('Firebase initialized with fallback storage mode:', e);
  isFirebaseAvailable = false;
}

export { auth, db, isFirebaseAvailable };

/**
 * Subscribe to user authentication changes
 */
export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  if (!auth) {
    callback(null);
    return () => {};
  }
  try {
    return onAuthStateChanged(
      auth,
      (user) => {
        try {
          callback(user);
        } catch (err) {
          console.warn('Error in auth callback:', err);
        }
      },
      (error) => {
        console.warn('Firebase auth state error:', error);
        callback(null);
      }
    );
  } catch (err) {
    console.warn('Failed to subscribe to auth:', err);
    callback(null);
    return () => {};
  }
}

/**
 * Get current Firebase connection status
 */
export function getFirebaseStatus() {
  return {
    isAvailable: isFirebaseAvailable,
    projectId: FIREBASE_CONFIG.projectId,
    authDomain: FIREBASE_CONFIG.authDomain,
  };
}

/**
 * Sign in with Google Popup
 */
export async function signInWithGoogle(): Promise<User | null> {
  if (!auth) return null;
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error('Google Sign In Error:', error);
    throw error;
  }
}

/**
 * Sign out
 */
export async function logoutUser(): Promise<void> {
  if (!auth) return;
  await signOut(auth);
}

/**
 * Save chat messages to Firestore or LocalStorage
 */
export async function persistMessages(userId: string, messages: ChatMessage[]): Promise<void> {
  try {
    localStorage.setItem(`harmony_messages_${userId || 'guest'}`, JSON.stringify(messages));
    if (db && userId && userId !== 'guest') {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, { lastActive: new Date().toISOString() }, { merge: true });
    }
  } catch (e) {
    console.warn('Could not persist messages:', e);
  }
}

/**
 * Load chat messages from Firestore or LocalStorage
 */
export function loadPersistedMessages(userId: string): ChatMessage[] {
  try {
    const raw = localStorage.getItem(`harmony_messages_${userId || 'guest'}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      }));
    }
  } catch (e) {
    console.warn('Could not load messages from localStorage:', e);
  }
  return [];
}

/**
 * Save documents to LocalStorage and Firestore
 */
export async function persistDocuments(userId: string, documents: KnowledgeDocument[]): Promise<void> {
  try {
    localStorage.setItem(`harmony_docs_${userId || 'guest'}`, JSON.stringify(documents));
  } catch (e) {
    console.warn('Could not persist documents:', e);
  }
}

/**
 * Load documents from LocalStorage
 */
export function loadPersistedDocuments(userId: string): KnowledgeDocument[] {
  try {
    const raw = localStorage.getItem(`harmony_docs_${userId || 'guest'}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Could not load documents from localStorage:', e);
  }
  return [];
}
