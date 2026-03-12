const BASE_URL = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`
  : '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ndodhi një gabim');
  return data as T;
}

export interface Store {
  id: number;
  name: string;
  description?: string;
  category: string;
  businessNumber: string;
  address: string;
  city: string;
  phone: string;
  imageUrl?: string;
  coverImageUrl?: string;
  rating: number;
  deliveryTime?: string;
  minOrder: number;
  deliveryFee: number;
  isOpen: boolean;
  isDemo: boolean;
  createdAt: string;
}

export interface Product {
  id: number;
  storeId: number;
  name: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string;
  isAvailable: boolean;
  createdAt: string;
}

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  storeId: number;
  storeName: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  totalAmount: number;
  deliveryFee: number;
  status: string;
  driverId?: number;
  estimatedDeliveryTime?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryDriver {
  id: number;
  name: string;
  idNumber: string;
  phone: string;
  vehicleType: string;
  isActive: boolean;
  totalDeliveries: number;
  createdAt: string;
}

export interface Notification {
  id: number;
  userId: string;
  userType: string;
  title: string;
  message: string;
  type: string;
  orderId?: number;
  isRead: boolean;
  createdAt: string;
}

export const api = {
  seed: () => request<{ success: boolean; message: string }>('/seed', { method: 'POST' }),

  getStores: (params?: { category?: string; search?: string }) => {
    const q = params ? new URLSearchParams(params as any).toString() : '';
    return request<Store[]>(`/stores${q ? '?' + q : ''}`);
  },
  getStore: (id: number) => request<Store>(`/stores/${id}`),
  registerStore: (body: any) => request<Store>('/stores', { method: 'POST', body: JSON.stringify(body) }),
  loginStore: (businessNumber: string, password: string) =>
    request<Store>('/stores/login', { method: 'POST', body: JSON.stringify({ businessNumber, password }) }),

  getStoreProducts: (storeId: number) => request<Product[]>(`/stores/${storeId}/products`),
  createProduct: (storeId: number, body: any) =>
    request<Product>(`/stores/${storeId}/products`, { method: 'POST', body: JSON.stringify(body) }),
  updateProduct: (storeId: number, productId: number, body: any) =>
    request<Product>(`/stores/${storeId}/products/${productId}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteProduct: (storeId: number, productId: number) =>
    request<{ success: boolean }>(`/stores/${storeId}/products/${productId}`, { method: 'DELETE' }),

  getStoreOrders: (storeId: number, status?: string) =>
    request<Order[]>(`/stores/${storeId}/orders${status ? '?status=' + status : ''}`),

  createOrder: (body: any) => request<Order>('/orders', { method: 'POST', body: JSON.stringify(body) }),
  getOrder: (id: number) => request<Order>(`/orders/${id}`),
  updateOrderStatus: (orderId: number, status: string, estimatedDeliveryTime?: string) =>
    request<Order>(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, estimatedDeliveryTime }),
    }),

  registerDelivery: (body: any) => request<DeliveryDriver>('/delivery/register', { method: 'POST', body: JSON.stringify(body) }),
  loginDelivery: (idNumber: string, password: string) =>
    request<DeliveryDriver>('/delivery/login', { method: 'POST', body: JSON.stringify({ idNumber, password }) }),
  getAvailableOrders: (driverId: number) => request<Order[]>(`/delivery/${driverId}/orders`),
  acceptOrder: (driverId: number, orderId: number) =>
    request<Order>(`/delivery/${driverId}/accept/${orderId}`, { method: 'POST' }),
  getDriverActiveOrders: (driverId: number) => request<Order[]>(`/delivery/${driverId}/active`),

  getNotifications: (userId: string, userType: string) =>
    request<Notification[]>(`/notifications/${userId}?userType=${userType}`),
  markNotificationRead: (id: number) =>
    request<{ success: boolean }>(`/notifications/${id}/read`, { method: 'PATCH' }),
};
