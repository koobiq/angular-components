# autocomplete-signals

Migration schematic invoked automatically by `ng update @koobiq/components@20` (registered for
`20.3.0-0`). Migrates `KbqAutocomplete` and `KbqAutocompleteTrigger` consumers to the finished
signal-based API.

## Background

Four accessor inputs and one write-target input survived the automated signal migration. `classList`
was the odd one: declared `@Input('class')`, its setter accumulated class names into an object that
the panel template binds, and cleared the host's `className` as a side effect. It is an internal
`computed` now, fed by a `class` signal input — `class="..."` on `<kbq-autocomplete>` keeps working
exactly as before.

`isOpen` was asymmetric: `set isOpen(v)` stored a flag, `get isOpen()` returned that flag **and**
`showPanel`. Writing `true` and reading it back returned `false` whenever the panel had no options.
It is a `computed` now — `attached() && showPanel()` — with `attached` as the writable half the
trigger owns.

## What it rewrites

| Before                               | After                                    |
| ------------------------------------ | ---------------------------------------- |
| `autocomplete.displayWith`           | `autocomplete.displayWith()`             |
| `autocomplete.autoActiveFirstOption` | `autocomplete.autoActiveFirstOption()`   |
| `autocomplete.openOnFocus`           | `autocomplete.openOnFocus()`             |
| `autocomplete.showPanel` / `.isOpen` | `autocomplete.showPanel()` / `.isOpen()` |
| `trigger.autocompleteDisabled`       | `trigger.autocompleteDisabled()`         |

On receivers explicitly typed `KbqAutocomplete` or `KbqAutocompleteTrigger`, and through template
reference variables on `<kbq-autocomplete>`, in external and inline templates. Already-migrated reads
are left alone, so the schematic is idempotent.

## What it does _not_ do

| Pattern                      | Manual migration                                                         |
| ---------------------------- | ------------------------------------------------------------------------ |
| `.classList`                 | Set `class` on `<kbq-autocomplete>`; the classes still land on the panel |
| `.isOpen = …`                | `attached.set(…)` — but this is the trigger's own state                  |
| `viewChild(KbqAutocomplete)` | The query returns the instance, so a read is a double call               |

## Notes with no call site to point at

- **`autoActiveFirstOption`, `openOnFocus` and `kbqAutocompleteDisabled` are `booleanAttribute`
  inputs.** They used `coerceBooleanProperty` or nothing at all before; a valueless attribute means
  `true` now.
- **Binding `[autoActiveFirstOption]` overrides `KBQ_AUTOCOMPLETE_DEFAULT_OPTIONS`,** even when the
  bound value is `undefined`. The token default only applies to an input nobody bound, so leave it
  unbound to let the token decide. This one bites when converting a field write into a binding.
- **Generated panel ids changed shape**, from `kbq-autocomplete-1` to `kbq-autocomplete-a1`. It is
  the value of the trigger's `aria-owns`.

- **Classes from the `class` attribute replace each other on the panel instead of accumulating.** The
  old setter merged every value it was given into an object it never cleared, so a `[class]` binding
  that changed from `"a"` to `"b"` left the panel with both.

`options` stays a `QueryList` content query: `ActiveDescendantKeyManager` and the panel-closing
stream both rely on its `changes` semantics.

## Running it manually

```
ng generate @koobiq/components:autocomplete-signals --project my-app
```

Pass `--fix=false` to see what it would change without writing.
