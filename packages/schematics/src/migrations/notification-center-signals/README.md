# notification-center-signals

Migration schematic invoked automatically by `ng update @koobiq/components@20`
(registered for `20.3.0-0`). Reports the notification-center API changes a consumer's code can point
at. It only reports — it never writes to the tree.

## Background

The notification-center review reworked the trigger and the service. Four of those changes break
consumer code, and none of them can be rewritten mechanically: each needs a decision the schematic
cannot make.

## What it reports

| Pattern                                                                      | Why                                                                                                                                                                                                          |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `KBQ_NOTIFICATION_CENTER_SCROLL_STRATEGY_FACTORY_PROVIDER`                   | Gone from the entry point, so the import fails with `TS2305`. `KBQ_NOTIFICATION_CENTER_SCROLL_STRATEGY` and `kbqNotificationCenterScrollStrategyFactory` are still exported — write the provider out by hand |
| `onReload.emit()` / `onNextPage.emit()` / `onDelete.emit(…)`                 | The three streams are `Subject`s instead of `EventEmitter`s, so `.emit()` is gone. The replacement is `.next()`, but the member names are too common for a blind textual rewrite                             |
| `trigger.backdropClass` / `panelClass` / `offset` / `scrolledToBottomOffset` | They are `input()` signals now: a read is a call, and a write has to become a template binding, because an `input()` has no `.set()`                                                                         |
| `service.changes.subscribe((state) => …)`                                    | `changes` is an `Observable<void>` — a ping. The value handed to a subscriber is always `undefined`                                                                                                          |

Only `.ts` files that name the notification center are looked at, so the member names above stay
scoped to it. The last two are matched textually within such a file, so verify the reported accesses
belong to the notification center.

A read that is already written as a call (`trigger.offset()`) and a `changes` subscriber that already
ignores its payload (`changes.subscribe(() => …)`) are not reported, so a migrated project stays
quiet.

## What it does _not_ report

`KbqNotificationCenterAnimations` (the panel never used it), the `header` / `footer` fields of the
trigger (never rendered) and `KbqNotificationItem` no longer extending `Omit<KbqToastData,
'closeButton'>` (the interface reproduces every member it used to inherit) are all removals nothing
could depend on.

`KbqReadStateDirective`, which the notification item hosts, is covered by its own
[`read-state-dwell-handlers`](../read-state-dwell-handlers/README.md) migration.

[Params](schema.ts)

Usage for Angular Cli:

```shell
ng g @koobiq/components:notification-center-signals --project <your project>
```

Usage for Nx:

```shell
nx g @koobiq/components:notification-center-signals --project <your project>
```

### Run locally

Build package

```shell
yarn run build:schematics
```

Run command (for example, for `koobiq-docs` project)

```shell
ng g ./dist/components/schematics/collection.json:notification-center-signals --project koobiq-docs
```
