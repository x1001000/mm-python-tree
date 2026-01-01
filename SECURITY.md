# Security Policy

## Overview

This document outlines the security considerations, known vulnerabilities, and best practices for the MM Python Tree application.

**⚠️ IMPORTANT: This is a demo application with intentional security limitations. It is NOT production-ready and should NOT be used with sensitive data or real user information.**

## Known Security Limitations

### Critical Issues

#### 1. API Key Exposure in Client Bundle
- **Issue**: The `GEMINI_API_KEY` and `VITE_JSONBIN_API_KEY` are bundled into the client-side JavaScript
- **Risk**: Anyone can extract these keys from browser DevTools or source code
- **Impact**: API key abuse, unauthorized API access, potential billing issues
- **Mitigation for Production**:
  - Move all API keys to a backend server
  - Use environment variables only on the server side
  - Implement API proxies to hide credentials from the client
  - Use API key rotation and rate limiting

#### 2. Plaintext Password Storage
- **Issue**: Wish passwords are stored in plaintext in browser localStorage
- **Risk**: Passwords can be extracted via DevTools, XSS attacks, or physical access
- **Impact**: Unauthorized access to protected wishes
- **Current State**: Passwords are stored without any encryption or hashing
- **Mitigation for Production**:
  - Implement server-side password hashing (bcrypt, Argon2, or scrypt)
  - Never store passwords in localStorage
  - Use secure, HTTP-only cookies for session management
  - Implement proper user authentication system

#### 3. Client-Side Only Security
- **Issue**: All authentication and authorization happens client-side
- **Risk**: Can be bypassed using browser DevTools
- **Impact**: Anyone can modify, delete, or access any wish
- **Mitigation for Production**:
  - Implement server-side authentication and authorization
  - Validate all operations on the server
  - Use JWT or session-based authentication

### High Priority Issues

#### 4. No Subresource Integrity (SRI) for External Resources
- **Issue**: External resources loaded from CDNs without integrity checks
- **Risk**: Man-in-the-middle attacks could inject malicious code
- **Affected Resources**:
  - Tailwind CSS (`https://cdn.tailwindcss.com`)
  - Google Fonts (`https://fonts.googleapis.com`)
  - esm.sh imports (React, Lucide, etc.)
- **Mitigation for Production**:
  - Add SRI hashes to all external scripts and styles
  - Self-host critical dependencies
  - Use lock files and fixed versions
  - Implement Content Security Policy (CSP) - ✅ Partially implemented

#### 5. HTTPS Enforcement
- **Issue**: No HSTS headers or strict HTTPS enforcement
- **Risk**: Potential downgrade attacks
- **Mitigation for Production**:
  - Add HSTS headers
  - Redirect all HTTP to HTTPS
  - Use HTTPS-only cookies

## Implemented Security Measures

The following security improvements have been implemented in this demo:

### ✅ 1. Timing-Safe Password Comparison
- **File**: `utils/security.ts:timingSafeEqual()`
- **Purpose**: Prevents timing attacks on password comparison
- **Implementation**: Constant-time string comparison that always checks all characters

### ✅ 2. Rate Limiting for Password Attempts
- **Files**: `utils/security.ts`, `components/WishCard.tsx`
- **Purpose**: Prevents brute force attacks on passwords
- **Implementation**: Exponential backoff (1s, 2s, 4s, 8s, 16s, etc.) after failed attempts
- **Max Lockout**: 60 seconds
- **Reset**: 5 minutes of inactivity

### ✅ 3. Information Disclosure Prevention
- **File**: `components/WishCard.tsx`
- **Change**: Error message changed from "Wrong password" to "Authentication failed"
- **Purpose**: Prevents enumeration of which wishes have passwords

### ✅ 4. Content Security Policy (CSP)
- **File**: `index.html`
- **Implementation**: Meta tag with restrictive CSP
- **Restrictions**:
  - Scripts only from self and trusted CDNs
  - No inline event handlers
  - No frames or objects
  - Upgrade insecure requests
  - Form submissions only to self

