# Security Hardening Guide

This website is static front-end only. Browser-side protections can only deter casual copying.
To defend against commercial-grade threats, enforce controls at hosting, CDN, and identity layers.

## 1) Mandatory Infrastructure Controls

- Put the site behind a managed WAF and DDoS protection (Cloudflare, Akamai, AWS WAF).
- Restrict admin/deploy access with MFA and IP allow-list.
- Use separate environments for staging and production.
- Rotate all deployment credentials and API keys on a schedule.

## 2) HTTP Security Headers (Server/CDN)

Set these at edge/server level:

- `Content-Security-Policy`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY` (or CSP `frame-ancestors 'none'`)
- `Referrer-Policy: same-origin`
- `Permissions-Policy` (deny camera/mic/geolocation unless needed)
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Resource-Policy: same-origin`

## 3) Asset Protection (Media/Intellectual Property)

- Store project media in private object storage; serve via short-lived signed URLs.
- Enable anti-hotlinking (deny unknown `Referer` domains at CDN).
- Add visible and forensic watermarks to sensitive photos/videos.
- Disable directory listing and direct bucket browsing.
- Use tokenized links for premium/private project pages.

## 4) Access Control and Privacy

- Keep sensitive/project pages behind authentication for internal review.
- Use role-based access control (editor/reviewer/admin).
- Log every admin action and content export/download event.
- Use least privilege for CI/CD tokens and hosting service accounts.

## 5) Monitoring and Detection

- Enable WAF logs, bot management, and anomaly detection.
- Alert on traffic spikes, scraping patterns, and repeated blocked events.
- Run dependency and platform vulnerability scans monthly.
- Perform annual external penetration testing.

## 6) Current Front-End Deterrents Already Added

- Context-menu/copy/select/drag deterrents.
- Media controls with `controlslist=\"nodownload\"`.
- Watermark overlay on pages.
- `noindex`/`nofollow`/`noarchive` directives in page metadata.

## 7) Important Reality Check

No browser-only control can fully stop a determined attacker from copying visible content.
Real protection requires server-side authorization, signed delivery, WAF policy, and monitoring.
