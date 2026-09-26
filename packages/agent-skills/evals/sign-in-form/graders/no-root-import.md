---
type: regex
target:
    source: file
    path: src/app/sign-in.ts
pattern: 'from ["'']@koobiq/components["'']'
match: not_contains
---
