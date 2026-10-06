These changes are part of **Koobiq v21.0.0** — the move to Angular 21. The step-by-step upgrade scenario is described in the [migration guide](/en/main/migration); below is the full list of breaking changes.

### Angular 21

**Angular 21**. The library has been updated to Angular 21: `requiredAngularVersion` is now `^21.0.0`, and all `peerDependencies` of the published packages target `^21.0.0`. Consumers must upgrade to Angular 21 and TypeScript 5.9. Node.js requirements are Angular's own: 20.19, 22.12 or 24 and newer.

### Tooling

| Package                   | Version   |
| ------------------------- | --------- |
| TypeScript                | 5.9.3     |
| ng-packagr                | ^21.2.7   |
| @angular/build            | 21.2.25   |
| @angular-builders/jest    | 21.0.4    |
| @angular-eslint/\*        | ^21.4.0   |
| @schematics/angular       | 21.2.25   |
| @angular-devkit/architect | 0.2102.25 |

The applications and libraries of the workspace are built with the `@angular/build` builders (`application`, `dev-server`, `ng-packagr`), and the root `tsconfig.json` uses `moduleResolution: "bundler"`.
