# Documentation application

This is the [Koobiq design system](https://koobiq.io/en) website application.

## Development

Make sure you have the [correct version](.nvmrc) of Node.js installed (we recommend using [nvm](https://github.com/nvm-sh/nvm)).

```bash
# Setup Node.js
nvm use

# Install dependencies
yarn install

# Build packages
yarn run build:cdk
yarn run build:angular-luxon-adapter
yarn run build:angular-moment-adapter
yarn run styles:build-all
yarn run build:components
yarn run build:components-experimental

# Generate content
yarn run build:docs-content
yarn run build:package-docs-content

# Generate examples
yarn run build:docs-examples-module
yarn run build:docs-examples

# Generate sitemap
yarn run docs:generate-sitemap

# Run application
yarn run docs:start:dev
# Then open http://localhost:4200

# Build application
yarn run docs:build
```
