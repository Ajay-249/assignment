/**
 * Payment Form Validation and Formatting Utilities
 */

/**
 * Validates a UPI ID (Virtual Payment Address - VPA)
 * Example valid UPI IDs: user@okhdfcbank, john.doe@paytm, 9876543210@ybl
 */
export function validateUPI(upiId: string): { isValid: boolean; error?: string } {
  const trimmed = upiId.trim();
  if (!trimmed) {
    return { isValid: false, error: 'UPI ID is required' };
  }

  // UPI pattern: prefix@bankHandle
  // Prefix: alphanumeric with dots, hyphens, underscores (min 2 chars)
  // Bank handle: letters and numbers (min 2 chars)
  const upiRegex = /^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z0-9]{2,}$/;

  if (!trimmed.includes('@')) {
    return { isValid: false, error: 'UPI ID must contain "@" (e.g., name@bank)' };
  }

  if (!upiRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'Invalid UPI ID format. Expected format: username@bank',
    };
  }

  return { isValid: true };
}

/**
 * Validates a card number using the Luhn Algorithm (Modulus 10 checksum)
 */
export function validateLuhn(cardNumber: string): boolean {
  const sanitized = cardNumber.replace(/\D/g, '');

  // Card numbers are typically between 12 and 19 digits (canonical examples from 11)
  if (sanitized.length < 11 || sanitized.length > 19) {
    return false;
  }

  let sum = 0;
  let shouldDouble = false;

  // Traverse from right to left
  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized.charAt(i), 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

/**
 * Detects card network based on standard IIN/BIN prefixes
 */
export function detectCardNetwork(
  cardNumber: string
): 'visa' | 'mastercard' | 'rupay' | 'amex' | 'unknown' {
  const sanitized = cardNumber.replace(/\D/g, '');

  if (/^4/.test(sanitized)) {
    return 'visa';
  }
  if (/^(5[1-5]|222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[01]\d|2720)/.test(sanitized)) {
    return 'mastercard';
  }
  if (/^(508[5-9]|60698|60699|607|608|6521[5-9]|652[2-9]|6530|6531)/.test(sanitized)) {
    return 'rupay';
  }
  if (/^3[47]/.test(sanitized)) {
    return 'amex';
  }

  return 'unknown';
}

/**
 * Formats a raw card number string into spaced chunks (e.g. "4532 1234 5678 9010")
 */
export function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 19);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

/**
 * Validates card expiry in MM/YY format against current month and year
 */
export function validateExpiry(
  expiry: string,
  referenceDate: Date = new Date()
): { isValid: boolean; error?: string } {
  const trimmed = expiry.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Expiry date is required' };
  }

  const match = trimmed.match(/^(\d{2})\/(\d{2})$/);
  if (!match) {
    return { isValid: false, error: 'Expiry format must be MM/YY' };
  }

  const month = parseInt(match[1], 10);
  const year2Digits = parseInt(match[2], 10);

  if (month < 1 || month > 12) {
    return { isValid: false, error: 'Month must be between 01 and 12' };
  }

  const fullYear = 2000 + year2Digits;
  const currentYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth() + 1; // 1-indexed

  if (fullYear < currentYear || (fullYear === currentYear && month < currentMonth)) {
    return { isValid: false, error: 'Card has expired' };
  }

  // Reject absurdly distant years (e.g. > 20 years in future)
  if (fullYear > currentYear + 25) {
    return { isValid: false, error: 'Invalid expiry year' };
  }

  return { isValid: true };
}

/**
 * Formats user input as MM/YY automatically
 */
export function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) {
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
  }
  return digits;
}

/**
 * Validates CVV / CVC
 */
export function validateCVV(
  cvv: string,
  isAmex = false
): { isValid: boolean; error?: string } {
  const digits = cvv.replace(/\D/g, '');
  const requiredLength = isAmex ? 4 : 3;

  if (!digits) {
    return { isValid: false, error: 'CVV is required' };
  }

  if (digits.length !== requiredLength) {
    return {
      isValid: false,
      error: `CVV must be ${requiredLength} digits`,
    };
  }

  return { isValid: true };
}
