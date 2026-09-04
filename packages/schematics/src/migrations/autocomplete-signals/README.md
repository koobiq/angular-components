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
| `autocomplete.autoActiveFirstOption` | `autocomplete.autoActiveFirstOption()`   |
| `autocomplete.openOnFocus`           | `autocomplete.openOnFocus()`             |
| `autocomplete.showPanel` / `.isOpen` | `autocomplete.showPanel()` / `.isOpen()` |
| `autocomplete.showPanel = v`         | `autocomplete.showPanel.set(v)`          |
| `autocomplete.displayWith(value)`    | `autocomplete.displayWith()(value)`      |
| `trigger.autocompleteDisabled`       | `trigger.autocompleteDisabled()`         |

On receivers explicitly typed `KbqAutocomplete` or `KbqAutocompleteTrigger`, and through template
reference variables — `#auto` on `<kbq-autocomplete>`, `#auto="kbqAutocomplete"` and
`#t="kbqAutocompleteTrigger"` — in external and inline templates. Each reference only gets the members
its own type owns, so `autocompleteDisabled` is rewritten on a trigger reference and nowhere else.
Already-migrated reads are left alone, so the schematic is idempotent.

`displayWith` is the one member whose value is a function, so the read and the invocation are separate
calls: an existing `displayWith(value)` is a pre-migration invocation, not a migrated read.

## What it does _not_ do

| Pattern                                 | Manual migration                                                         |
| --------------------------------------- | ------------------------------------------------------------------------ |
| `.classList`                            | Set `class` on `<kbq-autocomplete>`; the classes still land on the panel |
| `.isOpen = …`                           | `attached.set(…)` — but this is the trigger's own state                  |
| `.displayWith = …` / `.openOnFocus = …` | These are `input()`s now; bind them in the template                      |
| `viewChild(KbqAutocomplete)`            | The query is a signal too, so a read through it is a double call         |

`@ViewChild(KbqAutocomplete) a: KbqAutocomplete` is a plain annotated field, so it is rewritten like
any other receiver — `this.a.isOpen()`, a single call. Only the signal-query form needs the double
call.

## What it cannot see

Receivers are found by explicit type annotation, with no cross-package type resolution. A non-null
assertion, parentheses and an aliased import are seen through; a type named in a position that does
not resolve to a single identifier — a union, an array, a `QueryList<…>`, a cast, a return type — is
reported with its line number rather than rewritten, and so is `a['isOpen']` or
`const { isOpen } = a`.

Templates report rather than rewrite when they cannot be parsed, and skip a reference whose name a
`@for` variable, an `@let` or another `#ref` also introduces. A reference is rewritten only inside the
embedded view that declares it.

## Notes with no call site to point at

- **`autoActiveFirstOption`, `openOnFocus` and `kbqAutocompleteDisabled` are `booleanAttribute`
  inputs.** For `autoActiveFirstOption` and `kbqAutocompleteDisabled` that matches the
  `coerceBooleanProperty` they already used, so nothing changes. `openOnFocus` had no coercion at all:
  a valueless attribute or `0` used to read as false and now means `true`, and `'false'` used to read
  as true and now means `false`.
- **Binding `[autoActiveFirstOption]` overrides `KBQ_AUTOCOMPLETE_DEFAULT_OPTIONS`,** even when the
  bound value is `undefined` — as it did before, because the old setter coerced every binding write.
  The token default only applies to an input nobody bound, so leave it unbound to let the token decide.
- **Generated panel ids come from the CDK `_IdGenerator`.** With the default `APP_ID` the shape is
  unchanged (`kbq-autocomplete-0`, `kbq-autocomplete-1`, …); an app or test that sets a custom `APP_ID`
  now gets it embedded, e.g. `kbq-autocomplete-a1` under TestBed. The id is the panel element's `id`.

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
