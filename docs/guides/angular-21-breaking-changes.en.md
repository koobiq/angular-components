These changes are part of **Koobiq v21.0.0** — the move to Angular 21. The step-by-step upgrade scenario is described in the [migration guide](/en/main/migration); below is the full list of breaking changes.

### Angular 21

**Angular 21**. The library has been updated to Angular 21: `requiredAngularVersion` is now `^21.0.0`, and all `peerDependencies` of the published packages target `^21.0.0`. Consumers must upgrade to Angular 21 and TypeScript 5.9. Node.js requirements are Angular's own: 20.19, 22.12 or 24 and newer.

### Tooling

| Package                   | Version   |
| ------------------------- | --------- |
| TypeScript                | 5.9.3     |
| ng-packagr                | ^21.2.7   |
| @angular/build            | 21.2.25   |
| vitest                    | 4.1.11    |
| @analogjs/vitest-angular  | 2.8.0     |
| @angular-eslint/\*        | ^21.4.0   |
| @schematics/angular       | 21.2.25   |
| @angular-devkit/architect | 0.2102.25 |

The applications and libraries of the workspace are built with the `@angular/build` builders (`application`, `dev-server`, `ng-packagr`), and the root `tsconfig.json` uses `moduleResolution: "bundler"`. Unit tests run on Vitest with `@analogjs/vitest-angular` instead of Jest.

### Zoneless change detection

The components no longer depend on zone.js: they render in an application bootstrapped with `provideZonelessChangeDetection()` and keep working with `provideZoneChangeDetection()`. Work that waited for `NgZone.onStable` now runs after the next render. The documentation site, the StackBlitz template and the development applications of the repository are zoneless.

`MockNgZone` is removed from `@koobiq/components/core`: nothing in the library listens to `onStable` any more, so its `simulateZoneExit()` has nothing to flush. The [migration guide](/en/main/migration) describes what a spec uses instead, and the `zoneless-change-detection` schematic reports each use.

### Animations

The components no longer use `@angular/animations`, which Angular deprecated: their motion is CSS — animations and transitions the components wait for themselves, and `animate.enter` / `animate.leave` in their templates. `@angular/animations` is no longer a peer dependency, `ng add` no longer installs it or adds `provideAnimations()`, and none of the applications of the repository depends on it. The motion is off under `prefers-reduced-motion: reduce` and with `KBQ_ANIMATIONS_CONFIG` (`animationsDisabled: true`).

The triggers the components exported and the members that carried an `AnimationEvent` are removed. The [migration guide](/en/main/migration) lists them with their replacements, and the `angular-animations-removal` schematic reports each use.
