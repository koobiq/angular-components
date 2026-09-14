# tags-signals

Migration schematic invoked automatically by `ng update @koobiq/components@20` (registered for
`20.3.0-0`). Migrates `KbqTagInput` consumers to its signal-based inputs.

## What deliberately did not move

`KbqTagList` implements `KbqFormFieldControl` and `KbqTagInput` implements `KbqTagTextControl`, both
of which declare their members as plain properties. And most of `KbqTag`'s inputs fold in the tag
list's state:

```ts
get disabled(): boolean {
    return this._disabled || (this.tagList?.disabled ?? false);
}
```

A `model()` cannot carry the `booleanAttribute` transform a valueless attribute needs, so those stay
accessors — the shape the reviewed `KbqButtonToggle` settled on. The backing fields are signals now,
so anything that derives from them can be a computed, but nothing about when they are read changed.
**Their read and write syntax is unchanged**, and the schematic does not touch them.

## What it rewrites

| Before                         | After                          |
| ------------------------------ | ------------------------------ |
| `tagInput.addOnBlur`           | `tagInput.addOnBlur()`         |
| `tagInput.separators`          | `tagInput.separators()`        |
| `this.tagInput()?.addOnBlur`   | `this.tagInput()?.addOnBlur()` |
| `{{ ti.addOnBlur }}` in a view | `{{ ti.addOnBlur() }}`         |

On receivers typed `KbqTagInput` - by annotation, including an aliased import, or by `inject()`,
`viewChild()` and `contentChild()` - and through `!`, parentheses and `as`. Each name is resolved in
its own scope, so a nested binding that shadows the receiver, and `this` inside a `function` that
rebinds it, are left alone. Already-migrated reads are left alone too, so the schematic is idempotent.

The template pass follows reference variables bound through the directive's `exportAs`,
`#ti="kbqTagInput"` or `#ti="kbqTagInputFor"`, in external and inline templates. A bare `#ti` on the
native `<input>` is the element itself, so it is not touched.

## What it does _not_ do

| Pattern                                         | Manual migration                                                      |
| ----------------------------------------------- | --------------------------------------------------------------------- |
| `.separatorKeyCodes = …`                        | Bind `[kbqTagInputSeparatorKeyCodes]`; in exchange it can be read now |
| `.addOnBlur = …`, `\|\|=`, `+=`, `++`, `delete` | Bind `[kbqTagInputAddOnBlur]`; every write form is reported           |
| `query.addOnBlur` on an uncalled `viewChild()`  | Read it as `query()?.addOnBlur()`                                     |
| `KbqTagInput` in a union, array or `QueryList`  | Reported with its line; resolve the receiver by hand                  |

A `@ViewChild(KbqTagInput)` field holds the instance itself, so its reads are rewritten with a single
`()` and no double call is suggested.

## Notes with no call site to point at

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
