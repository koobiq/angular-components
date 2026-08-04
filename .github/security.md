# Security Policy

Thanks for helping keep Koobiq and its users safe.

## Supported versions

Security fixes are made on `main`, which is the current release line (`20.x`). Older release
branches (`19.x`, `18.x`) receive backports where the fix applies cleanly and the line is
still in use.

Note that `@koobiq/components` and the adapter packages declare their Angular dependencies
as peer dependencies. Vulnerabilities in Angular itself should be reported to the
[Angular project](https://github.com/angular/angular/security/policy).

## Reporting a vulnerability

**Please do not report security vulnerabilities through public issues, discussions, or pull
requests.**

Report privately through GitHub instead: open the
[Security tab](https://github.com/koobiq/angular-components/security) of this repository and
use **Report a vulnerability**. The report is visible only to the maintainers, and it gives
us a private place to discuss and prepare a fix with you.

To help us triage quickly, please include as much of the following as you can:

- the type of issue (for example cross-site scripting, prototype pollution, or a supply
  chain problem);
- the affected package and version, and the source files involved;
- the configuration needed to reproduce the issue;
- step-by-step reproduction instructions, ideally a minimal example;
- proof-of-concept or exploit code, if you have it;
- the impact, and how an attacker might use it.

## What happens next

We will acknowledge the report, keep you updated as we investigate, and credit you in the
advisory when the fix is published, unless you would rather stay anonymous. We ask that you
give us a chance to release a fix before disclosing the issue publicly.

## Dependency vulnerabilities

Advisories against dependencies are tracked by Dependabot and by the `Audit` and
`Audit report` workflows in this repository.

The published packages (`@koobiq/components`, `@koobiq/components-experimental`, the date
adapters) depend only on `tslib` at runtime; everything else is a peer dependency or build
tooling that is not shipped to consumers. Advisories that cannot be fixed by an upgrade are
recorded in [`.yarnrc.yml`](../.yarnrc.yml), each with the reasoning and the condition under
which the exception should be removed.
