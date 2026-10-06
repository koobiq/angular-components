# zoneless-change-detection

Migration schematic invoked automatically by `ng update @koobiq/components@21`
(registered for `21.0.0-0`). Reports the uses of the removed `MockNgZone` testing helper. It never
writes to the tree.

## Background

Koobiq components no longer depend on zone.js. They render in applications bootstrapped with
`provideZonelessChangeDetection()` and keep working with `provideZoneChangeDetection()`. Nothing in the
library waits for `NgZone.onStable` any more: the work it deferred to that event now runs after the next
render (`afterNextRender`).

`MockNgZone` existed to fire `onStable` on demand in specs, so it is removed from
`@koobiq/components/core`.

## What it does _not_ do

Nothing is rewritten: what a spec should do instead depends on what it was waiting for.

| Pattern               | Manual migration                                                                     |
| --------------------- | ------------------------------------------------------------------------------------ |
| `MockNgZone`          | Remove the import and the `{ provide: NgZone, useFactory: () => new MockNgZone() }`  |
| `.simulateZoneExit()` | `fixture.detectChanges()`, or `await fixture.whenStable()` (`tick()` in `fakeAsync`) |

## Running it manually

```
ng generate @koobiq/components:zoneless-change-detection --project my-app
```
