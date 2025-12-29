import { db } from '../utils/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';

export interface Coupon {
  code: string; // Código visible para el cliente
  userId: string; // Usuario al que pertenece el cupón
  discountPercent: number; // % de descuento sobre el total del pedido
  isActive: boolean; // Si puede usarse aún
  used: boolean; // Si ya fue usado
  createdAt: string; // ISO string
  usedAt?: string; // ISO string
  source: 'manual' | 'auto'; // Cómo se creó
  autoMultiple?: number; // Múltiplo de pedidos que disparó el cupón (si aplica)
}

export interface AutoCouponConfig {
  isActive: boolean;
  orderMultiple: number; // cada cuántos pedidos se genera (ej: 4 para pruebas, 10 en producción)
  discountPercent: number; // % de descuento para cupones automáticos
  updatedAt: string;
}

const COUPONS_COLLECTION = 'coupons';
const COUPON_CONFIG_DOC = 'publicConfig/couponsAutoConfig';

const generateRandomCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `CP-${code}`;
};

export const couponService = {
  async getAutoConfig(): Promise<AutoCouponConfig | null> {
    const ref = doc(db, COUPON_CONFIG_DOC);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const data = snap.data() as Partial<AutoCouponConfig>;
    const orderMultiple = typeof data.orderMultiple === 'number' && data.orderMultiple > 0
      ? data.orderMultiple
      : 4; // valor inicial por defecto, luego solo se cambia desde la página de Beneficios
    const discountPercent = typeof data.discountPercent === 'number' && data.discountPercent > 0
      ? data.discountPercent
      : 25;

    return {
      isActive: !!data.isActive,
      orderMultiple,
      discountPercent,
      updatedAt: data.updatedAt || new Date().toISOString(),
    };
  },

  async saveAutoConfig(config: AutoCouponConfig): Promise<void> {
    const ref = doc(db, COUPON_CONFIG_DOC);
    await setDoc(ref, {
      ...config,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  },

  async createCouponForUser(params: {
    userId: string;
    discountPercent: number;
    source: 'manual' | 'auto';
    autoMultiple?: number;
  }): Promise<Coupon> {
    const nowIso = new Date().toISOString();
    const baseCoupon: Coupon = {
      code: generateRandomCode(),
      userId: params.userId,
      discountPercent: Math.min(90, Math.max(1, params.discountPercent)),
      isActive: true,
      used: false,
      createdAt: nowIso,
      source: params.source,
    };

    const coupon: Coupon =
      typeof params.autoMultiple === 'number'
        ? { ...baseCoupon, autoMultiple: params.autoMultiple }
        : baseCoupon;

    const ref = doc(collection(db, COUPONS_COLLECTION), coupon.code);
    await setDoc(ref, {
      ...coupon,
      createdAt: nowIso,
      firestoreCreatedAt: serverTimestamp(),
    });

    return coupon;
  },

  async listUserCoupons(userId: string): Promise<Coupon[]> {
    const q = query(
      collection(db, COUPONS_COLLECTION),
      where('userId', '==', userId),
    );
    const snap = await getDocs(q);
    const list: Coupon[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data() as Coupon;
      list.push(data);
    });

    // ordenar por fecha de creación descendente
    return list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  },

  async getCouponByCode(code: string): Promise<Coupon | null> {
    const ref = doc(db, COUPONS_COLLECTION, code.trim());
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return snap.data() as Coupon;
  },

  // Validar y marcar como usado un cupón en una sola transacción
  async redeemCouponOnce(code: string, userId: string): Promise<Coupon | null> {
    const ref = doc(db, COUPONS_COLLECTION, code.trim());

    return runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists()) return null;

      const data = snap.data() as Coupon;
      if (!data.isActive || data.used) return null;
      if (data.userId !== userId) return null;

      const nowIso = new Date().toISOString();

      const updated: Coupon = {
        ...data,
        used: true,
        isActive: false,
        usedAt: nowIso,
      };

      tx.update(ref, {
        used: true,
        isActive: false,
        usedAt: nowIso,
      });

      return updated;
    });
  },
};
