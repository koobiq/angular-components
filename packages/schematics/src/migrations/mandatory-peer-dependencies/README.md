### Mandatory Peer Dependencies schematics

This schematic adds the packages that became mandatory `peerDependencies` of `@koobiq/components`. It includes:

- `@angular/animations`, at the range the project already uses for `@angular/core`
- `overlayscrollbars`
- `@koobiq/date-adapter`

npm installs a newly mandatory peer on upgrade by itself, but Yarn does not and pnpm only does with
`auto-install-peers`. Those projects would otherwise upgrade into a build that fails with
`Cannot find module 'overlayscrollbars'`, since `ng add` is the only other place that writes these packages and
`ng update` never runs it.

`@angular/animations` is deliberately taken from the project rather than from the library: every
`@angular/animations` release pins `@angular/core` exactly, so any other range resolves to a version
incompatible with the Angular the project is on, and `npm install` fails with `ERESOLVE`.

An entry the project already declares is left untouched, so a `@koobiq/date-adapter` pinned below `3.4.0` keeps
its version. That one is not an install error but a `TypeError: this.dateAdapter.addCalendarUnits is not a
function` inside `kbq-time-range`, so the schematic warns about it instead. The warning is only printed for a
project that brought its own range — one that had no entry at all just received the current one.

[Params](schema.ts)

Usage for Angular Cli:

```shell
ng g @koobiq/components:mandatory-peer-dependencies --project <your project>
```

Usage for Nx:

```shell
nx g @koobiq/components:mandatory-peer-dependencies --project <your project>
```

### Run locally

Build package

```shell
yarn run build:schematics
```

Run command (for example, for `koobiq-docs` project)

```shell
ng g ./dist/components/schematics/collection.json:mandatory-peer-dependencies --project koobiq-docs
```

### Result

#### Before

```json
{
    "dependencies": {
        "@angular/core": "^20.3.0",
        "@koobiq/components": "^20.3.0"
    }
}
```

#### After

```json
{
    "dependencies": {
        "@angular/animations": "^20.3.0",
        "@angular/core": "^20.3.0",
        "@koobiq/components": "^20.3.0",
        "@koobiq/date-adapter": "^3.5.1",
        "overlayscrollbars": "2.7.3"
    }
}
```
