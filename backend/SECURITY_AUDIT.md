# BrewBuddy Backend Security Audit Report

**Audit Date:** June 15, 2026  
**Auditor:** Sentinel (CISO)  
**Scope:** Backend source code at `/mnt/c/Users/phili/workspace/brewbuddy/backend/`

---

## Executive Summary

The BrewBuddy backend demonstrates **moderate security posture** with several critical vulnerabilities that require immediate attention. While some security best practices are implemented (bcrypt hashing, JWT authentication, input validation), significant gaps exist in API security, secret management, and error handling.

### Findings by Severity

| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | 1 | Requires Immediate Fix |
| HIGH | 5 | Requires Fix Before Production |
| MEDIUM | 8 | Should Be Fixed |
| LOW | 4 | Recommended Improvements |
| **Total** | **18** | |

---

## CRITICAL Findings

### 1. Hardcoded JWT Fallback Secret
**Severity:** CRITICAL  
**Location:** `src/utils/generateToken.ts:4`

```typescript
const getJWTSecret = (): string => process.env.JWT_SECRET || 'fallback-secret';
```

**Description:** The application uses a hardcoded string `'fallback-secret'` as a JWT secret when the `JWT_SECRET` environment variable is not set. This is a critical vulnerability that allows attackers to forge arbitrary JWT tokens.

**Impact:** 
- Complete authentication bypass
- Account takeover
- Data breach

**Remediation:**
```typescript
const getJWTSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return secret;
};
```

---

## HIGH Findings

### 2. CORS Allows All Origins
**Severity:** HIGH  
**Location:** `src/index.ts:17`

```typescript
app.use(cors());
```

**Description:** CORS middleware is configured without restrictions, allowing requests from any origin.

**Impact:**
- Cross-site request forgery
- Data exfiltration from authenticated users
- Session hijacking

**Remediation:**
```typescript
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

---

### 3. No Rate Limiting
**Severity:** HIGH  
**Location:** `src/index.ts` (global)

**Description:** No rate limiting middleware is applied to any endpoints, including authentication routes.

**Impact:**
- Brute force attacks on login
- Credential stuffing
- Denial of service

**Remediation:** Install and configure `express-rate-limit`:
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts per 15 minutes
  message: 'Too many login attempts',
});

app.use(limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
```

---

### 4. Missing Security Headers
**Severity:** HIGH  
**Location:** `src/index.ts` (global)

**Description:** No security headers middleware (helmet) is configured.

**Impact:**
- Clickjacking attacks
- MIME type sniffing
- XSS attacks
- Information leakage

**Remediation:** Install and configure `helmet`:
```typescript
import helmet from 'helmet';

app.use(helmet());
```

---

### 5. Mass Assignment Vulnerability
**Severity:** HIGH  
**Location:** `src/routes/recipes.ts:752-753`

```typescript
const updatedFields = req.body;
Object.assign(recipe, updatedFields);
```

**Description:** The recipe update endpoint directly assigns all request body fields to the recipe object without filtering, allowing users to modify protected fields like `userId`, `createdAt`, `averageRating`, etc.

**Impact:**
- Privilege escalation
- Data integrity compromise
- Rating manipulation

**Remediation:**
```typescript
const allowedUpdates = [
  'recipeName', 'style', 'styleCode', 'method', 'batchSize',
  'batchSizeUnit', 'boilTimeMinutes', 'efficiency', 'isPublic', 'notes'
];

const updates = Object.keys(req.body)
  .filter(key => allowedUpdates.includes(key))
  .reduce((obj, key) => {
    obj[key] = req.body[key];
    return obj;
  }, {} as Record<string, any>);

Object.assign(recipe, updates);
```

---

### 6. Regex Injection in Search Queries
**Severity:** HIGH  
**Location:** `src/routes/recipes.ts:126,371`

```typescript
filter.recipeName = { $regex: search, $options: 'i' };
```

**Description:** User-provided search input is directly used in MongoDB regex queries without escaping special regex characters.

