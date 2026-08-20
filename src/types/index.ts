export type Role = 'ADMIN' | 'WHOLESALER';

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: Role;
  companyName?: string | null;
  taxId?: string | null;
  phone?: string | null;
  priceListId?: string | null;
  priceList?: PriceList | null;
  isActive: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  headerColor: string;
  description?: string | null;
  sortOrder: number;
  products?: Product[];
}

export interface ProductPrice {
  id: string;
  productId: string;
  priceListId: string;
  currency: string;
  priceTier1: number;
  priceTier2?: number | null;
  priceTier3?: number | null;
  validFrom: string;
  validUntil?: string | null;
  isActive: boolean;
  updatedAt: string;
  priceList?: PriceList;
  updatedBy?: {
    id: string;
    name: string;
    username: string;
  } | null;
}

export interface Product {
  id: string;
  brand: string;      // Marca
  model: string;      // Modelo
  capacity: string;   // RAM + GB (ej: 4+128GB)
  imageUrl?: string | null; // Foto
  inActiveList: boolean; // Si está en la lista activa visible para clientes
  sku: string;
  stock: number;
  isActive: boolean;
  categoryId: string;
  sortOrder: number;
  category?: Category;
  prices?: ProductPrice[];
  currentPrice?: ProductPrice;
  createdAt: string;
  updatedAt: string;
}

export interface PriceList {
  id: string;
  name: string;
  description?: string | null;
  isDefault: boolean;
  currency: string;
  validFrom: string;
  validUntil?: string | null;
  isActive: boolean;
}

export interface PriceAuditLog {
  id: string;
  productId: string;
  productPriceId?: string | null;
  userId?: string | null;
  action: string;
  oldData?: string | null;
  newData?: string | null;
  reason?: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    username: string;
  } | null;
  product?: {
    id: string;
    brand: string;
    model: string;
    capacity: string;
    sku: string;
  } | null;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  companyName?: string | null;
  phone?: string | null;
  notes?: string | null;
  currency: string;
  totalAmount: number;
  totalUnits: number;
  status: 'PENDING' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  items?: QuoteItem[];
  user?: User;
}

export interface QuoteItem {
  id: string;
  quoteId: string;
  productId: string;
  productName: string;
  brand: string;
  model: string;
  capacity: string;
  color?: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  tierApplied: string;
}
