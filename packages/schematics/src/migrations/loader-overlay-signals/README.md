# loader-overlay-signals

Migration schematic invoked automatically by `ng update @koobiq/components@20` (registered for
`20.3.0-0`). Migrates `KbqLoaderOverlay` consumers to its finished signal-based API and reports the
members the review closed.

## Background

`text` and `caption` were the two inputs the automated signal migration skipped — it saw them read
inside `@if` blocks and would not risk the narrowing. They are `input()` now, and honest about being
optional:

```ts
@Input() text: string; // no initializer — an unbound overlay reported undefined
```

They report `string | undefined`, which is what they always held.

Everything the template uses to decide between a projected slot and an input — `isExternalIndicator`,
`isExternalText`, `isExternalCaption`, `isEmpty`, `spinnerSize` and the three content queries — left
the public surface in the same review.

## What it rewrites

| Before            | After               |
| ----------------- | ------------------- |
| `overlay.text`    | `overlay.text()`    |
| `overlay.caption` | `overlay.caption()` |

Both on receivers explicitly typed `KbqLoaderOverlay` and through template reference variables on
`<kbq-loader-overlay>`, in external and inline templates. Already-migrated reads are left alone, so
the schematic is idempotent.

`size`, `transparent` and `card` were already signals in 20.2.0 and are not touched.

## What it does _not_ do

| Pattern                                                     | Manual migration                                           |
| ----------------------------------------------------------- | ---------------------------------------------------------- |
| `overlay.text = …`                                          | Bind `[text]` in the template — the input is read-only     |
| `.isEmpty` / `.isExternal*` / `.spinnerSize`                | Now `protected`; what the overlay renders is the contract  |
| `.externalIndicator` / `.externalText` / `.externalCaption` | Now `private` signal queries                               |
| `viewChild(KbqLoaderOverlay)`                               | The query returns the instance, so a read is a double call |

## Notes with no call site to point at

- `text` and `caption` report `string | undefined`. The call sites that were already wrong now fail
  to compile.
- **`transparent` is a `booleanAttribute` input.** `<kbq-loader-overlay transparent>` used to pass
  the empty string, which is falsy, so the valueless attribute rendered the _filled_ background —
  the opposite of how it reads. It means `true` now, and `[transparent]="'false'"` means `false`.

## Running it manually

```
ng generate @koobiq/components:loader-overlay-signals --project my-app
```

Pass `--fix=false` to see what it would change without writing.
