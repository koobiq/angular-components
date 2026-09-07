# read-state-dwell-handlers

Migration schematic invoked automatically by `ng update @koobiq/components@20`
(registered for `20.3.0-0`). Renames the `KbqReadStateDirective` dwell handlers and reports the two
changes a rename cannot cover.

## Background

`KbqReadStateDirective` marks its host as read once the user has dwelled on it long enough. It used
to measure the pointer only, so its two handlers were named after the events that called them. It now
measures a keyboard dwell as well, so they are named after what they measure:

| Before                | After          |
| --------------------- | -------------- |
| `mouseenterHandler()` | `startDwell()` |
| `mouseleaveHandler()` | `endDwell()`   |

Both new names take an optional channel argument that defaults to the pointer, so a renamed call keeps
compiling and keeps meaning exactly what it did.

## What it does

The schematic walks every `.ts` file under the project root — the whole workspace when `--project` is
omitted, which is how `ng update` invokes it — skipping `node_modules` and `dist`, and visits only the
files that name `KbqReadStateDirective`. The directive has no selector: a consumer reaches it through
`hostDirectives` and `inject()`, so it is always named.

Within such a file the rename is applied to receivers whose static type is the directive, discovered
by explicit annotation (parameters, class fields, constructor parameter-properties, typed locals) or
by an `inject(KbqReadStateDirective, …)` / `inject<KbqReadStateDirective>(…)` initializer — the shape
a host normally writes, which usually carries no annotation. A method of the same name on an
unrelated receiver is left alone, and a call that already uses the new name is untouched, so the
migration is idempotent.

## What it does _not_ do (manual)

| Pattern                                   | Manual migration                                                                                                                                                           |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `readState.timestamp`                     | Reported. It is a read-only getter now, and `number \| undefined`: it reports the start of the earliest dwell still in progress, and is `undefined` while the host is idle |
| `hostDirectives: [KbqReadStateDirective]` | Reported once per file. Nothing to change — it is the behaviour note below                                                                                                 |

### Behaviour change

The pointer and the keyboard channel are tracked independently and the dwell ends only once both have
left the host. Two consequences no call site can point at:

- A host that keeps focus for longer than `timeToRead` is marked read without a pointer ever touching
  it.
- A pointer leaving no longer ends a dwell that focus is still holding open, so the host is reported
  read later than it used to be when both were in play.

`fix` defaults to `true`. `ng update` invokes migrations with no options at all, and `migrations.json`
declares no schema, so the rule applies that default itself. With `--fix false` every file that would
change is logged instead of written, followed by the same count either way. The reports are printed
in both modes.

[Params](schema.ts)

Usage for Angular Cli:

```shell
ng g @koobiq/components:read-state-dwell-handlers --project <your project>
```

Usage for Nx:

```shell
nx g @koobiq/components:read-state-dwell-handlers --project <your project>
```

### Run locally

Build package

```shell
yarn run build:schematics
```

Run command (for example, for `koobiq-docs` project)

```shell
ng g ./dist/components/schematics/collection.json:read-state-dwell-handlers --project koobiq-docs
```

### Result

#### Before

```ts
import { Component, inject } from '@angular/core';
import { KbqReadStateDirective } from '@koobiq/components/core';

@Component({
    selector: 'my-card',
    template: '...',
    hostDirectives: [KbqReadStateDirective]
})
export class MyCard {
    protected readonly readState = inject(KbqReadStateDirective, { host: true });

    reveal() {
        this.readState.mouseenterHandler();
    }
}
```

#### After

```ts
import { Component, inject } from '@angular/core';
import { KbqReadStateDirective } from '@koobiq/components/core';

@Component({
    selector: 'my-card',
    template: '...',
    hostDirectives: [KbqReadStateDirective]
})
export class MyCard {
    protected readonly readState = inject(KbqReadStateDirective, { host: true });

    reveal() {
        this.readState.startDwell();
    }
}
```
