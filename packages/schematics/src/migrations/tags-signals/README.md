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

| Before                | After                   |
| --------------------- | ----------------------- |
| `tagInput.addOnBlur`  | `tagInput.addOnBlur()`  |
| `tagInput.separators` | `tagInput.separators()` |

On receivers explicitly typed `KbqTagInput`. Already-migrated reads are left alone, so the schematic
is idempotent. There is no template pass: `kbqTagInputFor` is an attribute on a native `<input>`, and
nothing on `<kbq-tag>` or `<kbq-tag-list>` changed its read syntax.

## What it does _not_ do

| Pattern                  | Manual migration                                                      |
| ------------------------ | --------------------------------------------------------------------- |
| `.separatorKeyCodes = …` | Bind `[kbqTagInputSeparatorKeyCodes]`; in exchange it can be read now |
| `.addOnBlur = …`         | Bind `[kbqTagInputAddOnBlur]`                                         |
| `viewChild(KbqTagInput)` | The query returns the instance, so a read is a double call            |

## Notes with no call site to point at

- **`distinct` is a `booleanAttribute` input.** A valueless `distinct` attribute used to pass the
  empty string, which is falsy, so duplicate tags were still accepted.
- **Generated ids changed shape**, from `kbq-tag-list-1` / `kbq-tag-list-input-1` to
  `kbq-tag-list-a1` / `kbq-tag-list-input-a1`. The tag list reports the id of its input when it has
  one, so both surface through the form field.

## Running it manually

```
ng generate @koobiq/components:tags-signals --project my-app
```

Pass `--fix=false` to see what it would change without writing.
