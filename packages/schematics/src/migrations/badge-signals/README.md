# badge-signals

Migration schematic invoked automatically by `ng update @koobiq/components@20` (registered for
`20.3.0-0`). Migrates `KbqBadge` consumers to its finished signal-based API and reports the members
the badge review closed.

## Background

`badgeColor` was the last accessor input on the badge, and it was an odd one: the setter took a
color, the getter returned a CSS class.

```ts
badge.badgeColor = KbqBadgeColors.Error;
badge.badgeColor; // 'kbq-badge_error' — not what was written
```

It is an `input()` now and reports what was written. The `kbq-badge_<color>` class is still applied
to the host, from an internal computed, so styles are unaffected.

`compact` and `outline` gained `booleanAttribute` in the same review, and the `KbqBadgeCssStyler`
directive — an implementation detail of `<kbq-badge>` that nothing outside the component ever drove
— closed its members.

## What it rewrites

| Before          | After             |
| --------------- | ----------------- |
| `badge.compact` | `badge.compact()` |
| `badge.outline` | `badge.outline()` |

Both on receivers explicitly typed `KbqBadge` and through template reference variables on
`<kbq-badge>`, in external and inline templates. Already-migrated reads are left alone, so the
schematic is idempotent.

## What it does _not_ do

| Pattern                | Manual migration                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------------ |
| `.badgeColor`          | `badgeColor()` — and expect the raw color, not `kbq-badge_<color>`                         |
| `badge.badgeColor = …` | Bind `[badgeColor]` in the template — the input is read-only                               |
| `.iconItem`            | Removed; the badge never read this content query either                                    |
| `KbqBadgeCssStyler.*`  | Now `private`; the icon spacing classes it applies are the contract                        |
| `viewChild(KbqBadge)`  | The query is a signal too, so a read through it is a double call: `this.badge().compact()` |

`@ViewChild(KbqBadge) badge: KbqBadge` is a plain annotated field, so it is rewritten like any other
receiver — `this.badge.compact()`, a single call. Only the signal-query form needs the double call.

`badgeColor` is warned about rather than rewritten because appending `()` would compile and hand
back a different string.

## What it cannot see

Receivers are found by explicit type annotation, with no cross-package type resolution. A non-null
assertion, parentheses and an aliased import (`import { KbqBadge as Badge }`) are seen through; a
`KbqBadge` named in a type position that does not resolve to a single identifier — a union, an array,
a `QueryList<KbqBadge>`, a cast, a return type — is reported with its line number rather than
rewritten, and so is a read the access pass structurally cannot reach: `badge['compact']` and
`const { compact } = badge`.

Templates report rather than rewrite when they cannot be parsed, and skip a reference variable whose
name a `@for` variable, an `@let` or another `#ref` also introduces. A reference is rewritten only
inside the embedded view that declares it, so a read outside an `@if`, `@for` or `<ng-template>` is
left alone.

## Notes with no call site to point at

- `compact` and `outline` are `booleanAttribute` inputs. `<kbq-badge compact>` used to pass the
  empty string, which is falsy, so the badge rendered at its default size; it now renders compact.
  Conversely `[compact]="'false'"` — a non-empty string, previously truthy — now means `false`.

## Running it manually

```
ng generate @koobiq/components:badge-signals --project my-app
```

Pass `--fix=false` to see what it would change without writing.
