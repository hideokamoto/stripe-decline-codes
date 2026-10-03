# Security Policy

## Supported Versions

Only the latest published version of `stripe-decline-codes` receives security
updates.

| Version   | Supported          |
| --------- | ------------------ |
| latest    | :white_check_mark: |
| < latest  | :x:                |

## Reporting a Vulnerability

Please **do not** open a public GitHub issue for security vulnerabilities.

Report vulnerabilities privately via
[GitHub Security Advisories](https://github.com/hideokamoto/stripe-decline-codes/security/advisories/new).

You can expect:

- An acknowledgment of your report within a few days
- A status update once the issue has been triaged
- Credit in the release notes once a fix is published (unless you prefer to
  remain anonymous)

## Scope

This library is a zero-dependency data package (Stripe decline codes and
localized messages). It performs no network requests, file I/O, or dynamic code
execution. Likely security-relevant reports are limited to supply-chain issues
(e.g. a compromised published artifact) rather than vulnerabilities in the
library code itself.
