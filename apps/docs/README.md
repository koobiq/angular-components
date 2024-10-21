## [Production Build](../../.github/workflows/actions/build-docs/action.yml)

Before building the documentation, you must first [build packages](#build-packages) and [generate sitemap](#generate-sitemapxml)

```bash
yarn run build:docs-examples-module &&
yarn run build:docs-examples &&
yarn run build:docs-content &&
yarn run build:package-docs-content &&
yarn run docs:build
```

## Generate `sitemap.xml`

```bash
yarn run docs:generate-sitemap
```

## Build packages

```bash
yarn run build:cdk &&
yarn run build:components &&
yarn run build:angular-luxon-adapter &&
yarn run build:angular-moment-adapter &&
yarn run styles:build-all
```

## Generate `docs-content` folder (dgeni)

```bash
yarn run build:docs-content && yarn run build:package-docs-content
```

## Generate basic module

```bash
yarn run build:docs-examples-module
```

## Generate examples

```bash
yarn run build:docs-examples
```

## Debugging

```bash
yarn run docs:start:dev
```
