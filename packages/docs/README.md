
## Production Build
1. generate basic module
```bash
yarn run build:docs-examples-module
```

2. generate dynamic examples
```bash
yarn run build:docs-examples
```

2.1.
```bash
yarn run styles:built-all
```

3. generate `docs-content` folder (dgeni)
```bash
yarn run build:docs-content && yarn run build:package-docs-content
```

4. build
```bash
yarn run docs:prod-build:aot
```


## Development Server
Before building the documentation, you must first build cdk, koobiq and adapters:
```bash
yarn run build:cdk && yarn run build:components && yarn run build:angular-luxon-adapter && yarn run build:angular-moment-adapter && yarn run styles:built-all
```
Generate `docs-content` folder (dgeni)
```bash
yarn run build:docs-content && yarn run build:package-docs-content
```

Generate basic module
```bash
yarn run build:docs-examples-module
```

Generate dynamic examples
```bash
yarn run build:docs-examples
```

Start ng server documentation as dev (source components from packages)
```bash
yarn run docs:start:dev
```
