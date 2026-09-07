# tree-signals

Migration schematic invoked automatically by `ng update @koobiq/components@20`
(registered for `20.3.0-0`). Reports the six public members of `@koobiq/components/tree` that
became read-only in the tree review. It never writes to the tree.

## Background

The tree moved its inputs and its query members to signals. Six members that used to be writable
are now getters — over a `computed()`, over an `InputSignal`, or over an `asObservable()` view of a
`Subject`. Assigning to a getter-only property throws `TypeError: Cannot set property … which has
only a getter` in strict mode, and an ES module is always strict, so an unmigrated write does not
merely stop compiling: it throws at runtime in any build that skips type checking.

| Member                                     | Was                            | Is                                     |
| ------------------------------------------ | ------------------------------ | -------------------------------------- |
| `KbqTreeNodeToggle.disabled`               | `@Input()` accessor pair       | getter over a `computed()`             |
| `KbqTreeBase.nodeDefs`                     | `QueryList<KbqTreeNodeDef<T>>` | `Signal<readonly KbqTreeNodeDef<T>[]>` |
| `KbqTreeNodePadding.indent`                | accessor pair                  | `InputSignal<number \| string>`        |
| `KbqTreeNodePadding.indentUnits`           | writable field                 | getter derived from `indent`           |
| `KbqTreeNodeToggleBaseDirective.recursive` | accessor pair                  | `InputSignalWithTransform<boolean, …>` |
| `KbqTreeOption.onFocus` / `onBlur`         | `Subject<KbqTreeOptionEvent>`  | `Observable<KbqTreeOptionEvent>`       |

Two of them are silent rather than loud:

- `KbqTreeBase` is exported and is the documented extension point for a custom tree. A subclass
  reading `this.nodeDefs.length` now gets `0` — the arity of the signal function — instead of the
  number of node definitions, and `this.nodeDefs.changes.subscribe(…)` throws.
- `KbqTreeNodeToggle` kept `disabled` as the input alias (the input is declared as `disabledInput`),
  so every template binding keeps working. Only imperative writes break, and the class itself
  performed one before the review: the filter state is now OR-ed in by the computed instead.

## What it does

Walks every `.ts` and `.html` file under the project root — the whole workspace when `--project` is
omitted, which is how `ng update` invokes it — skipping `node_modules` and `dist`, and logs the
files that hold a call site one of the narrowings breaks:

| Reported                                          | Manual migration                                                                   |
| ------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `<toggle>.disabled = …`                           | Bind the `disabled` attribute; it still reaches the toggle through `disabledInput` |
| `<toggle>.recursive`                              | Read `recursive()`; bind `kbqTreeNodeToggleRecursive`                              |
| `nodeDefs.changes` / `.length` / `.toArray()` / … | Read `nodeDefs()`; replace the subscription with an `effect`                       |
| `<padding>.indent` / `.indentUnits`               | Read `indent()`; bind `kbqTreeNodePaddingIndent`                                   |
| `<option>.onFocus.next(…)` / `onBlur.next(…)`     | Subscribe instead — the option emits on both streams itself                        |

Each pattern is scoped to files that also name its owner, so a `.disabled =` write in a file that
never mentions a tree toggle stays quiet. A project that renders a tree at all also gets a summary
of all six members, because five of the six are only visible at a call site that writes them — a
consumer that merely reads one gets a value whose type changed under it and no diagnostic at all.

## What it does _not_ do (manual)

Nothing is rewritten. What replaces a write is a template binding or a different member, neither of
which can be derived from the assignment, and a read cannot be mechanically suffixed with `()`
either: `nodeDefs` returns a plain array rather than a `QueryList`, and `indentUnits` is derived
from `indent` rather than stored. The report is the migration.

Receivers are matched by the identifiers in the file rather than by resolved types, so a member
reached through an `any`-typed or structurally-typed receiver in a file that names no tree type is
not reported.
