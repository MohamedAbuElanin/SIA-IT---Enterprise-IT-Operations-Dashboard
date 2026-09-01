// src/lib/firestore/assetService.ts
// Data-access layer for the `assets` Firestore collection.
// No raw Firestore calls should exist in React components or Zustand stores.

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
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from '../firebase';
import { ITAsset } from '../../types';

const COL = 'assets';
const colRef = () => collection(db, COL);

/** Map a Firestore document snapshot to an ITAsset, merging doc.id as `id`. */
function mapDoc(snap: QuerySnapshot<DocumentData>): ITAsset[] {
  return snap.docs.map((d) => ({
    ...(d.data() as Omit<ITAsset, 'id'>),
    id: d.id,
  }));
}

/**
 * Subscribe to real-time updates of the assets collection.
 * Returns an unsubscribe function to clean up the listener.
 */
export function subscribeToAssets(
  onData: (assets: ITAsset[]) => void,
  onError: (err: Error) => void,
): () => void {
  const q = query(colRef(), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => onData(mapDoc(snap)),
    onError,
  );
}

/** Add a new asset document. Returns the new Firestore document ID. */
export async function addAssetDoc(
  data: Omit<ITAsset, 'id'>,
): Promise<string> {
  const ref = await addDoc(colRef(), {
    ...data,
    isFavorite: data.isFavorite ?? false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/** Partially update an existing asset document. */
export async function updateAssetDoc(
  id: string,
  data: Partial<ITAsset>,
): Promise<void> {
  await updateDoc(doc(db, COL, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/** Delete an asset document. */
export async function deleteAssetDoc(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}

/** Toggle the `isFavorite` flag on an asset document. */
export async function toggleAssetFavoriteDoc(
  id: string,
  currentValue: boolean,
): Promise<void> {
  await updateDoc(doc(db, COL, id), {
    isFavorite: !currentValue,
    updatedAt: serverTimestamp(),
  });
}
