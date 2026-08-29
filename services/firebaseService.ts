/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { ChatMessage, KnowledgeDocument } from '../types';

// Default config fallback for AI Studio preview / local sandbox
const defaultFirebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyMockKeyForPreviewStudio001",
  authDomain: "harmony-docai.firebaseapp.com",
  projectId: "harmony-docai",
  storageBucket: "harmony-docai.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
};

let app: any = null;
let auth: any = null;
let db: any = null;
let isFirebaseAvailable = false;

try {
  if (getApps().length === 0) {
    app = initializeApp(defaultFirebaseConfig);
  } else {
    app = getApps()[0];
  }
  auth = getAuth(app);
  db = getFirestore(app);
  isFirebaseAvailable = true;
} catch (e) {
  console.warn('Firebase initialized in offline/local storage mode:', e);
  isFirebaseAvailable = false;
}

export { auth, db, isFirebaseAvailable };

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
