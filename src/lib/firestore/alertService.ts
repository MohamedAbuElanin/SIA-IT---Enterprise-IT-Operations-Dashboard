// src/lib/firestore/alertService.ts
// Data-access layer for the `systemAlerts` Firestore collection.

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
  writeBatch,
  getDocs,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from '../firebase';
import { SystemAlert } from '../../types';

const COL = 'systemAlerts';
const colRef = () => collection(db, COL);

function mapDoc(snap: QuerySnapshot<DocumentData>): SystemAlert[] {
  return snap.docs
    .map((d) => ({
      ...(d.data() as Omit<SystemAlert, 'id'>),
      id: d.id,
    }))
    .sort((a: any, b: any) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return (timeB || 0) - (timeA || 0);
    });
}

/**
 * Subscribe to real-time updates of the systemAlerts collection.
 * Returns an unsubscribe function.
 */
export function subscribeToAlerts(
  onData: (alerts: SystemAlert[]) => void,
  onError: (err: Error) => void,
): () => void {
  return onSnapshot(colRef(), (snap) => onData(mapDoc(snap)), onError);
}

/** Add a new system alert. Returns the Firestore document ID. */
export async function addAlertDoc(
  data: Omit<SystemAlert, 'id' | 'read'>,
): Promise<string> {
  const ref = await addDoc(colRef(), {
    ...data,
    read: false,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/** Mark a single alert as read. */
export async function markAlertReadDoc(id: string): Promise<void> {
  await updateDoc(doc(db, COL, id), { read: true });
}

/**
 * Mark ALL unread alerts as read using a batched write.
 * Firestore batch writes up to 500 operations — alerts are well within this limit.
 */
export async function markAllAlertsReadDoc(): Promise<void> {
  const snap = await getDocs(colRef());
  const unread = snap.docs.filter((d) => !(d.data() as SystemAlert).read);
  if (unread.length === 0) return;

  const batch = writeBatch(db);
  unread.forEach((d) => batch.update(d.ref, { read: true }));
  await batch.commit();
}

/** Delete (dismiss) an alert. */
export async function clearAlertDoc(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}
