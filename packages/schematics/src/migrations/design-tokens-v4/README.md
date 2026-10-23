### Design Tokens v4 schematics

This schematic moves a project to `@koobiq/design-tokens` 4, which `@koobiq/components` now requires.

The bump is not optional — `@koobiq/components` declares `@koobiq/design-tokens@^4.1.0` as a peer
dependency now. v4 removed the component tokens except for code-block, scrollbar and skeleton, which it
ships as opt-in files; a project needs nothing extra for those three, since `@koobiq/components`' own
`prebuilt-themes/theme.css` already bakes their values in.

The entry is rewritten wherever the project declared it, `dependencies` or `devDependencies`, and
added to `dependencies` when it declared it nowhere: a project can reach the tokens through the
library's peer dependency alone, with npm having installed them and nothing in `package.json` saying
so. An install is scheduled afterwards.

The rest of the upgrade is in a project's own stylesheets, and `@koobiq/design-tokens` ships a codemod
for it, so this schematic points at that instead of reimplementing the same rewrite:

```bash
npx koobiq-tokens-codemod src
```

It is warn-only about the two manual steps: running the codemod, and looking at the code blocks and
scrollbars — the only two places v4 changes pixels without being asked.

[Params](schema.ts)

Usage for Angular Cli:

```shell
ng g @koobiq/components:design-tokens-v4 --project "<your project>"
```

Usage for Nx:

```shell
nx g @koobiq/components:design-tokens-v4 --project "<your project>"
```

### Run locally

Build package

```shell
yarn run build:schematics
```

Run command (for example, for `koobiq-docs` project)

```shell
ng g ./dist/components/schematics/collection.json:design-tokens-v4 --project koobiq-docs
```

### Result

#### Before

```json
{
    "dependencies": {
        "@koobiq/components": "^21.0.0",
        "@koobiq/design-tokens": "^3.14.0"
    }
}
```

#### After

```json
{
    "dependencies": {
        "@koobiq/components": "^21.0.0",
        "@koobiq/design-tokens": "^4.1.0"
    }
}
```
