# dropdown-demote-overlay

Migration schematic invoked automatically by `ng update @koobiq/components@20`
(registered for `20.3.0-0`). Cleans up after the removal of the overlay demotion
mechanism.

## Background

`KbqDropdownTrigger.demoteOverlay` (default `true`) toggled a
`.cdk-overlay-container_dropdown` class on the **shared, app-wide**
`.cdk-overlay-container`, lowering it from `z-index: 1000` to `999` while a
panel was open. `kbq-select` and `kbq-popover` applied the same class
unconditionally. The `KBQ_DROPDOWN_HOST` marker token, provided by `KbqNavbar`
and `KbqTopBar`, flipped the default to `false` so a dropdown inside the chrome
would not slide behind its own trigger.

All of it was removed: the input, the token, the class, and the stylesheet rule.

## Behaviour change

**Dropdown, select and popover panels now render above `kbq-navbar` and
`kbq-top-bar` instead of sliding under them while open.** The overlay container
stays at `z-index: 1000` at all times.

If your app relied on the old behaviour, lower your sticky chrome below the
overlay container z-index (the library ships `$overlay-container-z-index: 1000`)
rather than trying to reinstate the demotion — it lowered _every_ overlay,
including modals, sidepanels and toasts.

## What it does

The schematic walks every `.ts`, `.html`, `.scss` and `.css` file in the project
(skipping `node_modules` and `dist`).

| Auto-fix                                                                                      | Where                                   |
| --------------------------------------------------------------------------------------------- | --------------------------------------- |
| Removes `demoteOverlay`, `demoteOverlay="…"`, `[demoteOverlay]="…"`, `bind-demoteOverlay="…"` | `.html` and inline `template:` literals |
| Removes `{ provide: KBQ_DROPDOWN_HOST, … }` provider entries                                  | `.ts`                                   |
| Removes the `KBQ_DROPDOWN_HOST` import specifier it made invalid                              | `.ts`                                   |
| Drops a `providers: []` array the removal left empty                                          | `.ts`                                   |

Templates are **parsed**, and only nodes the parser reports as attributes are
removed. An identifier of the same name elsewhere — in an interpolation, a
binding expression, a `@if` condition or plain text — is left alone.

Template rules are applied to `.ts` files **only inside inline `template:`
literals**. A wrapper component that declares its own forwarding member
(`@Input() demoteOverlay = false;`) keeps that declaration untouched — only the
binding in its template is removed, and the compiler then points at the now-dead
member.

The provider entry is deleted together with exactly one adjacent separator, so
the surrounding array keeps its shape and nothing else in the file is
reformatted.

## What it does _not_ do (warn-only)

| Pattern                                              | Manual migration                                                                                                                      |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `.demoteOverlay` in `.ts`                            | Delete the read/assignment — there is nothing left to opt out of                                                                      |
| `.demoteOverlay` in a template                       | Drop the read (e.g. via a `#trigger="kbqDropdownTrigger"` reference)                                                                  |
| `KBQ_DROPDOWN_HOST` left over                        | A provider shape the regex could not rewrite (e.g. a `useFactory` returning an object), or an `inject()` call — remove it by hand     |
| `cdk-overlay-container_dropdown` in `.scss` / `.css` | Dead rule — remove it. If it was an override neutralising the demotion, it is now redundant                                           |
| A template mentioning the input that fails to parse  | Nothing is rewritten in it — editing an unparseable template blind is how a migration corrupts bindings. Remove the attribute by hand |

Warnings are checked against the **post-fix** content, so an auto-fixed usage
does not also report as needing manual work. In dry-run mode (`--fix false`)
they are reported against the original content instead.

`fix` defaults to `true`. `ng update` invokes migrations with no options at all,
so the rule applies that default itself rather than relying on the schema.

[Params](schema.ts)

Usage for Angular Cli:

```shell
ng g @koobiq/components:dropdown-demote-overlay --project <your project>
```

Usage for Nx:

```shell
nx g @koobiq/components:dropdown-demote-overlay --project <your project>
```

### Run locally

Build package

```shell
yarn run build:schematics
```

Run command (for example, for `koobiq-docs` project)

```shell
ng g ./dist/components/schematics/collection.json:dropdown-demote-overlay --project koobiq-docs
```

### Result

#### Before

```ts
import { Component } from '@angular/core';
import { KBQ_DROPDOWN_HOST } from '@koobiq/components/dropdown';

@Component({
    selector: 'my-header',
    providers: [{ provide: KBQ_DROPDOWN_HOST, useExisting: MyHeader }],
    template: `
        <button [kbqDropdownTriggerFor]="menu" demoteOverlay="false">Open</button>
    `
})
export class MyHeader {}
```

#### After

```ts
import { Component } from '@angular/core';

@Component({
    selector: 'my-header',
    template: `
        <button [kbqDropdownTriggerFor]="menu">Open</button>
    `
})
export class MyHeader {}
```
