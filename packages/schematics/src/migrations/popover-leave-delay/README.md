# popover-leave-delay

Migration schematic invoked automatically by `ng update @koobiq/components@20`
(registered for `20.3.0-0`). Reports the popover call sites whose meaning changed in the popover
review. It never writes to the tree.

## Background

Hover mode was broken end to end by a dead expression. `this.leaveDelay ?? 500` looks like a
default, but the base class sets the field to `0`, and `0 ?? 500` is `0` — so the panel closed
before the pointer could cross the 8px gap to it, the documented interactive content was unreachable
even for pointer users, and the auto-hide watchdog spun as an `interval(0)` for as long as the panel
stayed open.

The delay is now derived from the trigger, and `kbqLeaveDelay` is a write-only input that records
having been bound:

- bound in the template — the bound value stands;
- not bound — the `trigger` setter re-derives the delay on every change, so a popover switched to
  `hover` later gets the hover default instead of the `0` it was born with.

A programmatic `trigger.leaveDelay = 500` records nothing, so the next write to `trigger` overwrites
it. That is the one change here with no compile error behind it.

## What it does _not_ do

Nothing is rewritten. Whether an assignment should become a `[kbqLeaveDelay]` binding or simply go
away — the hover default is now long enough on its own — depends on why it was written.

| Pattern           | Manual migration                                              |
| ----------------- | ------------------------------------------------------------- |
| `.leaveDelay = …` | Bind `[kbqLeaveDelay]`, or drop it and take the hover default |
| `.onConfirm = …`  | `onConfirm` is readonly; subscribe instead of replacing       |
| `placementChange` | The handler takes `KbqPopUpPlacementValues`, not `string`     |

## Notes with no call site to point at

- The confirm popover no longer hardcodes its Russian defaults. «Вы уверены, что хотите
  продолжить?» / «Да» come from the locale now, so a non-RU application renders translated text
  where it used to render Russian.
- The trigger subscribed to the global `ScrollDispatcher` with no teardown in the _default_
  configuration. That subscription is bounded now, so a host that worked around the leak by
  destroying triggers eagerly can stop.
- `KbqPopoverTrigger` can be imported standalone — the scroll-strategy provider is no longer
  NgModule-only.

## Running it manually

```
ng generate @koobiq/components:popover-leave-delay --project my-app
```
