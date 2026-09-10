# code-block-signals

Migration schematic invoked automatically by `ng update @koobiq/components@21` (registered for
`21.0.0-0`). Moves `KbqCodeBlock` consumers onto its finished signal-based API and reports what has no
mechanical translation.

## Background

`maxHeight` was published as `InputSignal<number>` over an `undefined!` default, so a code block with
no `[maxHeight]` binding reported `undefined` from a non-nullable type:

```ts
const height: number = codeBlock.maxHeight(); // held undefined
if (codeBlock.maxHeight() > 0) { … }          // NaN comparison, never true
```

It reports `number | undefined` now, and a value that is not cleanly numeric — a valueless
`maxHeight` attribute, `'200px'` — reports `undefined` rather than `NaN`. `[maxHeight]="undefined"`
used to hand back `NaN`; that is the one runtime change. The call sites that were quietly wrong now
fail to compile.

`KbqCodeBlockHighlight.file` was a write-only required input: a setter with no getter that kicked off
highlighting as a side effect. It is `input.required()` driven by an effect now, so it can finally be
read — and a programmatic write no longer compiles.

## What it rewrites

`KbqCodeBlock` has no decorator inputs left. `softWrap`, `viewAll`, `canDownload`, `files`,
`activeFileIndex` and `hideTabs` are `WritableSignal`s over a backing `input()`, so both directions
are mechanical:

| Before                      | After                          |
| --------------------------- | ------------------------------ |
| `block.softWrap`            | `block.softWrap()`             |
| `block.activeFileIndex = 2` | `block.activeFileIndex.set(2)` |

On receivers explicitly typed `KbqCodeBlock`, on the `inject()` / `viewChild()` initializer forms, and
through template reference variables on `<kbq-code-block>` in external and inline templates. Reads that
are already calls are left alone, so the schematic is idempotent.

A `model()` would have been the obvious shape for the six, but `ModelOptions` carries no `transform`,
and every one of them needs `booleanAttribute` or `numberAttribute` to keep a valueless attribute such
as `<kbq-code-block softWrap>` working.

## What it does _not_ do Narrowing `number | undefined` back to `number` is a decision — `?? 0`, a

non-null assertion, or handling the unset state — and turning a `file` write into a `[file]` binding
is a template edit.

| Pattern                                  | Manual migration                                                    |
| ---------------------------------------- | ------------------------------------------------------------------- |
| `.maxHeight()` on a `KbqCodeBlock`       | `?? 0` for the common reading, or handle the unset state explicitly |
| `.file = …` on a `KbqCodeBlockHighlight` | Bind `[file]`; the value is readable as `file()` now                |

## Notes with no call site to point at

- The `max-height` the code block applies while `viewAll` is off is a `computed`. It was a getter read
  from a `[style.max-height.px]` binding, so it only re-evaluated when something else marked the view
  dirty; it follows `maxHeight` and `viewAll` directly now.
- `softWrap`, `viewAll`, `canDownload`, `activeFileIndex` and `files` are backed by signals. They are
  accessor inputs with the same types and the same two-way outputs — they are written by the component
  as well as by the binding, and a `model()` cannot carry the `booleanAttribute` /
  `numberAttribute` transform they need. Four of the five were plain public fields before, so they are
  no longer own properties: they do not appear in `Object.keys`, a spread or `JSON.stringify`, and a
  subclass field of the same name shadows the accessor under `useDefineForClassFields`.
- **`hideTabs` is derived rather than written.** A single file with no filename still hides the tab
  bar, but the component no longer writes `true` into its own input to do it: the write latched the
  bar off for good and re-emitted `hideTabsChange` on every `files` assignment. `[hideTabs]="false"`
  no longer shows the bar for a lone unnamed file.
- **An `activeFileIndex` outside `files` renders the first file, and an empty `files` renders no code
  at all.** Both used to reach `files[activeFileIndex]` and throw on the undefined result. The index
  itself is left as bound: resetting it wrote back into a `[(activeFileIndex)]` while the parent was
  still updating.
- A failed `highlight.js` load no longer latches `pending` on, and the line-numbers plugin installs
  its `<style>` and its `copy` listener once instead of once per code block.

## Running it manually

```
ng generate @koobiq/components:code-block-signals --project my-app
```
