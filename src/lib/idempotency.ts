/**
 * Client-Side Idempotency and Session Recovery Manager
 * Ensures that accidental rapid taps or page reloads preserve the in-flight state
 * and reuse the idempotency key for the same payment attempt.
 */

const STORAGE_KEY_PREFIX = 'checkout_idempotency_';
const PENDING_PAYMENT_PREFIX = 'checkout_pending_';

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Gets the current in-flight or current-attempt idempotency key for an order,
 * creating a new one if not yet initialized.
 */
export function getOrCreateAttemptKey(orderId: string): string {
  if (typeof window === 'undefined') return generateUUID();

  const key = `${STORAGE_KEY_PREFIX}${orderId}`;
  let existing = sessionStorage.getItem(key);
  if (!existing) {
    existing = `idem_${orderId}_${generateUUID()}`;
    sessionStorage.setItem(key, existing);
  }
  return existing;
}

/**
 * Creates a brand-new idempotency key when the user explicitly clicks "Try Again"
 * after a terminal failure.
 */
export function renewAttemptKey(orderId: string): string {
  if (typeof window === 'undefined') return generateUUID();

  const key = `${STORAGE_KEY_PREFIX}${orderId}`;
  const newKey = `idem_${orderId}_${generateUUID()}`;
  sessionStorage.setItem(key, newKey);
  return newKey;
}

export function clearAttemptKey(orderId: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(`${STORAGE_KEY_PREFIX}${orderId}`);
}

/**
 * Persist active PENDING payment ID so refreshing the tab resumes status check
 */
export function savePendingPaymentSession(
  orderId: string,
  paymentId: string,
  idempotencyKey: string
): void {
  if (typeof window === 'undefined') return;

  const data = JSON.stringify({
    paymentId,
    idempotencyKey,
    timestamp: Date.now(),
  });
  localStorage.setItem(`${PENDING_PAYMENT_PREFIX}${orderId}`, data);
}

export function getPendingPaymentSession(
  orderId: string
): { paymentId: string; idempotencyKey: string; timestamp: number } | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(`${PENDING_PAYMENT_PREFIX}${orderId}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearPendingPaymentSession(orderId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(`${PENDING_PAYMENT_PREFIX}${orderId}`);
}
