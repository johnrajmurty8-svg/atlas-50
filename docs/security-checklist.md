# Atlas /50 — Security Checklist

---

## Overview

Atlas /50 V1 is a read-only, publicly accessible, client-side web application with no backend server, no user authentication, no database, and no payment processing. The attack surface is minimal. This checklist covers V1 scope and flags items that become relevant in V1.5/V2.

**Security posture summary:**
- No user accounts → No credential attack surface in V1
- No server-side code → No injection vectors in V1
- No payment processing → No PCI scope
- localStorage only → No server-side data at risk
- Vercel hosting → Infrastructure security delegated to platform

---

## 1. Authentication

| Item | V1 Status | Notes |
|------|-----------|-------|
| Authentication provider | N/A | No auth in V1 |
| Session management | N/A | No sessions in V1 |
| Password storage | N/A | — |
| OAuth integration | N/A | — |
| Token expiry | N/A | — |

> [⚠️ ATTENTION NEEDED] V2 introduces user accounts. When implementing auth, use Supabase Auth (built-in JWT + RLS) or NextAuth.js. Never roll custom auth. Enforce: HTTPS only, secure + httpOnly cookie flags, CSRF protection, token rotation on login.

---

## 2. Authorization

| Item | V1 Status | Notes |
|------|-----------|-------|
| RBAC model | N/A | No users, no roles in V1 |
| Row-level security | N/A | No database in V1 |
| API route protection | N/A | No API routes in V1 |
| Admin access controls | N/A | — |

> [⚠️ ATTENTION NEEDED] V1.5 introduces Supabase. Enable Row-Level Security (RLS) on all tables from day one. Default policy: deny all, then grant explicitly. Wishlist data must be scoped to the authenticated user's `user_id`.

---

## 3. Data in Transit

| Item | Status | Implementation |
|------|--------|---------------|
| HTTPS enforced | ✅ | Vercel enforces HTTPS on all deployments; HTTP → HTTPS redirect automatic |
| HSTS header | ✅ | Vercel sets `Strict-Transport-Security` on production domains |
| TLS version | ✅ | Vercel uses TLS 1.2+ minimum |
| Certificate management | ✅ | Managed by Vercel (Let's Encrypt auto-renew) |

---

## 4. Data at Rest

| Item | V1 Status | Notes |
|------|-----------|-------|
| Database encryption | N/A | No database in V1 |
| localStorage contents | Low risk | Stores only destination IDs (e.g. `["japan","peru"]`). No PII, no sensitive data. |
| localStorage tampering | Accepted | User can tamper with their own wishlist. No server consequence. |
| Secrets at rest | N/A | No secrets in V1 |

---

## 5. Secrets Management

| Item | V1 Status | Notes |
|------|-----------|-------|
| `.env.local` in `.gitignore` | ✅ Required | Even though V1 has no secrets, add `.env.local` to `.gitignore` before first commit |
| API keys in client code | N/A | No API keys in V1 |
| Hardcoded credentials | ✅ None | No credentials anywhere in codebase |

> [⚠️ ATTENTION NEEDED] V1.5 adds `UNSPLASH_ACCESS_KEY` and Supabase keys. Rules: never commit secrets to git; use Vercel environment variables for production; use `.env.local` for development; never prefix server secrets with `NEXT_PUBLIC_`.

---

## 6. Input Validation

| Input | Validation Applied | Risk |
|-------|------------------|------|
| Search text input | Client-side: filter applied to static array via `.includes()`. No server processing. | Low — XSS not possible against static data |
| Smart Picker dropdown values | Values are controlled `<select>` elements — values come from the static vocabulary enum. | Low |
| URL parameters | [⚠️ ATTENTION NEEDED] If deep-linking (`?destination=id`) is implemented, sanitise `id` before use — check against known destination IDs only. Do not use raw URL param as a key. |
| localStorage read | Wrapped in `try/catch` — handles corrupt/tampered JSON gracefully | Low |

**General rule for V1:** All user input affects only client-side React state. There is no server processing, no SQL, and no template injection risk. Input validation is defensive hygiene only.

---

## 7. OWASP Top 10 Coverage

| # | Vulnerability | V1 Risk | Mitigation |
|---|--------------|---------|-----------|
| A01 | Broken Access Control | **None** | No access-controlled resources in V1 |
| A02 | Cryptographic Failures | **None** | No sensitive data stored or transmitted |
| A03 | Injection | **Low** | No server-side processing; no SQL/NoSQL/command injection vectors |
| A04 | Insecure Design | **Low** | Architecture reviewed; localStorage-only wishlist is by design |
| A05 | Security Misconfiguration | **Medium** | Set correct HTTP headers via `vercel.json` (see §9). Ensure no directory listing. |
| A06 | Vulnerable Components | **Medium** | Three.js, React, Next.js — keep dependencies updated; run `npm audit` before launch |
| A07 | Auth Failures | **None** | No auth in V1 |
| A08 | Software & Data Integrity | **Low** | Verify npm package integrity; pin exact versions in `package-lock.json` |
| A09 | Logging & Monitoring | **Low** | No server logs in V1; Vercel provides basic request logging |
| A10 | SSRF | **None** | No server-side HTTP requests in V1 |

---

## 8. Frontend Security

### Content Security Policy (CSP)

Set via `vercel.json` headers:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://unpkg.com https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' https://images.unsplash.com data:; connect-src 'self'; frame-ancestors 'none';"
        },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}
