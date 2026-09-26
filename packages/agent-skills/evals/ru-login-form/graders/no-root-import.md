---
type: regex
target:
    source: file
    path: src/app/login.ts
pattern: 'from ["'']@koobiq/components["'']'
match: not_contains
---
