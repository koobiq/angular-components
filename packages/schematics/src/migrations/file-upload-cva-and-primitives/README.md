# file-upload-cva-and-primitives

Migration schematic invoked automatically by `ng update @koobiq/components@20`
(registered for `21.0.0-0`). Reports the file-upload behavior the component review changed. It never
writes to the tree.

## Background

The review repaired the two contracts the component is judged on — the form contract and the file-list
primitive.

| Member                              | Before                                      | After                                            |
| ----------------------------------- | ------------------------------------------- | ------------------------------------------------ |
| `writeValue()`                      | wrote through the `file` / `files` setter   | writes the list directly                         |
| `KbqFileList.remove(item)`          | returned the kept items, removed every copy | returns the removed item, removes the first copy |
| `KbqFileList.removeAt(index)`       | rewrote the list and emitted for any index  | ignores an index outside the list                |
| `hasFocus`                          | public, always `false`                      | removed                                          |
| single uploader's hidden input      | `multiple`                                  | single-selection                                 |
| `[multiple]` on the single uploader | forwarded to that input                     | not an input at all                              |
| `KbqInputFileMultipleLabel`         | exported interface                          | deprecated                                       |

`writeValue()` deserves a note. It assigned through the `file`/`files` setters, and those setters call
`cvaOnChange` — the view→model half of the `ControlValueAccessor`. Angular's model→view callback
therefore re-entered the view→model pipeline: every `setValue`/`patchValue` marked the control
**dirty** and emitted `valueChanges` twice, and because `FormControl.reset()` calls `markAsPristine()`
_before_ `setValue()`, a reset uploader came back dirty. The same method also emitted the public
`(fileChange)`/`(filesChange)` output, so a background `patchValue` was indistinguishable from a user
picking a file.

## What it does _not_ do

Nothing is rewritten. `remove()` keeps its signature while returning the opposite array, and whether an
output handler was meant to run for a programmatic write is a decision, not a rename.

| Pattern                             | Manual migration                                                               |
| ----------------------------------- | ------------------------------------------------------------------------------ |
| `.remove(item)`                     | The return value is the removed item now; use `removeAt(index)` for a position |
| `.hasFocus`                         | Track focus with `cdkMonitorSubtreeFocus` or `(focusin)`/`(focusout)`          |
| `(fileChange)` / `(filesChange)`    | Subscribe to the control if the handler was meant to see programmatic writes   |
| `KbqInputFileMultipleLabel`         | Use `KbqMultipleFileUploadLocaleConfiguration`                                 |
| `<kbq-single-file-upload multiple>` | Drop the attribute, or switch to `<kbq-multiple-file-upload>`                  |

## Notes with no call site to point at

- A programmatic value no longer marks the control dirty, and `valueChanges` fires once instead of
  twice. Error display keyed off `dirty` shows fewer errors than before, not more.
- The control is marked touched when focus leaves the uploader, so the default `ErrorStateMatcher`
  shows a `required` error to a user who tabbed through without attaching anything.
- The single uploader renders a single-selection file input, so the system dialog no longer offers a
  multi-selection the component would throw away. Files a drop hands over past the first are reported
  through the new `(rejected)` output, as are duplicates the multiple uploader skips.
- `accept` is documented as what it is: the native attribute, which only filters the system dialog.
  Rejection still needs a validator — `FileValidators.isCorrectExtension` takes the same array.
- The locale gains a `fileUpload.a11y` section holding the live-region announcements. A hand-written
  `KbqLocaleData` registered through `KBQ_LOCALE_DATA` has to add those three keys.
- 22 `--kbq-file-upload-*` custom properties that no rule read were removed, including both
  `*-states-focused-focus-outline-color` tokens. Setting one never had an effect.
- `removeAt()` ignores an index outside the list. It used to rewrite `list` with a fresh array for a
  `splice` that removed nothing — waking every `list()` consumer for a no-op — and emit `itemRemoved`
  carrying `undefined` in a tuple typed `[T, number]`.
- A drop that hands over no files no longer reaches the list. An empty directory unwraps to zero
  files, and under `addStrategy="replace"` that used to clear a selection the user had already built.
- The published types name `KbqBaseFileUploadLocaleConfiguration` and
  `KbqMultipleFileUploadLocaleConfiguration` where they used to name the deprecated `*LocaleConfig`
  aliases. The aliases still resolve to the same types, so no call site has to change.

## Running it manually

```
ng generate @koobiq/components:file-upload-cva-and-primitives --project my-app
```
