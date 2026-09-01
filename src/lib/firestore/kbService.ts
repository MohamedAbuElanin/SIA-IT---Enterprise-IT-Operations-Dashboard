// src/lib/firestore/kbService.ts
// Data-access layer for the `kbArticles` Firestore collection.

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  increment,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from '../firebase';
import { KBArticle } from '../../types';

const COL = 'kbArticles';
const colRef = () => collection(db, COL);

function mapDoc(snap: QuerySnapshot<DocumentData>): KBArticle[] {
  return snap.docs.map((d) => ({
    ...(d.data() as Omit<KBArticle, 'id'>),
    id: d.id,
  }));
}

/**
 * Subscribe to real-time updates of the kbArticles collection.
 * Returns an unsubscribe function.
 */
export function subscribeToKB(
  onData: (articles: KBArticle[]) => void,
  onError: (err: Error) => void,
): () => void {
  const q = query(colRef(), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => onData(mapDoc(snap)), onError);
}

/** Add a new KB article. Returns the Firestore document ID. */
export async function addKBDoc(
  data: Omit<KBArticle, 'id'>,
): Promise<string> {
  const ref = await addDoc(colRef(), {
    ...data,
    isFavorite: data.isFavorite ?? false,
    isPinned: data.isPinned ?? false,
    viewsCount: data.viewsCount ?? 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/** Update any fields on a KB article document. */
export async function updateKBDoc(
  id: string,
  data: Partial<KBArticle>,
): Promise<void> {
  await updateDoc(doc(db, COL, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/** Delete a KB article document. */
export async function deleteKBDoc(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}

/** Toggle the `isFavorite` flag. */
export async function toggleKBFavoriteDoc(
  id: string,
  currentValue: boolean,
): Promise<void> {
  await updateDoc(doc(db, COL, id), {
    isFavorite: !currentValue,
    updatedAt: serverTimestamp(),
  });
}

/** Toggle the `isPinned` flag. */
export async function toggleKBPinDoc(
  id: string,
  currentValue: boolean,
): Promise<void> {
  await updateDoc(doc(db, COL, id), {
    isPinned: !currentValue,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Increment the view count for an article.
 * Uses Firestore increment() for atomic, concurrent-safe counter updates.
 */
export async function incrementKBViewCount(id: string): Promise<void> {
  await updateDoc(doc(db, COL, id), {
    viewsCount: increment(1),
  });
}
