# split-button-optional-disabled

Migration schematic invoked automatically by `ng update @koobiq/components@20`
(registered for `20.3.0-0`). Reports the `KbqSplitButton` members whose type changed in the
split-button review. It never writes to the tree.

## Background

`disabled` was published as `boolean`, but the backing field is declared without an initializer and
the setter returns early for `undefined`. A `<kbq-split-button>` with no `[disabled]` binding
therefore reported `undefined` from a non-nullable type:

```ts
const flag: boolean = splitButton.disabled; // held undefined
if (splitButton.disabled === false) { … }   // never ran
```

The getter now reports `boolean | undefined`, which is what the sibling `KbqButtonGroupRoot` has
always reported. Nothing about the runtime value changed — the call sites that were quietly wrong
now fail to compile.

The `buttons` content query moved from `QueryList<KbqButton>` to a signal query in the same review.
It is `protected`, so only a subclass sees it.

## What it does _not_ do

Nothing is rewritten. Narrowing `boolean | undefined` back to `boolean` is a decision — `?? false`,
a non-null assertion, or handling the third state — and which one is right depends on what the call
site does with the value.

| Pattern                           | Manual migration                                                           |
| --------------------------------- | -------------------------------------------------------------------------- |
| `.disabled` on a `KbqSplitButton` | `?? false` for the common reading, or handle the unset state explicitly    |
| `buttons.*` in a subclass         | Read `buttons()` and use array methods; `buttons.changes` no longer exists |

## Notes with no call site to point at

- A `<kbq-split-button>` with no projected button no longer throws outside dev mode. The guard sits
  behind `isDevMode()`, so production renders an empty control instead of aborting the change
  detection pass of whoever rendered it. A host that used the throw as a runtime assertion needs its
  own check.

## Running it manually

```
ng generate @koobiq/components:split-button-optional-disabled --project my-app
```