**Impact:**
- ReDoS (Regular Expression Denial of Service)
- MongoDB query injection
- Performance degradation

**Remediation:**
```typescript
function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

if (search) {
  filter.recipeName = { $regex: escapeRegex(search), $options: 'i' };
}
```

---

## MEDIUM Findings

### 7. Weak Password Requirements
**Severity:** MEDIUM  
**Location:** `src/routes/auth.ts:24`

```typescript
body('password')
  .isLength({ min: 6 })
  .withMessage('Password must be at least 6 characters'),
```

**Description:** Password policy only requires 6 characters minimum with no complexity requirements.

**Impact:**
- Weak passwords susceptible to brute force
- Account compromise

**Remediation:**
```typescript
body('password')
  .isLength({ min: 8 })
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .withMessage('Password must be at least 8 characters with uppercase, lowercase, and number'),
```

---

### 8. Email Enumeration in Registration
**Severity:** MEDIUM  
**Location:** `src/routes/auth.ts:53-54`

```typescript
const field = existingUser.email === email ? 'Email' : 'Username';
return res.status(400).json({ message: `${field} already exists` });
```

**Description:** Registration endpoint reveals whether an email or username already exists.

**Impact:**
- User enumeration attacks
- Privacy violation

**Remediation:**
```typescript
return res.status(400).json({ message: 'Username or email already exists' });
```

---

### 9. Stack Traces in Development Mode
**Severity:** MEDIUM  
**Location:** `src/middleware/errorHandler.ts:25`

```typescript
...(process.env.NODE_ENV === 'development' && { stack: err.stack })
```

**Description:** Stack traces are exposed in API responses when `NODE_ENV=development`.

**Impact:**
- Information disclosure
- Attack vector identification

**Remediation:** Never expose stack traces in API responses:
```typescript
res.status(statusCode).json({
  status: 'error',
  message: process.env.NODE_ENV === 'development' ? message : 'Internal Server Error',
});
```

---

### 10. No Request Body Size Limit
**Severity:** MEDIUM  
**Location:** `src/index.ts:18`

```typescript
app.use(express.json());
```

**Description:** JSON body parser has no explicit size limit (defaults to 100kb).

**Impact:**
- Memory exhaustion DoS
- Application crashes

**Remediation:**
```typescript
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
```

---

### 11. JWT Token Not Invalidated on Password Change
**Severity:** MEDIUM  
**Location:** `src/routes/auth.ts:231-232`

**Description:** After password reset, existing JWT tokens remain valid until expiration.

**Impact:**
- Compromised tokens remain usable
- Account takeover persistence

**Remediation:** Implement token revocation using a token blacklist or short-lived tokens with refresh tokens.

---

### 12. Missing ObjectId Validation
**Severity:** MEDIUM  
**Location:** Multiple routes (`src/routes/recipes.ts`)

**Description:** Several routes don't validate ObjectId format before MongoDB queries, which can cause BSON crashes.

**Impact:**
- Application crashes
- Information disclosure via error messages

**Remediation:** Add validation middleware:
```typescript
import { param } from 'express-validator';

router.get('/:id', 
  [param('id').isMongoId().withMessage('Invalid ID format')],
  validate,
  async (req, res) => { /* ... */ }
);
```

---

### 13. MongoDB Connection Without Authentication
**Severity:** MEDIUM  
**Location:** `src/config/database.ts:5`

```typescript
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/brewbuddy';
```

**Description:** Fallback MongoDB URI has no authentication.

**Impact:**
- Unauthorized database access
- Data breach

**Remediation:** Remove the fallback or require authentication:
```typescript
const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
  throw new Error('MONGODB_URI environment variable is required');
}
```

---

### 14. Unvalidated Redirect in Password Reset
**Severity:** MEDIUM  
**Location:** `src/services/email.ts:13`

```typescript
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
```

**Description:** Password reset email uses localhost as fallback URL.

**Impact:**
- Reset emails may point to non-existent URLs
- Potential phishing vector

