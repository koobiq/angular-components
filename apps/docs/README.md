# Documentation application

This is the [Koobiq design system](https://koobiq.io/en) website application.

## Development

Make sure you have the [correct version](../../.nvmrc) of Node.js installed (we recommend using [nvm](https://github.com/nvm-sh/nvm)).

```bash
# Setup Node.js
nvm use

# Install dependencies
yarn install

# Build the packages, the examples and the docs content, then serve the site on http://localhost:4200
yarn run docs

# Only regenerate the docs content, then serve the site and recompile a page on save; needs a previous `yarn run docs`
yarn run docs:start:dev

# Build application (prerendered)
yarn run docs:build
```

The site imports `@koobiq/*` from `dist/`: rerun `yarn run build:components` after changing a component. After
changing an example, rerun `yarn run build:docs-examples` and `yarn run build:package-docs-content` (the source
shown by "Show code" and StackBlitz); after adding or renaming one, run `yarn run build:docs-examples-module` first.
After adding, removing or renaming a route in `src/app/structure.ts`, regenerate the committed `sitemap.xml`,
`prerender-routes.txt` and `llms.txt` with `yarn run docs:generate-sitemap`, `yarn run docs:generate-prerender-routes`
and `yarn run docs:generate-llms`.