```

> [⚠️ ATTENTION NEEDED] The CSP above includes `'unsafe-inline'` for scripts because the HTML prototype used inline Babel. When porting to Next.js, remove `'unsafe-inline'` from `script-src` and use nonce-based CSP or hash-based CSP instead. This is a significant security improvement.

### XSS Prevention

| Risk | Mitigation |
|------|-----------|
| Destination data rendered as React JSX | React escapes all string values by default — no `dangerouslySetInnerHTML` |
| User search input | Rendered as value in controlled input and used only in `.toLowerCase().includes()` — no HTML injection possible |
| Moodboard blurb text | Must be plain text only in JSON — no HTML markup allowed in `blurb` field |
| Image URLs from data.json | Rendered as `src` attributes only; CSP `img-src` restricts to Unsplash domain |

---

## 9. Integration Security

### Unsplash Images (V1 — Manual)

| Item | Requirement |
|------|-------------|
| Image hosting | Images served directly from Unsplash CDN (`images.unsplash.com`) |
| Licensing | [⚠️ ATTENTION NEEDED] All manually sourced Unsplash images must be used under the Unsplash License. Confirm each image URL is from Unsplash (not hotlinked from another source). |
| Attribution | V1: Not required under Unsplash free licence for individual images. V1.5 (API): Attribution required per Unsplash API terms. |
| Rate limiting | V1: No API calls — no rate limit concern. |

### Unsplash API (V1.5 — Not Yet Built)

> [⚠️ ATTENTION NEEDED] When implementing Unsplash API in V1.5: Keep `UNSPLASH_ACCESS_KEY` server-side only (Next.js API route); never expose in client bundle (`NEXT_PUBLIC_` prefix). Display required attribution (`Photo by [name] on Unsplash`) per API terms. Cache API responses to avoid rate limit (50 requests/hour on free tier).

### Vercel Platform

| Item | Status |
|------|--------|
| Automatic HTTPS | ✅ |
| DDoS protection | ✅ (Vercel edge) |
| Preview deployment access | ⚠️ Ensure preview URLs are not publicly shared — add password protection to Vercel previews if needed |
| Environment variable isolation | ✅ (Production / Preview / Development separation) |

---

## 10. Dependency Security

```bash
# Run before launch and on each dependency update
npm audit

# Fix automatically where safe
npm audit fix

# Review high/critical manually before fixing
npm audit --audit-level=high
```

**Key dependencies to monitor:**

| Package | Risk Area |
|---------|----------|
| `three` | WebGL rendering — keep patched |
| `next` | Framework — follow Next.js security advisories |
| `react` / `react-dom` | Core — follow React release notes |

> Pin exact versions in `package.json` (no `^` prefix) for production stability. Use `npm ci` in CI/CD for reproducible installs.

---

## 11. Compliance

### GDPR
| Requirement | V1 Status |
|-------------|-----------|
| Personal data collected | None — localStorage stores only destination IDs, no PII |
| Cookies | None in V1 — no analytics, no tracking cookies |
| Privacy policy | [⚠️ ATTENTION NEEDED] Even without PII, publishing a basic privacy policy is best practice. Required if analytics added. |
| Right to erasure | N/A in V1 (no server-side user data) |

> V2 (user accounts): GDPR compliance becomes mandatory. Add: privacy policy, consent for data processing, right to erasure API, data export.

### SOC 2
Not applicable for V1 solo project. Vercel is SOC 2 Type II certified.

---

## 12. AI-Specific Security

Atlas /50 V1 contains no AI/ML components. The Smart Picker is tag-based only.

> V1.5 (weighted scoring) — if ML model inference is added: ensure model inputs are sanitised; use server-side inference only; do not expose model weights or scoring logic client-side.

---

## 13. Incident Response

For a solo project at this stage, a lightweight plan is sufficient:

| Step | Action |
|------|--------|
| Detect | Monitor Vercel error logs and deployment alerts |
| Respond | Rollback via Vercel instant rollback to previous deployment |
| Contain | Disable compromised preview URLs; rotate any exposed keys immediately |
| Notify | No user notification required in V1 (no user accounts, no PII) |
| Post-mortem | Document in project notes; update checklist |

> [⚠️ ATTENTION NEEDED] V2 (user accounts + PII): Create a formal incident response plan including breach notification timeline (72-hour GDPR requirement), user notification template, and key rotation runbook.

---

## 14. Pre-Launch Security Checklist

- [ ] `.env.local` is in `.gitignore`
- [ ] No hardcoded secrets, tokens, or API keys in source code
- [ ] `npm audit` shows no high/critical vulnerabilities
- [ ] `vercel.json` HTTP security headers configured (CSP, X-Frame-Options, etc.)
- [ ] All image URLs in destinations.json point to `images.unsplash.com` only
- [ ] No `dangerouslySetInnerHTML` usage in any component
- [ ] Destination `blurb` and `tagline` fields are plain text only (no HTML)
- [ ] Vercel preview deployments are not publicly linked
- [ ] HTTPS confirmed working on production domain
- [ ] localStorage `try/catch` error handling in place