### ✅ 5. Input Validation and Sanitization
- **File**: `utils/security.ts`, `components/WishModal.tsx`
- **Validations**:
  - HTML/script tag detection
  - Event handler pattern detection
  - Control character removal
  - Length limits enforcement
  - Required field validation
- **Sanitization**:
  - Null byte removal
  - Control character stripping
  - Whitespace normalization

### ✅ 6. Password Strength Requirements
- **File**: `utils/security.ts:validatePasswordStrength()`
- **Requirement**: Minimum 4 characters
- **UI**: Real-time validation with error messages
- **Note**: Can be enhanced with complexity requirements

### ✅ 7. API Response Validation
- **File**: `services/wishesApi.ts`
- **Validations**:
  - Type checking for all wish properties
  - Range validation (x, y coordinates: 0-100)
  - Length validation (message: ≤100, author: ≤20)
  - Array structure validation
  - Timestamp validation
- **Behavior**: Invalid wishes are filtered out and logged

## Security Best Practices for Production

If you plan to deploy this application to production, you MUST address the following:

### 1. Backend Implementation
```
✅ Implement a backend server (Node.js, Python, etc.)
✅ Move all API keys to server environment variables
✅ Implement server-side authentication
✅ Use database instead of localStorage
✅ Hash passwords with bcrypt/Argon2 (cost factor 12+)
```

### 2. Authentication & Authorization
```
✅ Implement user registration/login system
✅ Use JWT or session cookies (HTTP-only, Secure, SameSite=Strict)
✅ Add email verification
✅ Implement password reset flow
✅ Add 2FA/MFA support
✅ Rate limit login attempts
```

### 3. Infrastructure Security
```
✅ Use HTTPS everywhere (with HSTS headers)
✅ Set up Web Application Firewall (WAF)
✅ Implement DDoS protection
✅ Add security headers (CSP, X-Frame-Options, etc.)
✅ Regular security audits and dependency updates
✅ Implement logging and monitoring
```

### 4. Data Security
```
✅ Encrypt sensitive data at rest
✅ Encrypt data in transit (TLS 1.3)
✅ Implement data retention policies
✅ Add GDPR compliance (if applicable)
✅ Implement backup and disaster recovery
```

### 5. Dependency Management
```
✅ Use package-lock.json or yarn.lock
✅ Regular dependency audits (npm audit, Snyk)
✅ Keep dependencies up to date
✅ Remove unused dependencies
✅ Use Dependabot or Renovate
```

## Reporting Security Vulnerabilities

If you discover a security vulnerability in this demo application, please:

1. **DO NOT** open a public GitHub issue
2. Email the maintainer directly (if this were a real project)
3. Provide detailed information about the vulnerability
4. Allow reasonable time for a fix before public disclosure

## Security Testing

For testing purposes, you can verify the security measures:

### Test Rate Limiting
1. Create a password-protected wish
2. Try to edit/delete with wrong password
3. Observe exponential backoff (1s, 2s, 4s, 8s, etc.)

### Test Input Validation
1. Try entering HTML tags in wish message: `<script>alert('XSS')</script>`
2. Should show error: "Wish message contains invalid characters"
3. Try very short password (< 4 chars)
4. Should show error: "Password must be at least 4 characters"

### Test Password Security
1. Create wish with password
2. Open DevTools → Application → Local Storage
3. You'll see the password in plaintext (demonstrating the vulnerability)

## Changelog

### Security Improvements (Current Version)
- Added timing-safe password comparison
- Implemented rate limiting with exponential backoff
- Added input validation and sanitization
- Implemented password strength requirements
- Added API response validation
- Added Content Security Policy headers
- Fixed information disclosure in error messages
- Added comprehensive security documentation

## License

This security policy is provided as-is for educational and demonstration purposes only.

---

**Last Updated**: 2026-01-01
**Version**: 1.0.0
