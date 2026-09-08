import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query } from 'firebase/firestore';
import { db } from '../firebase';
import { ServerNode } from '../../types';

const COLLECTION_NAME = 'servers';

/**
 * Helper to map a Firestore document to our ServerNode domain model safely.
 */
const mapDoc = (docSnap: any): ServerNode => {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    name: data.name || '',
    hostname: data.hostname || '',
    ipAddress: data.ipAddress || '',
    role: data.role || '',
    environment: data.environment || 'Production',
    status: data.status || 'Offline',
    cpuUsagePct: data.cpuUsagePct || 0,
    ramUsagePct: data.ramUsagePct || 0,
    diskUsagePct: data.diskUsagePct || 0,
    uptimeDays: data.uptimeDays || 0,
    os: data.os || '',
    activeAlertsCount: data.activeAlertsCount || 0,
    metricsHistory: data.metricsHistory || [],
  };
};

/**
 * Subscribes to the servers collection and invokes the callback with sorted ServerNodes.
 */
export const subscribeToServers = (onUpdate: (servers: ServerNode[]) => void, onError: (err: Error) => void) => {
  const q = query(collection(db, COLLECTION_NAME));
  
  return onSnapshot(
    q,
    (snapshot) => {
      const servers = snapshot.docs.map(mapDoc);
      // Client-side sorting (e.g., by name ascending)
      servers.sort((a, b) => a.name.localeCompare(b.name));
      onUpdate(servers);
    },
    (error) => {
      console.error("Error subscribing to servers:", error);
      onError(error);
    }
  );
};

export const addServer = async (serverData: Omit<ServerNode, 'id'>) => {
  return await addDoc(collection(db, COLLECTION_NAME), {
    ...serverData,
    createdAt: new Date().toISOString(),
  });
};

export const updateServer = async (id: string, serverData: Partial<ServerNode>) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  return await updateDoc(docRef, {
    ...serverData,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteServer = async (id: string) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  return await deleteDoc(docRef);
};
