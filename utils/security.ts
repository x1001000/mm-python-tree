/**
 * Security utilities for password handling and rate limiting
 */

interface RateLimitState {
  attempts: number;
  lastAttemptTime: number;
  lockoutUntil: number;
}

// Store rate limit state per wish ID
const rateLimitMap = new Map<string, RateLimitState>();

/**
 * Timing-safe string comparison to prevent timing attacks
 * Always compares all characters even if an early mismatch is found
 *
 * @param a - First string
 * @param b - Second string
 * @returns true if strings are equal, false otherwise
 */
export function timingSafeEqual(a: string, b: string): boolean {
  // If lengths differ, still compare char-by-char to maintain constant time
  // Pad the shorter string with nulls for comparison
  const maxLen = Math.max(a.length, b.length);
  let mismatch = a.length !== b.length ? 1 : 0;

  for (let i = 0; i < maxLen; i++) {
    const charA = i < a.length ? a.charCodeAt(i) : 0;
    const charB = i < b.length ? b.charCodeAt(i) : 0;
    mismatch |= charA ^ charB;
  }

  return mismatch === 0;
}

/**
 * Check if a password attempt should be rate limited
 * Implements exponential backoff: 1s, 2s, 4s, 8s, 16s, etc.
 *
 * @param wishId - The ID of the wish being accessed
 * @returns Object with allowed status and wait time in ms
 */
export function checkRateLimit(wishId: string): { allowed: boolean; waitMs: number } {
  const now = Date.now();
  const state = rateLimitMap.get(wishId) || {
    attempts: 0,
    lastAttemptTime: 0,
    lockoutUntil: 0,
  };

  // Check if still locked out
  if (state.lockoutUntil > now) {
    return {
      allowed: false,
      waitMs: state.lockoutUntil - now,
    };
  }

  // Reset if it's been more than 5 minutes since last attempt
  if (now - state.lastAttemptTime > 5 * 60 * 1000) {
    state.attempts = 0;
  }

  return {
    allowed: true,
    waitMs: 0,
  };
}

/**
 * Record a failed password attempt and update rate limit state
 *
 * @param wishId - The ID of the wish being accessed
 * @returns The lockout duration in milliseconds
 */
export function recordFailedAttempt(wishId: string): number {
  const now = Date.now();
  const state = rateLimitMap.get(wishId) || {
    attempts: 0,
    lastAttemptTime: 0,
    lockoutUntil: 0,
  };

  state.attempts += 1;
  state.lastAttemptTime = now;

  // Exponential backoff: 2^(attempts-1) seconds
  // attempts: 1 -> 1s, 2 -> 2s, 3 -> 4s, 4 -> 8s, 5 -> 16s, etc.
  // Cap at 60 seconds
  const lockoutSeconds = Math.min(Math.pow(2, state.attempts - 1), 60);
  const lockoutMs = lockoutSeconds * 1000;
  state.lockoutUntil = now + lockoutMs;

  rateLimitMap.set(wishId, state);

  return lockoutMs;
}

/**
 * Reset rate limit state for a wish (called on successful authentication)
 *
 * @param wishId - The ID of the wish being accessed
 */
export function resetRateLimit(wishId: string): void {
  rateLimitMap.delete(wishId);
}

/**
 * Validate password strength
 * Requires at least 4 characters
 *
 * @param password - The password to validate
 * @returns Object with valid status and error message
 */
export function validatePasswordStrength(password: string): { valid: boolean; error?: string } {
  if (!password || password.length < 4) {
    return {
      valid: false,
      error: 'Password must be at least 4 characters',
    };
  }

  // Optional: Add more strength requirements here
  // e.g., require mix of letters and numbers, special characters, etc.

  return { valid: true };
}

/**
 * Sanitize text input to prevent XSS and injection attacks
 * Removes potentially dangerous characters and patterns
 *
 * @param input - The text to sanitize
 * @param maxLength - Maximum allowed length
 * @returns Sanitized text
 */
export function sanitizeTextInput(input: string, maxLength: number = 100): string {
  if (!input) return '';

  let sanitized = input
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove control characters (except newlines and tabs)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Normalize whitespace
    .trim()
    // Limit length
    .slice(0, maxLength);

  return sanitized;
}

/**
 * Validate text input for potentially dangerous content
 *
 * @param input - The text to validate
 * @param fieldName - Name of the field for error messages
 * @returns Object with valid status and error message
 */
export function validateTextInput(
  input: string,
  fieldName: string = 'Input'
): { valid: boolean; error?: string } {
  if (!input || !input.trim()) {
    return {
      valid: false,
      error: `${fieldName} is required`,
    };
  }

  // Check for suspicious patterns (HTML tags, scripts)
  const suspiciousPatterns = [
    /<script/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /javascript:/i,
    /on\w+\s*=/i, // Event handlers like onclick=
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(input)) {
      return {
        valid: false,
        error: `${fieldName} contains invalid characters`,
      };
    }
  }

  return { valid: true };
}
