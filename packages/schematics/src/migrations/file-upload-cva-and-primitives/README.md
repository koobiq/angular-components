# file-upload-cva-and-primitives

Migration schematic invoked automatically by `ng update @koobiq/components@20`
(registered for `21.0.0-0`). Reports the file-upload behavior the component review changed. It never
writes to the tree.

## Background

The review repaired the two contracts the component is judged on — the form contract and the file-list
primitive.

| Member                         | Before                                      | After                                            |
| ------------------------------ | ------------------------------------------- | ------------------------------------------------ |
| `writeValue()`                 | wrote through the `file` / `files` setter   | writes the list directly                         |
| `KbqFileList.remove(item)`     | returned the kept items, removed every copy | returns the removed item, removes the first copy |
| `hasFocus`                     | public, always `false`                      | removed                                          |
| single uploader's hidden input | `multiple`                                  | single-selection                                 |
| `KbqInputFileMultipleLabel`    | exported interface                          | deprecated                                       |

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

| Pattern                          | Manual migration                                                               |
| -------------------------------- | ------------------------------------------------------------------------------ |
| `.remove(item)`                  | The return value is the removed item now; use `removeAt(index)` for a position |
| `.hasFocus`                      | Track focus with `cdkMonitorSubtreeFocus` or `(focusin)`/`(focusout)`          |
| `(fileChange)` / `(filesChange)` | Subscribe to the control if the handler was meant to see programmatic writes   |
| `KbqInputFileMultipleLabel`      | Use `KbqMultipleFileUploadLocaleConfig`                                        |

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

## Running it manually

```
ng generate @koobiq/components:file-upload-cva-and-primitives --project my-app
```
