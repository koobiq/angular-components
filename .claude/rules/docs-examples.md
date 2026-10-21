---
paths:
    - 'packages/docs-examples/**'
    - 'packages/components-dev/**'
    - 'apps/docs/src/styles/_examples.scss'
---

# Docs examples and dev apps

- Examples live in `packages/docs-examples/components/<name>/<example-name>/<example-name>-example.ts` with a `/** @title ... */` JSDoc, selector `<example-name>-example` and class `<ExampleName>Example`, registered in that folder's `index.ts` NgModule. After adding or renaming one, run `yarn run build:docs-examples-module` to regenerate the committed `packages/docs-examples/example-module.ts` and `packages/docs-examples/loader/index.ts` (the `@koobiq/docs-examples/loader` entry point, kept apart so the pages that show examples do not load it).
- Share data between examples through a file imported by relative path, not through the folder's `index.ts`. Its name does not end in `-example`, so it ships to StackBlitz without a source tab of its own. Rerun `build:docs-examples-module` after adding or removing such an import.
- Every line of an example is shown on the site and in StackBlitz as the component's code, so it carries no dead imports or fields.
- Geometry that only fits the docs viewer frame (negative margins, frame radii) goes to `apps/docs/src/styles/_examples.scss`, keyed to the example's host element with `display: block` (the host is inline) and written in the frame's tokens: padding `--kbq-size-xl`, radius `--kbq-size-m`.
- `color="contrast"` on navbar item icons is intended, so state icon tokens not applying to them is not a bug. Inside a filled contrast button, use `[color]="'empty'"`.
- When navbar items are rendered through `ngTemplateOutlet`, declare each `<ng-template>` next to its outlet and never share one template across containers: the key manager orders items by where the template is declared, not where it is inserted.
- In dev apps, load `@koobiq/components/filter-bar` only through `filter-bar-chunk.ts`: its internal import cycles break at runtime when the bundler splits them across chunks.
