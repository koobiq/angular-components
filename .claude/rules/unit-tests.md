---
paths:
    - 'packages/**/*.spec.ts'
    - 'apps/docs/**/*.spec.ts'
    - 'tools/**/*.spec.ts'
    - 'vitest.config.mts'
    - 'tools/vitest/**'
---

# Unit tests

Vitest setup (`vitest.config.mts`, `tools/vitest/`) that shapes how specs are written:

- The `angular` project compiles specs with `@analogjs/vite-plugin-angular` and runs each file in a jsdom VM context (`vmForks`); the `node` project runs schematics, the CLI and `tools/`. Globals (`describe`, `it`, `expect`, `vi`) are on.
- `tools/vitest/fail-on-console.ts`: a `console.error` or `console.warn` during a test fails it, except jsdom's "Could not parse CSS stylesheet" and Angular's NG0956 tracking hint, which it silences.
- `tools/vitest/to-have-no-violations.ts` registers `toHaveNoViolations()`, which runs axe-core on an element of the document: `await expect(fixture.nativeElement).toHaveNoViolations()`. The matcher is async, and ESLint requires the `await`. jsdom renders nothing, so the rules that need rendering are off: the color rules and `label-content-name-mismatch`, which draws text on a canvas.
- `testTimeout` is 2 seconds; `clearMocks` is on. Vitest also fails the run on an error thrown after a test, such as a listener left behind by a destroyed injector.
- TestBed is zoneless, with the exhaustive `checkNoChanges`: a binding that changed without notifying change detection fails the spec, OnPush views included. State a view reads that is written while change detection runs has to be a signal — a `markForCheck()` made then does not reach a view already checked.
- Without zone.js nothing renders on its own: a check made right after an event needs `fixture.detectChanges()` or `await fixture.whenStable()`, and `whenStable()` does not wait for a bare `setTimeout` (use `PendingTasks` for library work worth waiting for). `fixture.detectChanges()` also marks the test host for check, so plain fields of a test wrapper still render.
- zone.js is not loaded, and ESLint bans `fakeAsync`, `tick`, `flush`, `flushMicrotasks`, `discardPeriodicTasks` and `waitForAsync`. Time is driven with `vi.useFakeTimers()` (`await vi.advanceTimersByTimeAsync(ms)`, `await vi.runOnlyPendingTimersAsync()`). With all timers faked, `whenStable()` hangs once a render is scheduled, because the zoneless scheduler waits on a faked timer: advance the timers and call `fixture.detectChanges()`, or fake only `setTimeout`/`clearTimeout`. A zero-delay timer set from inside another timer fires 1 ms later on the fake clock. axe-core needs real timers.
- rxjs time operators (`timeout`, `delay`, `debounceTime`, `auditTime`) schedule through `setInterval`, so a spec that drives them fakes `setInterval`/`clearInterval` as well.
- Event and typing helpers (`dispatchFakeEvent`, `dispatchKeyboardEvent`, `dispatchMouseEvent`, `typeInElement`, ...) are exported from `@koobiq/components/core`.
- jsdom has no Web Animations API, so what a component waits for with `kbqAfterAnimations` ends right after the next render. A spec that has to hold an animation open stubs `element.getAnimations` with an animation whose `finished` it resolves (see `toast.spec.ts`).
- Test host components, and test-only interfaces, types, enums and host selectors, carry no `Kbq`/`kbq-` prefix (`TestApp`, `BasicSelect`): the prefix marks public API. Lint does not check this.

## Writing specs

- Before asserting a focus origin, call `TestBed.inject(InputModalityDetector)` and create mouse events with `{ buttons: 1, detail: 1 }`: the detector is created lazily, and CDK reads a mousedown with zero buttons and detail as a screen reader, that is as keyboard.
- Synthetic events set no focus origin, so test focus restoration by spying on `FocusMonitor.focusVia` rather than by reading `.cdk-keyboard-focused`.
- Pin an Angular error that fires only in dev mode (NG0309, NG0100) with a unit spec: e2e and the docs build run in production mode, so nothing else catches it.
- `strictPropertyInitialization` is off and `useDefineForClassFields` is `false`, so an optional or uninitialized field guards nothing at runtime. Guard sentinel and first-emission invariants with a spec, and check that the spec fails once the regression is put back.
- Build expected strings that contain NBSP, narrow spaces or dashes from named constants (`const NBSP = '\u00A0'`), not literal characters: they are invisible in review and get swapped when retyped.
- A bug that needs zone.js reproduces only in `tools/check-angular`, the consumer app with zone.js. To model zone.js running change detection between two listeners of one click in a repo spec, call `fixture.detectChanges()` from a listener placed between them.
- Stub geometry as a getter that returns 0 unless the element is connected: static numbers let broken measurement code pass.
- With `HttpTestingController`, a request that an rxjs `timeout` cancelled still sits in the open list: take it with `expectOne()` before `verify()` and check `request.cancelled`.
- In docs app specs, `@koobiq/docs-examples` and `@koobiq/docs-examples/loader` resolve to the stubs in `apps/docs/src/testing/` (root `tsconfig.json` paths), so no real example loads. A spec that needs one remaps the path.
