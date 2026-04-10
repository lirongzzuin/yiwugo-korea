/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validate Korean phone number
 * Accepts: 010-1234-5678, 01012345678, 010 1234 5678
 */
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s-]/g, '');
  return /^01[016789]\d{7,8}$/.test(cleaned);
}

/**
 * Validate Korean business registration number (사업자등록번호)
 * 10 digits with check digit validation
 */
export function isValidBusinessNumber(num: string): boolean {
  const cleaned = num.replace(/[-\s]/g, '');
  if (!/^\d{10}$/.test(cleaned)) return false;

  const digits = cleaned.split('').map(Number);
  const weights = [1, 3, 7, 1, 3, 7, 1, 3, 5];
  let sum = 0;

  for (let i = 0; i < 9; i++) {
    sum += digits[i] * weights[i];
  }

  // Add the tens digit of (8th digit * 5)
  sum += Math.floor((digits[8] * 5) / 10);

  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === digits[9];
}

/**
 * Validate Korean customs personal clearance code (개인통관고유부호)
 * Format: P + 12 digits
 */
export function isValidCustomsCode(code: string): boolean {
  return /^P\d{12}$/.test(code.toUpperCase());
}

/**
 * Validate password strength
 * Requirements: 8-16 chars, must contain letter, number, and special character
 */
export function isValidPassword(pw: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (pw.length < 8) errors.push('비밀번호는 8자 이상이어야 합니다.');
  if (pw.length > 16) errors.push('비밀번호는 16자 이하여야 합니다.');
  if (!/[a-zA-Z]/.test(pw)) errors.push('영문자를 포함해야 합니다.');
  if (!/\d/.test(pw)) errors.push('숫자를 포함해야 합니다.');
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(pw)) errors.push('특수문자를 포함해야 합니다.');

  return { valid: errors.length === 0, errors };
}
