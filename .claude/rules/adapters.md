---
paths:
    - 'packages/angular-luxon-adapter/**'
    - 'packages/angular-moment-adapter/**'
---

# Date adapters

- The constructors of the upstream `LuxonDateAdapter` and `MomentDateAdapter` (imported here as `BaseLuxonDateAdapter` and `BaseMomentDateAdapter`) call `setLocale()`, which reaches the `createDate()` override, before the subclass's field initializers run. Guard every override it reaches against fields that are not set yet, and write `dateTimeOptions` on every call instead of memoizing it: `setLocale` recreates it.
- The upstream adapters apply a time zone in different places, so read their JavaScript, not the `.d.ts`. In luxon, `format()` re-applies the zone, but `deserialize()` returns an existing `DateTime` unchanged, and `createDate()` calls `setZone()` without `keepLocalTime`. In moment, the zone comes from the moment itself, `createMoment()` is private, and a moment is mutable, so clone it before `utcOffset()`. Test `format`, `getHours` and `createDate` together.
