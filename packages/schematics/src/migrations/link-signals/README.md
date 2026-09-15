# link-signals

Migration schematic invoked automatically by `ng update @koobiq/components@21` (registered for
`21.0.0-0`). Migrates `KbqLink` consumers to its finished signal-based API and reports the members
the review closed.

## Background

The three inputs the automated signal migration skipped were all accessors, and each did something
beyond storing a value:

```ts
set disabled(value: boolean) { this.disabledSignal.set(value); }
get tabIndex(): number { return this.disabled ? -1 : this._tabIndex; }
set print(value: any) { this.printMode = value !== null; this._print = value; this.updatePrintUrl(); }
```

`disabledSignal` stays a public `WritableSignal<boolean>`: `kbqTooltip` accepts a link through
`forDisabledComponent` and reads it, and that contract is typed on the tooltip side. It is a
`linkedSignal` over the input now, so binding `[disabled]` still drives it and a direct write still
wins.

## What it rewrites

| Before          | After             |
| --------------- | ----------------- |
| `link.disabled` | `link.disabled()` |

On receivers explicitly typed `KbqLink`. Already-migrated reads are left alone, so the schematic is
idempotent. There is no template-reference pass: `kbq-link` is an attribute on an anchor, so a
`#ref="kbqLink"` read is not tied to an element name the schematic can match.

## What it does _not_ do

| Pattern                                         | Manual migration                                                                   |
| ----------------------------------------------- | ---------------------------------------------------------------------------------- |
| `.tabIndex`                                     | `tabIndex()`, and expect what was bound — not `-1` for a disabled link             |
| `link.print = …`                                | Bind `[print]`; it was a setter with no getter, so there is no read to fix         |
| `.icons` / `.nativeElement`                     | Now `private`; call `getHostElement()` for the host                                |
| `.hasIcon` / `.printMode` / `.printUrl`         | Now `protected`; the `kbq-link_print` class and `print` attribute are the contract |
| `.icon` / `.destroyRef` / `.ngAfterContentInit` | Gone; `icons` answers what `icon` did, and the hook is not implemented             |
| `viewChild(KbqLink)`                            | The query returns the instance, so a read through it is a double call              |

`tabIndex` is warned about rather than rewritten because appending `()` would compile and hand back
a different number for a disabled link. A write of any kind — `=`, `||=`, `++` — is reported rather
than rewritten: every member is an `input()`, so there is no writable half, and appending `()` would
turn a read-only error into a syntax error.

## Notes with no call site to point at

- **`[print]="undefined"` no longer marks the link as printable.** The old setter tested
  `value !== null`, so an explicit `undefined` passed it: the link got `kbq-link_print` and printed
  its `href`. The input tests `!= null`, which covers both. An unbound link behaves exactly as
  before — no class, and the href still lands in the `print` attribute. `print` accepts
  `string | null` instead of `any`.
- **Reading `disabled` reports the bound input.** The effective state — what the host bindings
  render — is `disabledSignal()`. The two only differ if something writes `disabledSignal` directly,
  which is what `kbqTooltip` does through `forDisabledComponent`. This one is reported next to every
  file the rewrite touched rather than once per project, because the rewrite it applies is correct
  but not value-identical.
- **A disabled link carries `aria-disabled` instead of `disabled`.** `disabled` is not valid on an
  `<a>` or a `<span>` and told assistive tech nothing. `kbq-disabled` and `tabindex="-1"` are
  unchanged; a selector on `a[kbq-link][disabled]` needs `.kbq-disabled` or `[aria-disabled]`.

## Running it manually

```
ng generate @koobiq/components:link-signals --project my-app
```

Pass `--fix=false` to see what it would change without writing.
