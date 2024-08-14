## Production Build

1. generate basic module

```bash
pnpm run build:docs-examples-module
```

2. generate dynamic examples

```bash
pnpm run build:docs-examples
```

2.1.

```bash
pnpm run styles:built-all
```

3. generate `docs-content` folder (dgeni)

```bash
pnpm run build:docs-content && pnpm run build:package-docs-content
```

4. build

```bash
pnpm run docs:prod-build:aot
```

## Development Server

Before building the documentation, you must first build cdk, koobiq and adapters:

```bash
pnpm run build:cdk && pnpm run build:components && pnpm run build:angular-luxon-adapter && pnpm run build:angular-moment-adapter && pnpm run styles:built-all
```

Generate `docs-content` folder (dgeni)

```bash
pnpm run build:docs-content && pnpm run build:package-docs-content
```

Generate basic module

```bash
pnpm run build:docs-examples-module
```

Generate dynamic examples

```bash
pnpm run build:docs-examples
```

Start ng server documentation as dev (source components from packages)

```bash
pnpm run docs:start:dev
```
