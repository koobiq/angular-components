# Documentation application

This is the [Koobiq design system](https://koobiq.io/en) website application.

## Development

Make sure you have the [correct version](.nvmrc) of Node.js installed (we recommend using [nvm](https://github.com/nvm-sh/nvm)).

```bash
# Setup Node.js
nvm use

# Install dependencies
yarn install

# Build what the site reads (components, the Luxon adapter, the examples), generate the pages, then serve
# them on http://localhost:4200
yarn run docs

# Only regenerate the pages and serve them, once the packages and the examples are built
yarn run docs:start:dev

# Build application (prerendered)
yarn run docs:build
```

The site imports `@koobiq/*` from `dist/`: rerun `yarn run build:components` after changing a component, and
`yarn run build:docs-examples` after changing an example. After adding, removing or renaming a route in
`src/app/structure.ts`, regenerate the committed `sitemap.xml`, `prerender-routes.txt` and `llms.txt` with
`yarn run docs:generate-sitemap`, `yarn run docs:generate-prerender-routes` and `yarn run docs:generate-llms`.
