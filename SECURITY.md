# Security Baseline and Lock-Down Playbook

This repository is intentionally static-only. No backend entrypoints are allowed.
Goal: prevent unauthorized code changes and reduce automated abuse.

## 1) Repo Guardrails Enforced in Code

- `CODEOWNERS` is configured so owner review is required for all files.
- CI workflow `Security Guardrails` blocks:
  - backend files/directories (`api`, `server`, `backend`, `functions`, server-side extensions)
  - reintroduction of HTML forms
  - audio media usage
  - insecure `http://` references
  - removal of required security headers from `vercel.json`
- Dependabot monitors GitHub Actions updates weekly.

These controls exist in:
- `.github/CODEOWNERS`
- `.github/workflows/security-guardrails.yml`
- `.github/dependabot.yml`

## 2) Mandatory GitHub Settings (Must Be Enabled in UI)

Enable these on `main` branch:
- Require pull request before merging.
- Require approvals (minimum 1).
- Require review from Code Owners.
- Require status checks to pass (`Security Guardrails`).
- Dismiss stale approvals when new commits are pushed.
- Block force pushes.
- Block branch deletion.

Account and org security:
- Enforce MFA.
- Remove unused personal access tokens.
- Enable secret scanning and push protection.
- Enable Dependabot alerts.

## 3) Mandatory Vercel and Domain Controls (Must Be Enabled in UI)

- Enforce MFA for all Vercel users.
- Restrict production deployments to trusted users only.
- Disable deploy hooks you do not use.
- Rotate Vercel tokens regularly.
- Enable registrar lock on domain.
- Enable MFA at registrar and DNS provider.
- Enable DNSSEC if supported.

## 4) Network and Bot Protection

- Place the site behind Cloudflare (or equivalent) with:
  - managed WAF rules
  - bot management/challenges
  - rate limiting
  - geo and ASN filtering if appropriate
- Keep `robots.txt` and `X-Robots-Tag` policies active for crawler control.

## 5) Runtime Header Baseline

Must remain configured at edge via `vercel.json`:
- `Content-Security-Policy`
- `Strict-Transport-Security`
- `X-Content-Type-Options`
- `X-Frame-Options`
- `Referrer-Policy`
- `Permissions-Policy`
- `Cross-Origin-Opener-Policy`
- `Cross-Origin-Resource-Policy`
- `X-Robots-Tag`

Compatibility note:
- Keep advanced isolation/cache overrides (`Cross-Origin-Embedder-Policy`, `Origin-Agent-Cluster`, global `Cache-Control: no-store`) optional unless there is a strict requirement, because they can reduce third-party integration compatibility and caching performance.

## 6) Incident Response

If unauthorized change is detected:
- Revoke GitHub and Vercel tokens immediately.
- Rotate passwords and enforce MFA re-check.
- Lock `main` branch temporarily.
- Roll back to last known good commit.
- Review GitHub/Vercel audit logs and remove unauthorized access.

## 7) Reality Check

No public website can be 100% immune to crawling or copying.
The strongest control is strict write access: repository, deployment, and DNS.