**Remediation:** Require FRONTEND_URL in production:
```typescript
const FRONTEND_URL = process.env.FRONTEND_URL;
if (!FRONTEND_URL && process.env.NODE_ENV === 'production') {
  throw new Error('FRONTEND_URL is required in production');
}
```

---

## LOW Findings

### 15. No CSRF Protection
**Severity:** LOW  
**Location:** `src/index.ts` (global)

**Description:** No CSRF middleware is configured.

**Impact:** Vulnerable to CSRF attacks if cookies are used for authentication.

**Remediation:** Implement CSRF protection if using cookie-based authentication:
```typescript
import csrf from 'csurf';
app.use(csrf({ cookie: true }));
```

---

### 16. XML Parsing Without Version Verification
**Severity:** LOW  
**Location:** `src/services/BeerXMLParser.ts:1`

**Description:** xml2js library is used without verifying it's a safe version.

**Impact:** Potential XXE vulnerabilities in older versions.

**Remediation:** Ensure xml2js version >= 0.5.0 and verify security patches.

---

### 17. Missing Content-Type Validation
**Severity:** LOW  
**Location:** `src/index.ts:18-19`

**Description:** No explicit content-type validation on request bodies.

**Impact:** Could accept unexpected content types.

**Remediation:** Add content-type middleware for specific routes.

---

### 18. Excessive Error Information in Development
**Severity:** LOW  
**Location:** `src/routes/brew-sessions.ts:234-235`

```typescript
const messages = Object.values(error.errors).map((e: any) => e.message);
return res.status(400).json({ error: 'Validation failed', details: messages });
```

**Description:** Validation error details are exposed in responses.

**Impact:** Information disclosure about database schema.

**Remediation:** Log detailed errors server-side, return generic messages to clients.

---

## Positive Security Findings

The following security practices are correctly implemented:

1. **Password Hashing:** bcrypt with 12 salt rounds (`src/models/User.ts:5,66-67`)
2. **JWT Authentication:** Proper token generation and verification (`src/utils/generateToken.ts`)
3. **Input Validation:** express-validator used on most routes
4. **XXE Prevention:** DOCTYPE/ENTITY regex checks in BeerXML parser (`src/services/BeerXMLParser.ts:144-146`)
5. **Email Enumeration Prevention:** Forgot password always returns success message (`src/routes/auth.ts:160-163`)
6. **Password Reset Token Expiry:** 1-hour expiration with TTL index (`src/models/PasswordResetToken.ts:27`)
7. **Secure Token Generation:** crypto.randomBytes(32) for reset tokens (`src/routes/auth.ts:169`)
8. **Error Handling:** Operational vs programming error distinction (`src/middleware/errorHandler.ts:5`)
9. **Input Sanitization:** trim() and normalizeEmail() used on inputs
10. **Data Encryption:** HTTPS enforced in production (implied by CORS configuration)

---

## Recommendations Summary

### Immediate Actions (Critical/High)
1. Remove JWT fallback secret and require environment variable
2. Configure CORS with specific allowed origins
3. Implement rate limiting on authentication endpoints
4. Add helmet for security headers
5. Fix mass assignment vulnerability in recipe updates
6. Escape regex special characters in search queries

### Short-term Actions (Medium)
1. Strengthen password requirements
2. Standardize error messages to prevent enumeration
3. Remove stack traces from API responses
4. Add request body size limits
5. Implement JWT token revocation
6. Add ObjectId validation to all routes
7. Require MongoDB authentication in production
8. Validate FRONTEND_URL in production

### Long-term Actions (Low)
1. Implement CSRF protection
2. Verify xml2js security patches
3. Add content-type validation
4. Implement comprehensive logging and monitoring

---

## Overall Security Posture

**Rating:** MODERATE

The BrewBuddy backend has a solid foundation with proper authentication and input validation, but critical gaps in secret management, API security, and error handling need to be addressed before production deployment. The most urgent issue is the hardcoded JWT fallback secret which must be fixed immediately.

---

*Report generated by Sentinel (CISO) - BrewBuddy Security Audit*
