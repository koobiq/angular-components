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
- Keep `color="contrast"` on navbar item icons: the state icon tokens are not meant to reach them.
- An icon inside a filled contrast button takes `[color]="'empty'"`, so the button colors it against its own fill.
- When navbar items are rendered through `ngTemplateOutlet`, declare each `<ng-template>` next to its outlet and never share one template across containers: the key manager orders items by where the template is declared, not where it is inserted.
- Where two dev-app routes both load `@koobiq/components/filter-bar` (`dev-all`, the SSR shell), load it through one re-export module such as `packages/components-dev/all/filter-bar-chunk.ts`: its internal import cycles break at runtime once the bundler splits them across two chunks. A dev app with a single importer imports it directly.
