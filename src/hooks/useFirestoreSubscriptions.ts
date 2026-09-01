// src/hooks/useFirestoreSubscriptions.ts
// Hook to initialize real-time subscriptions for all Firestore collections on application mount.

import { useEffect } from 'react';
import { useAssetStore } from '../store/useAssetStore';
import { useMaintenanceStore } from '../store/useMaintenanceStore';
import { useInventoryStore } from '../store/useInventoryStore';
import { useLicenseStore } from '../store/useLicenseStore';
import { useKBStore } from '../store/useKBStore';
import { useNotificationStore } from '../store/useNotificationStore';

export const useFirestoreSubscriptions = () => {
  const subscribeAssets = useAssetStore((s) => s.subscribe);
  const unsubscribeAssets = useAssetStore((s) => s.unsubscribe);

  const subscribeMaintenance = useMaintenanceStore((s) => s.subscribe);
  const unsubscribeMaintenance = useMaintenanceStore((s) => s.unsubscribe);

  const subscribeInventory = useInventoryStore((s) => s.subscribe);
  const unsubscribeInventory = useInventoryStore((s) => s.unsubscribe);

  const subscribeLicenses = useLicenseStore((s) => s.subscribe);
  const unsubscribeLicenses = useLicenseStore((s) => s.unsubscribe);

  const subscribeKB = useKBStore((s) => s.subscribe);
  const unsubscribeKB = useKBStore((s) => s.unsubscribe);

  const subscribeAlerts = useNotificationStore((s) => s.subscribe);
  const unsubscribeAlerts = useNotificationStore((s) => s.unsubscribe);

  useEffect(() => {
    subscribeAssets();
    subscribeMaintenance();
    subscribeInventory();
    subscribeLicenses();
    subscribeKB();
    subscribeAlerts();

    return () => {
      unsubscribeAssets();
      unsubscribeMaintenance();
      unsubscribeInventory();
      unsubscribeLicenses();
      unsubscribeKB();
      unsubscribeAlerts();
    };
  }, [
    subscribeAssets,
    unsubscribeAssets,
    subscribeMaintenance,
    unsubscribeMaintenance,
    subscribeInventory,
    unsubscribeInventory,
    subscribeLicenses,
    unsubscribeLicenses,
    subscribeKB,
    unsubscribeKB,
    subscribeAlerts,
    unsubscribeAlerts,
  ]);
};
