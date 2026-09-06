# top-bar-container-selectors

Migration schematic invoked automatically by `ng update @koobiq/components@20`
(registered for `21.0.0-0`). Renames the two placement classes of
`[kbqTopBarContainer]` and the flex-basis token of the `start` container.

## Background

`[kbqTopBarContainer]` applied `kbq-top-bar-container__start` and
`kbq-top-bar-container__end`. Both are **modifiers** of
`.kbq-top-bar-container`, but they were spelled with the `__` element
separator. The library spells modifiers with a single `_` — the component
itself does so one line away, in `kbq-top-bar_with-shadow`.

The `start` container was `flex: 1 0 var(--kbq-top-bar-container-start-basis)`.
With `flex-shrink: 0` that basis was never a basis: it was the width the
container could not fall below, so every caller that put content on the left had
to invent a value for it. The container is `flex: 1 1 auto` now, and the floor
is spelled `--kbq-top-bar-container-start-min-width`.

## Behaviour change

The `start` container **shrinks toward** the floor you set instead of being
pinned at it. Previously an overflowing bar kept the start container at exactly
its basis and made the end container absorb the whole overflow; now both give
way, and the start container stops at
`--kbq-top-bar-container-start-min-width` (default `0`).

`kbq-top-bar` also moved off the CDK overlay layer: it carries
`z-index: var(--kbq-top-bar-z-index)` (`990`) instead of `1000`. An override
that raised something above the bar to break that tie is now redundant.

`--kbq-top-bar-position` still defaults to `sticky` and still does nothing on
its own. Set `--kbq-top-bar-inset-block-start: 0` to make the bar stick to the
top of its scrolling ancestor.

## What it does

The schematic walks every `.ts`, `.html`, `.scss` and `.css` file in the project
(skipping `node_modules` and `dist`) and only opens the ones that mention
`kbq-top-bar`.

| Auto-fix                                                                          | Where               |
| --------------------------------------------------------------------------------- | ------------------- |
| `kbq-top-bar-container__start` → `kbq-top-bar-container_start`                    | all four extensions |
| `kbq-top-bar-container__end` → `kbq-top-bar-container_end`                        | all four extensions |
| `--kbq-top-bar-container-start-basis` → `--kbq-top-bar-container-start-min-width` | all four extensions |

The replacement is textual on purpose. Both strings are owned by the library and
appear nowhere else, in any language, so there is no shape a parser would
resolve differently — and a class name is as likely to live in a template
string, a `styles` block or a `classList.add` call as in a stylesheet.

## What it does _not_ do (warn-only)

| Pattern                                 | Manual migration                                                                                                                                                                                                                                            |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.kbq-top-bar-container[placement='…']` | Select the class the directive applies (`.kbq-top-bar-container_start` / `_end`). The attribute selector matches only the static `placement="start"` form; a `[placement]` property binding leaves no attribute behind and the rule silently stops applying |

Warnings are checked against the **post-fix** content, so an auto-fixed usage
does not also report as needing manual work.

`fix` defaults to `true`. `ng update` invokes migrations with no options at all,
so the rule applies that default itself rather than relying on the schema.

[Params](schema.ts)

Usage for Angular Cli:

```shell
ng g @koobiq/components:top-bar-container-selectors --project <your project>
```

Usage for Nx:

```shell
nx g @koobiq/components:top-bar-container-selectors --project <your project>
```

### Run locally

Build package

```shell
yarn run build:schematics
```

Run command (for example, for `koobiq-docs` project)

```shell
ng g ./dist/components/schematics/collection.json:top-bar-container-selectors --project koobiq-docs
```

### Result

#### Before

```scss
.kbq-top-bar-container__start {
    --kbq-top-bar-container-start-basis: 160px;
}
```

#### After

```scss
.kbq-top-bar-container_start {
    --kbq-top-bar-container-start-min-width: 160px;
}
```
