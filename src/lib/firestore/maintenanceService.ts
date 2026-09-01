// src/lib/firestore/maintenanceService.ts
// Data-access layer for the `maintenanceRecords` Firestore collection.

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
  arrayUnion,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from '../firebase';
import { MaintenanceRecord, MaintenanceTimelineEvent, TicketStatus } from '../../types';

const COL = 'maintenanceRecords';
const colRef = () => collection(db, COL);

function mapDoc(snap: QuerySnapshot<DocumentData>): MaintenanceRecord[] {
  return snap.docs.map((d) => ({
    ...(d.data() as Omit<MaintenanceRecord, 'id'>),
    id: d.id,
  }));
}

/**
 * Subscribe to real-time updates of the maintenanceRecords collection.
 * Returns an unsubscribe function.
 */
export function subscribeToMaintenance(
  onData: (records: MaintenanceRecord[]) => void,
  onError: (err: Error) => void,
): () => void {
  const q = query(colRef(), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => onData(mapDoc(snap)), onError);
}

/**
 * Create a new maintenance ticket.
 * Automatically generates a ticketNumber and seeds the initial timeline event.
 */
export async function createMaintenanceDoc(
  data: Omit<MaintenanceRecord, 'id' | 'ticketNumber' | 'timeline'>,
): Promise<string> {
  // Generate a sequential-looking ticket number using timestamp
  const ticketNumber = `INC-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
  const initialEvent: MaintenanceTimelineEvent = {
    id: `tl-${Date.now()}`,
    timestamp: new Date().toISOString(),
    author: 'IT Officer',
    note: `Ticket created. Problem: ${data.problem.substring(0, 100)}${data.problem.length > 100 ? '…' : ''}`,
    status: 'Open' as TicketStatus,
  };

  const ref = await addDoc(colRef(), {
    ...data,
    ticketNumber,
    timeline: [initialEvent],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/** Update any fields on a maintenance record. */
export async function updateMaintenanceDoc(
  id: string,
  data: Partial<MaintenanceRecord>,
): Promise<void> {
  await updateDoc(doc(db, COL, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Change the status of a ticket and automatically append a timeline event.
 * Uses `arrayUnion` so the append is atomic and concurrent-safe.
 */
export async function updateMaintenanceStatusDoc(
  id: string,
  status: TicketStatus,
): Promise<void> {
  const timelineEvent: MaintenanceTimelineEvent = {
    id: `tl-${Date.now()}`,
    timestamp: new Date().toISOString(),
    author: 'IT Officer',
    note: `Status changed to: ${status}`,
    status,
  };

  await updateDoc(doc(db, COL, id), {
    status,
    timeline: arrayUnion(timelineEvent),
    updatedAt: serverTimestamp(),
  });
}

/** Delete a maintenance record. */
export async function deleteMaintenanceDoc(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}
