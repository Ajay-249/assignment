import { Order, PaymentRecord } from '@/types/checkout';

// Standard mock orders
const INITIAL_ORDERS: Record<string, Order> = {
  'order_149900': {
    id: 'order_149900',
    merchantName: 'Acme Outfitters & Co.',
    merchantLogo: '🛍️',
    items: [
      {
        id: 'item_1',
        name: 'Organic Cotton Oxford Shirt',
        quantity: 1,
        pricePaise: 99900, // ₹999.00
      },
      {
        id: 'item_2',
        name: 'Woven Canvas Tote Bag',
        quantity: 1,
        pricePaise: 35000, // ₹350.00
      },
      {
        id: 'item_3',
        name: 'Express Shipping & Packaging',
        quantity: 1,
        pricePaise: 15000, // ₹150.00
      },
    ],
    subtotalPaise: 134900,
    deliveryPaise: 15000,
    taxPaise: 0,
    totalPaise: 149900, // ₹1,499.00 (as mentioned in prompt: 149900 = ₹1,499)
    currency: 'INR',
    createdAt: new Date().toISOString(),
  },
  'order_demo': {
    id: 'order_demo',
    merchantName: 'TechGizmo Electronics',
    merchantLogo: '⚡',
    items: [
      {
        id: 'item_101',
        name: 'Wireless Noise Cancelling Earbuds',
        quantity: 1,
        pricePaise: 249900, // ₹2,499.00
      },
      {
        id: 'item_102',
        name: 'USB-C Braided Fast Cable',
        quantity: 2,
        pricePaise: 50000, // ₹500.00
      },
    ],
    subtotalPaise: 299900,
    deliveryPaise: 0,
    taxPaise: 0,
    totalPaise: 299900, // ₹2,999.00
    currency: 'INR',
    createdAt: new Date().toISOString(),
  },
};

interface GlobalPaymentState {
  idempotencyMap: Map<string, PaymentRecord>;
  paymentsById: Map<string, PaymentRecord>;
  orders: Map<string, Order>;
}

declare global {
  // eslint-disable-next-line no-var
  var __mockCheckoutState: GlobalPaymentState | undefined;
}

if (!globalThis.__mockCheckoutState) {
  const ordersMap = new Map<string, Order>();
  for (const [key, val] of Object.entries(INITIAL_ORDERS)) {
    ordersMap.set(key, val);
  }

  globalThis.__mockCheckoutState = {
    idempotencyMap: new Map<string, PaymentRecord>(),
    paymentsById: new Map<string, PaymentRecord>(),
    orders: ordersMap,
  };
}

const db = globalThis.__mockCheckoutState;

export function getOrder(orderId: string): Order {
  const existing = db.orders.get(orderId);
  if (existing) {
    return existing;
  }

  // If orderId starts with order_149900 (e.g. order_149900_9281), clone Acme Outfitters cart
  if (orderId.startsWith('order_149900')) {
    const acmeBase = INITIAL_ORDERS['order_149900'];
    const clonedAcme: Order = {
      ...acmeBase,
      id: orderId,
      items: acmeBase.items.map((it, idx) => ({ ...it, id: `item_${orderId}_${idx + 1}` })),
      createdAt: new Date().toISOString(),
    };
    db.orders.set(orderId, clonedAcme);
    return clonedAcme;
  }

  // If orderId starts with order_demo (e.g. order_demo_8391), clone TechGizmo cart
  if (orderId.startsWith('order_demo')) {
    const demoBase = INITIAL_ORDERS['order_demo'];
    const clonedDemo: Order = {
      ...demoBase,
      id: orderId,
      items: demoBase.items.map((it, idx) => ({ ...it, id: `item_${orderId}_${idx + 1}` })),
      createdAt: new Date().toISOString(),
    };
    db.orders.set(orderId, clonedDemo);
    return clonedDemo;
  }

  // Dynamic realistic orders for arbitrary order IDs
  const sampleMerchants = [
    { name: 'Croma Electronics Hub', logo: '📱', item: 'True Wireless Earphones & Cable', paise: 249900 },
    { name: 'FabIndia Crafts & Living', logo: '🧵', item: 'Handcrafted Indigo Kurta & Stole', paise: 185000 },
    { name: 'Gourmet Kitchen Mart', logo: '🍳', item: 'Cast Iron Skillet & Seasoning Set', paise: 129900 },
    { name: 'Urban Tribe Gear', logo: '🎒', item: 'All-Weather Tech Backpack', paise: 219900 },
    { name: 'Metro Retail Mart', logo: '🏪', item: 'Organic Pantry Essentials Kit', paise: 149900 },
  ];

  // Pick deterministic or hash-based merchant from orderId
  const charCodeSum = orderId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const selected = sampleMerchants[charCodeSum % sampleMerchants.length];

  const generatedOrder: Order = {
    id: orderId,
    merchantName: selected.name,
    merchantLogo: selected.logo,
    items: [
      {
        id: `item_${orderId}_1`,
        name: selected.item,
        quantity: 1,
        pricePaise: selected.paise,
      },
    ],
    subtotalPaise: selected.paise,
    deliveryPaise: 0,
    taxPaise: 0,
    totalPaise: selected.paise,
    currency: 'INR',
    createdAt: new Date().toISOString(),
  };

  db.orders.set(orderId, generatedOrder);
  return generatedOrder;
}

export function resetPaymentsForOrder(orderId: string): void {
  for (const [key, record] of Array.from(db.idempotencyMap.entries())) {
    if (record.orderId === orderId) {
      db.idempotencyMap.delete(key);
    }
  }
  for (const [paymentId, record] of Array.from(db.paymentsById.entries())) {
    if (record.orderId === orderId) {
      db.paymentsById.delete(paymentId);
    }
  }
}

export function findPaymentByIdempotencyKey(key: string): PaymentRecord | undefined {
  return db.idempotencyMap.get(key);
}

export function findPaymentById(paymentId: string): PaymentRecord | undefined {
  return db.paymentsById.get(paymentId);
}

export function savePayment(record: PaymentRecord): void {
  db.idempotencyMap.set(record.idempotencyKey, record);
  db.paymentsById.set(record.paymentId, record);
}

/**
 * Returns updated payment record, transitioning PENDING to SUCCESS or FAILED after ~5s
 */
export function getUpdatedPaymentStatus(paymentId: string): PaymentRecord | undefined {
  const record = db.paymentsById.get(paymentId);
  if (!record) return undefined;

  // A PENDING payment becomes SUCCESS or FAILED after ~5 s (5000ms)
  if (record.status === 'PENDING') {
    const elapsed = Date.now() - record.createdAt;
    if (elapsed >= 5000) {
      // Transition to final status
      record.status = record.finalStatus || 'SUCCESS';
      record.completedAt = Date.now();
      if (record.status === 'FAILED' && !record.reason) {
        record.reason = 'Bank network timed out during multi-hop verification.';
      }
      savePayment(record);
    }
  }

  return record;
}

export function getAllPayments(): PaymentRecord[] {
  return Array.from(db.paymentsById.values())
    .map((p) => getUpdatedPaymentStatus(p.paymentId) || p)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function findLatestPaymentForOrder(orderId: string): PaymentRecord | undefined {
  const records = Array.from(db.paymentsById.values()).filter((p) => p.orderId === orderId);
  if (records.length === 0) return undefined;
  return records
    .map((p) => getUpdatedPaymentStatus(p.paymentId) || p)
    .sort((a, b) => b.createdAt - a.createdAt)[0];
}
