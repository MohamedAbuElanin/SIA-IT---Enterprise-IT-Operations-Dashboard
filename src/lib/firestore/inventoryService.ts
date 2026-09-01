// src/lib/firestore/inventoryService.ts
// Data-access layer for the `inventoryItems` Firestore collection.

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
import { InventoryItem } from '../../types';

const COL = 'inventoryItems';
const colRef = () => collection(db, COL);

function mapDoc(snap: QuerySnapshot<DocumentData>): InventoryItem[] {
  return snap.docs.map((d) => ({
    ...(d.data() as Omit<InventoryItem, 'id'>),
    id: d.id,
  }));
}

/**
 * Subscribe to real-time updates of the inventoryItems collection.
 * Returns an unsubscribe function.
 */
export function subscribeToInventory(
  onData: (items: InventoryItem[]) => void,
  onError: (err: Error) => void,
): () => void {
  const q = query(colRef(), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => onData(mapDoc(snap)), onError);
}

/** Add a new inventory item. Returns the Firestore document ID. */
export async function addInventoryDoc(
  data: Omit<InventoryItem, 'id'>,
): Promise<string> {
  const ref = await addDoc(colRef(), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/** Update any fields on an inventory item. */
export async function updateInventoryDoc(
  id: string,
  data: Partial<InventoryItem>,
): Promise<void> {
  await updateDoc(doc(db, COL, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Apply a stock delta (+/-) to an inventory item.
 * The new status is derived from quantity vs minThreshold and persisted.
 * @param id - Firestore document ID
 * @param delta - positive to add stock, negative to remove
 * @param currentItem - current item data needed to compute the new values
 */
export async function updateStockDoc(
  id: string,
  delta: number,
  currentItem: InventoryItem,
): Promise<void> {
  const newQty = Math.max(0, currentItem.quantityInStock + delta);
  let newStatus: InventoryItem['status'] = 'In Stock';
  if (newQty === 0) newStatus = 'Out of Stock';
  else if (newQty <= currentItem.minThreshold) newStatus = 'Low Stock';

  await updateDoc(doc(db, COL, id), {
    quantityInStock: newQty,
    status: newStatus,
    lastRestocked:
      delta > 0
        ? new Date().toISOString().split('T')[0]
        : currentItem.lastRestocked,
    updatedAt: serverTimestamp(),
  });
}

/** Delete an inventory item document. */
export async function deleteInventoryDoc(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}
