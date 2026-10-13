import { describe, it, expect } from 'vitest';
import {
  validateUPI,
  validateLuhn,
  detectCardNetwork,
  validateExpiry,
  validateCVV,
} from '../lib/validators';

describe('UPI Validator (validateUPI)', () => {
  it('should accept valid standard UPI IDs', () => {
    expect(validateUPI('rahul@okhdfcbank').isValid).toBe(true);
    expect(validateUPI('9876543210@paytm').isValid).toBe(true);
    expect(validateUPI('merchant.store@ybl').isValid).toBe(true);
    expect(validateUPI('user_name-123@icici').isValid).toBe(true);
  });

  it('should reject empty or whitespace UPI ID', () => {
    const res = validateUPI('   ');
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('required');
  });

  it('should reject UPI ID without @ symbol', () => {
    const res = validateUPI('rahulbank');
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('@');
  });

  it('should reject UPI ID with invalid prefix or suffix structure', () => {
    expect(validateUPI('@bank').isValid).toBe(false);
    expect(validateUPI('user@').isValid).toBe(false);
    expect(validateUPI('a@b').isValid).toBe(false); // min 2 chars
    expect(validateUPI('user@@bank').isValid).toBe(false);
    expect(validateUPI('user name@bank').isValid).toBe(false); // space disallowed
  });
});

describe('Luhn Algorithm Card Validator (validateLuhn)', () => {
  it('should validate standard valid credit card numbers', () => {
    // Verified valid test cards
    expect(validateLuhn('79927398713')).toBe(true); // Canonical Wikipedia Luhn example
    expect(validateLuhn('4532 0151 1283 0366')).toBe(true); // Valid Visa test card
    expect(validateLuhn('4532015112830366')).toBe(true); // without spaces
    expect(validateLuhn('4012 8888 8888 1881')).toBe(true); // Valid Visa
  });

  it('should reject card numbers failing Luhn checksum', () => {
    // 79927398713 with check digit changed to 4 -> 79927398714
    expect(validateLuhn('79927398714')).toBe(false);
    expect(validateLuhn('4532015112830367')).toBe(false);
    expect(validateLuhn('4012888888881882')).toBe(false);
    expect(validateLuhn('0000000000000001')).toBe(false);
  });

  it('should reject cards that are too short or too long', () => {
    expect(validateLuhn('123456')).toBe(false);
    expect(validateLuhn('12345678901234567890123')).toBe(false);
  });

  it('should detect card networks correctly', () => {
    expect(detectCardNetwork('4532015000000008')).toBe('visa');
    expect(detectCardNetwork('5125233430109903')).toBe('mastercard');
    expect(detectCardNetwork('6521500000000001')).toBe('rupay');
    expect(detectCardNetwork('378282246310005')).toBe('amex');
  });
});

describe('Card Expiry Validator (validateExpiry)', () => {
  const mockNow = new Date('2026-10-15T00:00:00Z');

  it('should accept valid future expiry dates', () => {
    expect(validateExpiry('11/26', mockNow).isValid).toBe(true);
    expect(validateExpiry('12/28', mockNow).isValid).toBe(true);
    expect(validateExpiry('10/26', mockNow).isValid).toBe(true); // current month
  });

  it('should reject past expiry dates', () => {
    expect(validateExpiry('09/26', mockNow).isValid).toBe(false);
    expect(validateExpiry('12/25', mockNow).isValid).toBe(false);
    expect(validateExpiry('01/24', mockNow).isValid).toBe(false);
  });

  it('should reject invalid month numbers', () => {
    expect(validateExpiry('00/28', mockNow).isValid).toBe(false);
    expect(validateExpiry('13/28', mockNow).isValid).toBe(false);
  });

  it('should reject invalid string patterns', () => {
    expect(validateExpiry('1228', mockNow).isValid).toBe(false);
    expect(validateExpiry('abc', mockNow).isValid).toBe(false);
    expect(validateExpiry('', mockNow).isValid).toBe(false);
  });
});

describe('CVV Validator (validateCVV)', () => {
  it('should validate 3-digit CVV for standard cards', () => {
    expect(validateCVV('123').isValid).toBe(true);
    expect(validateCVV('999').isValid).toBe(true);
    expect(validateCVV('12').isValid).toBe(false);
    expect(validateCVV('1234').isValid).toBe(false);
  });

  it('should validate 4-digit CVV for Amex', () => {
    expect(validateCVV('1234', true).isValid).toBe(true);
    expect(validateCVV('123', true).isValid).toBe(false);
  });
});
