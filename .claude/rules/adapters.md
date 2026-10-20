---
paths:
    - 'packages/angular-luxon-adapter/**'
    - 'packages/angular-moment-adapter/**'
---

# Date adapters

- The base `DateAdapter` constructor calls overrides such as `createDate` and `setLocale` before the subclass's field initializers run. Guard every override it reaches against fields that are not set yet, and write `dateTimeOptions` on every call instead of memoizing it: `setLocale` recreates it.
