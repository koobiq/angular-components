# timezone-grouping-utils

Migration schematic invoked automatically by `ng update @koobiq/components@20`
(registered for `21.0.0-0`). Reports the timezone call sites that the review's split of
`getZonesGroupedByCountry` breaks, and the members whose type or behavior changed under them. It never
writes to the tree.

## Background

The package ships no timezone data — every consumer feeds its own rows through two exported utilities, and
both were wrong.

| Member                                              | Before                                         | After                                         |
| --------------------------------------------------- | ---------------------------------------------- | --------------------------------------------- |
| `getZonesGroupedByCountry(data, label?, priority?)` | one privileged country plus one "Other" bucket | `getZonesGroupedByCountry(data)`, per country |
| —                                                   | —                                              | `promoteCountry`, `collapseOtherCountries`    |
| host country                                        | read from `Intl` inside the grouping           | `kbqResolveHostCountry(data)`                 |
| `timezonesSortComparator`                           | returned the first zone's offset               | returns the difference, ties on `city`        |
| `KbqTimezoneGroup.countryCode`                      | `string`                                       | `string \| null`                              |
| `KbqTimezoneZone.offset`                            | required, rendered verbatim                    | optional, resolved from `id` when absent      |
| `kbq-timezone-select` `[multiple]`                  | accepted, half-rendered                        | throws                                        |

`timezonesSortComparator` deserves a note. Its body returned `parseOffset(first.offset)` rather than a
difference, so `cmp(+05:00, +02:00)` and `cmp(+02:00, +05:00)` were both positive: it is not a valid
comparator, and the order a list came out in was whatever the engine's sort algorithm made of it. Any zone
at `00:00:00` compared equal to everything, and an unparsable offset was `NaN`, which V8 reads as `0`.

`getZonesGroupedByCountry` never grouped by country either. It read
`Intl.DateTimeFormat().resolvedOptions().timeZone` at call time and produced at most two groups — the host
machine's country and one bucket holding everything else with its `countryName` overwritten. The same input
rendered differently on a developer's laptop, on CI and on an SSR server versus the browser that hydrated it.

## What it does _not_ do

Nothing is rewritten. Restoring the old rendering takes a composition of two or three helpers, and which one
a call site meant — promote the country, collapse the rest, or both — cannot be read off the call.

| Pattern                                           | Manual migration                                                                                                |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `getZonesGroupedByCountry(zones, label, country)` | `collapseOtherCountries(getZonesGroupedByCountry(zones), country, label)`                                       |
| `getZonesGroupedByCountry(zones, label)`          | `collapseOtherCountries(getZonesGroupedByCountry(zones), kbqResolveHostCountry(zones), label)`                  |
| `getZonesGroupedByCountry(zones)`                 | `promoteCountry(getZonesGroupedByCountry(zones), kbqResolveHostCountry(zones))` for a real per-country grouping |
| `group.countryCode`                               | Nullable — an aggregate bucket belongs to no country                                                            |
| `zone.offset`                                     | `resolveZoneOffset(zone)`; omit the field to have it derived from the IANA `id`                                 |
| `[multiple]` on `kbq-timezone-select`             | Use `kbq-select`                                                                                                |

## Notes with no call site to point at

- The option tooltip carries the same filtered city list the option renders. It used to carry the
  unfiltered one while the show/hide decision was measured on the filtered box, so a search opened a hint
  listing exactly the cities it had just removed.
- `UtcOffsetPipe` and `CitiesByFilterPipe` are exported, and `KbqTimezoneModule` re-exports
  `KbqOptionModule`, so the documented usage with `kbq-optgroup` works from the module alone.
- `filterCitiesBySearchString` rejoins on `', '` instead of `','`, so a filtered list no longer begins with
  a stray space, and its offset guard requires a digit — a lone sign or a backslash used to match it and be
  dropped from the search silently.
- `KbqTimezoneOption` provides `KBQ_TITLE_TEXT_REF` and marks its city label, so a `[kbq-title]` inside an
  option measures the label rather than the whole two-column row.
- The search placeholder follows the active locale instead of latching to whichever one was applied first.
  A placeholder the consumer binds still wins.

## Running it manually

```
ng generate @koobiq/components:timezone-grouping-utils --project my-app
```
