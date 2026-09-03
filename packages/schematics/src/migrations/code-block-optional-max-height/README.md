# code-block-optional-max-height

Migration schematic invoked automatically by `ng update @koobiq/components@20` (registered for
`20.3.0-0`). Reports the `KbqCodeBlock` members whose type changed in the code block review. It never
writes to the tree.

## Background

`maxHeight` was published as `InputSignal<number>` over an `undefined!` default, so a code block with
no `[maxHeight]` binding reported `undefined` from a non-nullable type:

```ts
const height: number = codeBlock.maxHeight(); // held undefined
if (codeBlock.maxHeight() > 0) { … }          // NaN comparison, never true
```

It reports `number | undefined` now. Nothing about the runtime value changed — the call sites that
were quietly wrong now fail to compile.

`KbqCodeBlockHighlight.file` was a write-only required input: a setter with no getter that kicked off
highlighting as a side effect. It is `input.required()` driven by an effect now, so it can finally be
read — and a programmatic write no longer compiles.

## What it does _not_ do

Nothing is rewritten. Narrowing `number | undefined` back to `number` is a decision — `?? 0`, a
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
- `softWrap`, `viewAll`, `canDownload`, `activeFileIndex` and `files` are backed by signals. They stay
  accessor inputs with the same types and the same two-way outputs — they are written by the component
  as well as by the binding, and a `model()` cannot carry the `booleanAttribute` /
  `numberAttribute` transform they need. No call site changes; a template that reads them just
  re-renders on its own now.

- **Shrinking `files` so that `activeFileIndex` equals the new length now resets the active file to 0.** The guard compared `files.length < activeFileIndex`, which left the first out-of-range index
  in place, and the block then rendered from an undefined file.

## Running it manually

```
ng generate @koobiq/components:code-block-optional-max-height --project my-app
```
