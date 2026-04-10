/**
 * Simple MD5 hash for translation cache keys (non-cryptographic)
 * Pure JS implementation - no Node.js crypto dependency for cross-platform use
 */
export function hashText(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const chr = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  // Convert to hex and ensure positive
  const hex = (hash >>> 0).toString(16).padStart(8, '0');
  // Double-hash for better distribution
  let hash2 = 0;
  for (let i = text.length - 1; i >= 0; i--) {
    const chr = text.charCodeAt(i);
    hash2 = ((hash2 << 5) - hash2) + chr;
    hash2 |= 0;
  }
  const hex2 = (hash2 >>> 0).toString(16).padStart(8, '0');
  return `${hex}${hex2}`;
}

/**
 * Mask email address for display
 * "user@example.com" -> "u***r@example.com"
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

/**
 * Mask phone number for display
 * "01012345678" -> "010-****-5678"
 * "010-1234-5678" -> "010-****-5678"
 */
export function maskPhone(phone: string): string {
  const cleaned = phone.replace(/[\s-]/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-****-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-***-${cleaned.slice(6)}`;
  }
  return phone;
}

/**
 * Mask Korean name for display
 * "김철동" -> "김*동"
 * "김철" -> "김*"
 * "John" -> "J**n"
 */
export function maskName(name: string): string {
  if (name.length <= 1) return name;
  if (name.length === 2) return `${name[0]}*`;

  const first = name[0];
  const last = name[name.length - 1];
  const middle = '*'.repeat(name.length - 2);
  return `${first}${middle}${last}`;
}
