# dl-standalone-names

Migration schematic invoked automatically by `ng update @koobiq/components@21` (registered for
`21.0.0-0`). Moves description list consumers to the names of its standalone components and off its
NgModule where that is a drop-in change.

## Background

The description list review renamed its standalone components to the names the newer components use,
and stopped documenting the NgModule that re-exports them:

| Before           | After                     |
| ---------------- | ------------------------- |
| `KbqDlComponent` | `KbqDl`                   |
| `KbqDtComponent` | `KbqDt`                   |
| `KbqDdComponent` | `KbqDd`                   |
| `KbqDlModule`    | `KbqDl`, `KbqDt`, `KbqDd` |

The old names are deprecated aliases of the same classes until 22.0.0, and `KbqDlModule` still works,
so nothing breaks before then.

## What it rewrites

Only what is imported from `@koobiq/components/dl`, read from the TypeScript AST:

- the renamed classes in named, aliased, type-only and namespace imports, and every use of them - as a
  value, as a type, in a query; an aliased import keeps its local name;
- a re-export keeps the name it exports: `export { KbqDlComponent } from '@koobiq/components/dl'` becomes
  `export { KbqDl as KbqDlComponent } from '@koobiq/components/dl'`, so the files that import it from the
  barrel keep compiling;
- `KbqDlModule` where it is an element of an array - `imports` and `exports` of a component or an
  NgModule, a `TestBed` configuration, a shared constant - becomes `KbqDl, KbqDt, KbqDd`, without the ones
  the array already holds, and the import follows.

## What it does _not_ do

- A `KbqDlModule` that is not an element of an array, such as `importProvidersFrom(KbqDlModule)`, is kept
  and reported: only an array takes the three components in its place.
- A file that reaches the old names through a barrel of the project is left alone; the barrel keeps
  exporting them.
- Templates are not visited: the selectors did not change.

## Running it manually

```
ng generate @koobiq/components:dl-standalone-names --project my-app
```

Pass `--fix=false` to see what would change without writing files.
