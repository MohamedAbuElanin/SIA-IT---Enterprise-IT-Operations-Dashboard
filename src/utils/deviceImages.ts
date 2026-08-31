import type { ITAsset, InventoryCategory } from '../types';

export const DEVICE_TYPE_IMAGES: Record<ITAsset['deviceType'], string> = {
  PC: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=400&q=80',
  Laptop: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80',
  Server: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=400&q=80',
  'Barcode Scanner': 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=400&q=80',
  'Rugged Terminal': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
  Printer: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=400&q=80',
  'POS Terminal': 'https://images.unsplash.com/photo-1556742049-0a670f4a4591?auto=format&fit=crop&w=400&q=80',
};

export const INVENTORY_CATEGORY_IMAGES: Record<InventoryCategory, string> = {
  PC: DEVICE_TYPE_IMAGES.PC,
  Laptop: DEVICE_TYPE_IMAGES.Laptop,
  Monitor: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=400&q=80',
  Printer: DEVICE_TYPE_IMAGES.Printer,
  Keyboard: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=400&q=80',
  Mouse: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=400&q=80',
  UPS: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&q=80',
  Router: 'https://images.unsplash.com/photo-1606900115073-7c82f5a7c6e8?auto=format&fit=crop&w=400&q=80',
  Switch: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=400&q=80',
  'Access Point': 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=400&q=80',
  Server: DEVICE_TYPE_IMAGES.Server,
  Camera: 'https://images.unsplash.com/photo-1557324232-8996a9b0364d?auto=format&fit=crop&w=400&q=80',
  DVR: 'https://images.unsplash.com/photo-1593359671507-587587a1ddfa?auto=format&fit=crop&w=400&q=80',
};

export function getDeviceImage(type: ITAsset['deviceType']): string {
  return DEVICE_TYPE_IMAGES[type];
}

export function getInventoryCategoryImage(category: InventoryCategory): string {
  return INVENTORY_CATEGORY_IMAGES[category];
}
