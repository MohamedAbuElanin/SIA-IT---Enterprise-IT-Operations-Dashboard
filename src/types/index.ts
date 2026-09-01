// Updated Domain Types for SIA Enterprise IT Operations Dashboard

// ─── Shared Firestore store state ──────────────────────────────────────────
/**
 * Mixin interface added to every Zustand store that is backed by Firestore.
 * `loading` is true until the first onSnapshot response arrives.
 * `error` holds the last Firestore error message, or null if healthy.
 */
export interface FirestoreStoreState {
  loading: boolean;
  error: string | null;
}

// ─── Domain enums ──────────────────────────────────────────────────────────
export type AssetStatus = 'Active' | 'In Repair' | 'Spare Stock' | 'Decommissioned' | 'Pending Audit';

export type InventoryCategory =
  | 'PC'
  | 'Laptop'
  | 'Monitor'
  | 'Printer'
  | 'Keyboard'
  | 'Mouse'
  | 'UPS'
  | 'Router'
  | 'Switch'
  | 'Access Point'
  | 'Server'
  | 'Camera'
  | 'DVR';

export type PriorityLevel = 'Critical' | 'High' | 'Medium' | 'Low';
export type TicketStatus = 'Open' | 'In Progress' | 'Pending Parts' | 'Resolved' | 'Closed';
export type ServerStatus = 'Healthy' | 'Warning' | 'Critical' | 'Maintenance' | 'Offline';
export type LicenseCategory = 'Windows' | 'Office' | 'AnyDesk' | 'Adobe' | 'ERP' | 'Antivirus';
export type LicenseStatus = 'Active' | 'Expiring Soon' | 'Expired' | 'Over-Allocated';
export type NetworkStatus = 'Online' | 'Degraded' | 'Offline';

export interface NetworkDevice {
  id: string;
  name: string;
  type: string;
  location: string;
  ipAddress: string;
  status: NetworkStatus;
  latencyMs: number;
  bandwidthMbps: number;
  activeClients: number;
  packetLossPct: number;
  firmwareVersion: string;
}

export interface ITAsset {
  id: string;
  assetNumber: string; // e.g. "AST-2026-001"
  serialNumber: string;
  hostname: string;
  deviceName: string;
  deviceType: 'PC' | 'Laptop' | 'Server' | 'Barcode Scanner' | 'Rugged Terminal' | 'Printer' | 'POS Terminal';
  brand: string;
  model: string;
  cpu: string;
  ram: string;
  storage: string;
  windowsVersion: string;
  officeVersion: string;
  warranty: string;
  purchaseDate: string;
  vendor: string;
  department: string;
  location: string;
  assignedEmployee: string;
  status: AssetStatus;
  notes: string;
  deviceImage: string;
  valueUSD?: number;
  isFavorite?: boolean;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: InventoryCategory;
  quantityInStock: number;
  minThreshold: number;
  unitCostUSD: number;
  binLocation: string;
  compatibleModels: string[];
  status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'On Order';
  lastRestocked: string;
}

export interface MaintenanceTimelineEvent {
  id: string;
  timestamp: string;
  author: string;
  note: string;
  status: TicketStatus;
}

export interface MaintenanceRecord {
  id: string;
  ticketNumber: string;
  problem: string;
  cause: string;
  solution: string;
  engineer: string;
  date: string;
  status: TicketStatus;
  cost: number;
  attachments: string[];
  timeline: MaintenanceTimelineEvent[];
  location?: string;
  priority?: PriorityLevel;
  affectedAssetTag?: string;
}

export interface KBArticle {
  id: string;
  articleId: string;
  title: string;
  category: string;
  symptoms: string;
  rootCause: string;
  solution: string;
  commandsUsed: string[];
  timeToSolve: string;
  relatedDevices: string[];
  relatedSoftware: string[];
  images: string[];
  files: string[];
  isFavorite: boolean;
  isPinned: boolean;
  author?: string;
  lastUpdated?: string;
  viewsCount?: number;
}

export interface SoftwareLicense {
  id: string;
  softwareName: string;
  category: LicenseCategory;
  publisher: string;
  licenseKey: string;
  purchaseType: 'Subscription (Annual)' | 'Perpetual' | 'Per-User SaaS';
  totalSeats: number;
  usedSeats: number;
  costPerYearUSD: number;
  expiryDate: string;
  assignedDepartments: string[];
  status: LicenseStatus;
  daysUntilExpiry?: number;
}

export interface ServerNode {
  id: string;
  name: string;
  hostname: string;
  ipAddress: string;
  role: string;
  environment: 'Production' | 'Staging' | 'DR Site';
  status: ServerStatus;
  cpuUsagePct: number;
  ramUsagePct: number;
  diskUsagePct: number;
  uptimeDays: number;
  os: string;
  activeAlertsCount: number;
  metricsHistory: { timestamp: string; cpu: number; ram: number; disk: number }[];
}

export interface SystemAlert {
  id: string;
  title: string;
  message: string;
  severity: PriorityLevel;
  timestamp: string;
  sourceModule: 'Assets' | 'Servers' | 'Network' | 'Maintenance' | 'Inventory' | 'Licenses' | 'Backups';
  read: boolean;
  actionUrl?: string;
}
