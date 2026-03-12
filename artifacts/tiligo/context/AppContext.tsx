import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = 'customer' | 'store' | 'delivery';

export interface CartItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  storeId: number;
  storeName: string;
}

export interface StoreUser {
  id: number;
  name: string;
  businessNumber: string;
  category: string;
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
}

export interface DeliveryUser {
  id: number;
  name: string;
  idNumber: string;
  phone: string;
  vehicleType: string;
  isActive: boolean;
  totalDeliveries: number;
}

interface AppContextValue {
  role: UserRole;
  setRole: (role: UserRole) => void;
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  storeUser: StoreUser | null;
  setStoreUser: (user: StoreUser | null) => void;
  deliveryUser: DeliveryUser | null;
  setDeliveryUser: (user: DeliveryUser | null) => void;
  notificationCount: number;
  setNotificationCount: (count: number) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>('customer');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [storeUser, setStoreUserState] = useState<StoreUser | null>(null);
  const [deliveryUser, setDeliveryUserState] = useState<DeliveryUser | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const savedCart = await AsyncStorage.getItem('cart');
        if (savedCart) setCart(JSON.parse(savedCart));
        const savedRole = await AsyncStorage.getItem('role') as UserRole;
        if (savedRole) setRoleState(savedRole);
        const savedStore = await AsyncStorage.getItem('storeUser');
        if (savedStore) setStoreUserState(JSON.parse(savedStore));
        const savedDriver = await AsyncStorage.getItem('deliveryUser');
        if (savedDriver) setDeliveryUserState(JSON.parse(savedDriver));
      } catch (e) {}
    };
    load();
  }, []);

  const setRole = async (r: UserRole) => {
    setRoleState(r);
    await AsyncStorage.setItem('role', r);
  };

  const setStoreUser = async (user: StoreUser | null) => {
    setStoreUserState(user);
    if (user) await AsyncStorage.setItem('storeUser', JSON.stringify(user));
    else await AsyncStorage.removeItem('storeUser');
  };

  const setDeliveryUser = async (user: DeliveryUser | null) => {
    setDeliveryUserState(user);
    if (user) await AsyncStorage.setItem('deliveryUser', JSON.stringify(user));
    else await AsyncStorage.removeItem('deliveryUser');
  };

  const addToCart = async (item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.productId === item.productId);
      let newCart: CartItem[];
      if (existing) {
        newCart = prev.map(c => c.productId === item.productId ? { ...c, quantity: c.quantity + 1 } : c);
      } else {
        if (prev.length > 0 && prev[0].storeId !== item.storeId) {
          newCart = [item];
        } else {
          newCart = [...prev, item];
        }
      }
      AsyncStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const removeFromCart = async (productId: number) => {
    setCart(prev => {
      const newCart = prev.filter(c => c.productId !== productId);
      AsyncStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    setCart(prev => {
      let newCart: CartItem[];
      if (quantity <= 0) {
        newCart = prev.filter(c => c.productId !== productId);
      } else {
        newCart = prev.map(c => c.productId === productId ? { ...c, quantity } : c);
      }
      AsyncStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const clearCart = async () => {
    setCart([]);
    await AsyncStorage.removeItem('cart');
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const value = useMemo(() => ({
    role, setRole,
    cart, addToCart, removeFromCart, updateQuantity, clearCart,
    cartTotal, cartCount,
    storeUser, setStoreUser,
    deliveryUser, setDeliveryUser,
    notificationCount, setNotificationCount,
  }), [role, cart, storeUser, deliveryUser, notificationCount]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
