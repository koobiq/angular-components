---
type: regex
target:
    source: file
    path: src/app/servers.ts
pattern: '#[0-9a-fA-F]{3,8}\b'
match: not_contains
---
