# tags-signals

Migration schematic invoked automatically by `ng update @koobiq/components@21` (registered for
`21.0.0-0`). Migrates `KbqTag`, `KbqTagList` and `KbqTagInput` consumers to their signal-based members.

## What deliberately did not move

What stays an accessor stays for a reason the code enforces, not for want of a transform - a backing
input carries `booleanAttribute`, and a `computed` or `linkedSignal` over it reads back as a signal.

- `KbqTagList` implements `KbqFormFieldControl` and `KbqTagInput` implements `KbqTagTextControl`, which
  declare `value`, `id`, `placeholder`, `required` and `disabled` as plain properties.
- `KbqTag.disabled` is read by the focus key manager as a value (`item.disabled`), and a signal - a
  function - would always be truthy and skip every tag.
- `disabled`, `tabindex` and `value` on the tag and `draggable`, `tabIndex` on the tag list fold in
  state a signal cannot track: the tag list's form control, whose `disabled` is a plain property, and
  the projected text content.

**Their read and write syntax is unchanged**, and the schematic does not touch them.

## What it rewrites

| Before                         | After                    |
| ------------------------------ | ------------------------ |
| `tagInput.addOnBlur`           | `tagInput.addOnBlur()`   |
| `tagInput.separators`          | `tagInput.separators()`  |
| `tag.selected`                 | `tag.selected()`         |
| `tag.editable`                 | `tag.editable()`         |
| `tag.selectable`               | `tag.selectable()`       |
| `tag.removable`                | `tag.removable()`        |
| `list.removable`               | `list.removable()`       |
| `this.tag()?.selected`         | `this.tag()?.selected()` |
| `{{ tag.selected }}` in a view | `{{ tag.selected() }}`   |

The member sets are per class. `KbqTagList` has a `selected` of its own - an array of tags - that did
not move, so `list.selected` is left alone even though `tag.selected` is rewritten.

On receivers typed `KbqTag`, `KbqTagList` or `KbqTagInput` - by annotation, including an aliased import,
or by `inject()`, `viewChild()` and `contentChild()` - and through `!`, parentheses and `as`. Each name is
resolved in its own scope, so a nested binding that shadows the receiver, and `this` inside a `function`
that rebinds it, are left alone. Already-migrated reads are left alone too, so the schematic is
idempotent.

The template pass follows reference variables in external and inline templates. A ref that names an
`exportAs` - `kbqTag`, `kbqTagList`, `kbqTagInput`, `kbqTagInputFor` - holds that instance. A bare ref
holds the component on `<kbq-tag>`, `<kbq-basic-tag>`, `<kbq-tag-list>` and on an element their
attribute selector matches; on the native `<input>` a bare ref is the element itself, so it is not
touched.

## What it does _not_ do

| Pattern                                              | Manual migration                                           |
| ---------------------------------------------------- | ---------------------------------------------------------- |
| `tag.selected = …`                                   | Call `select()`, `deselect()` or `toggleSelected()`        |
| `.separatorKeyCodes = …` / `.tagList = …`            | Bind `[kbqTagInputSeparatorKeyCodes]` / `[kbqTagInputFor]` |
| Any other write, incl. `\|\|=`, `+=`, `++`, `delete` | Bind the attribute; every write form is reported           |
| `query.selected` on an uncalled `viewChild()`        | Read it as `query()?.selected()`                           |
| A class named in a union, an array or `QueryList`    | Reported with its line; resolve the receiver by hand       |

A `@ViewChild(KbqTag)` field holds the instance itself, so its reads are rewritten with a single `()`
and no double call is suggested.

## Notes with no call site to point at

- **A change of the `[selected]` binding still emits `selectionChange`**, the way the old setter did. The
  tag list listens to it, so `selected` is read-only rather than a `linkedSignal`: resetting through one
  would skip the event.
- **`distinct` is a `booleanAttribute` input.** A valueless `distinct` attribute used to pass the
  empty string, which is falsy, so duplicate tags were still accepted.
- **Generated ids come from the CDK `_IdGenerator`** instead of a module-level counter. The shape is
  unchanged for a default `APP_ID`: the CDK omits the app id when it is `ng`, and the counter still
  starts at 0, so a real app keeps getting `kbq-tag-list-0` and `kbq-tag-list-input-0`. Only an app
  that sets `APP_ID` explicitly sees it in the id, right before the counter and with no separator. The
  tag list reports the id of its input when it has one, so both surface through the form field.

## Running it manually

```
ng generate @koobiq/components:tags-signals --project my-app
```

Pass `--fix=false` to see what it would change without writing.
