// src/lib/firestore/licenseService.ts
// Data-access layer for the `softwareLicenses` Firestore collection.

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
import { SoftwareLicense } from '../../types';

const COL = 'softwareLicenses';
const colRef = () => collection(db, COL);

function mapDoc(snap: QuerySnapshot<DocumentData>): SoftwareLicense[] {
  return snap.docs
    .map((d) => ({
      ...(d.data() as Omit<SoftwareLicense, 'id'>),
      id: d.id,
    }))
    .sort((a: any, b: any) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return (timeB || 0) - (timeA || 0);
    });
}

/**
 * Subscribe to real-time updates of the softwareLicenses collection.
 * Returns an unsubscribe function.
 */
export function subscribeToLicenses(
  onData: (licenses: SoftwareLicense[]) => void,
  onError: (err: Error) => void,
): () => void {
  return onSnapshot(colRef(), (snap) => onData(mapDoc(snap)), onError);
}

/** Add a new software license. Returns the Firestore document ID. */
export async function addLicenseDoc(
  data: Omit<SoftwareLicense, 'id'>,
): Promise<string> {
  const ref = await addDoc(colRef(), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/** Update any fields on a license document. */
export async function updateLicenseDoc(
  id: string,
  data: Partial<SoftwareLicense>,
): Promise<void> {
  await updateDoc(doc(db, COL, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/** Delete a software license document. */
export async function deleteLicenseDoc(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}
