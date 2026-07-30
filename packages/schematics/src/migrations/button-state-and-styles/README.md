# button-state-and-styles

Migration schematic invoked automatically by `ng update @koobiq/components@20`
(registered for `20.3.0-0`). Migrates consumers of the v20.3.0 button review.

## Background

The review of `[kbq-button]` changed three unrelated things at once, which is why
one schematic covers all of them:

1. **Host attributes.** `disabled` and `aria-disabled` are now chosen by host
   tag instead of being applied to both; `tabindex` is omitted when it would be
   redundant; an `<a kbq-button>` without `href` is announced as a button.
2. **Button group ownership.** `KbqButtonGroupRoot` used to overwrite every
   nested button's `kbqStyle` and `color` on each update. It now treats a button
   that sets them itself as the owner, and its `disabled` became additive.
3. **Styles.** Four physical border-radius mixins were replaced by logical ones,
   the `.kbq-progress` utility moved into `kbq-core()`, and two custom properties
   that nothing read were dropped.

## What it does

The schematic walks every `.ts`, `.html`, `.scss` and `.css` file in the project
(skipping `node_modules` and `dist`).

| Auto-fix                                                                    | Where            |
| --------------------------------------------------------------------------- | ---------------- |
| `@include border-right-radius(…)` → `@include border-inline-end-radius(…)`  | `.scss` / `.css` |
| `@include border-left-radius(…)` → `@include border-inline-start-radius(…)` | `.scss` / `.css` |
| `@include border-top-radius(…)` → `@include border-block-start-radius(…)`   | `.scss` / `.css` |
| `@include border-bottom-radius(…)` → `@include border-block-end-radius(…)`  | `.scss` / `.css` |

This is the only mandatory mechanical change in the release: the four mixins were
removed from `core/styles/common/_groups-mixins.scss` and
`core/styles/common/_groups.scss` (the latter re-exported through
`core/styles/common/_index.scss`), so an unmigrated stylesheet no longer compiles.

The rewrite is anchored on `@include`, because these identifiers only ever appear
as Sass mixin calls. A CSS declaration (`border-top-left-radius`), a custom
property (`--border-top-radius`) or a comment mentioning the old name is never
touched.

> **The replacement is not a pure rename.** `border-inline-end-radius` follows
> `dir`, so under `dir="rtl"` it rounds the corners `border-right-radius` did
> not. That is the intent — the library moved its own group styling the same way
> — but a physically-designed RTL layout will change.

## Group ownership findings

Templates are **parsed**, and a button is reported only when it sits inside a
group (`kbqButtonGroupRoot`, `<kbq-button-group>` or `[kbq-button-group]`) **and**
declares a `kbqStyle`, `color` or `disabled` of its own — in any binding form
(`color="…"`, `[color]="…"`, `bind-color="…"`). A standalone button is
unaffected by the ownership rule, so reporting it would be noise.

```html
<div kbqButtonGroupRoot [kbqStyle]="groupStyle">
    <button kbq-button [kbqStyle]="ownStyle">Reported — the group no longer wins</button>
    <button kbq-button>Not reported — still inherits from the group</button>
</div>
```

Nesting is tracked through the traversal, so a button inside an `@if` block, or a
group nested in another group, is found once. Findings carry a line number; for
an inline `@Component({ template })` it is offset to point into the `.ts` file.

Template rules are applied to `.ts` files **only inside inline
`@Component({ template })` literals**, located through the TypeScript AST — a
`template` property of some other object is not a component template.

## What it warns about

Nothing below is auto-fixed: each needs a decision, and rewriting it blind would
be wrong more often than right.

**`.ts`**

| Trigger                                     | Why                                                                                                                                     |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `KbqButtonGroupRoot`                        | `disabled` is now `boolean \| undefined` and additive — re-enabling the group no longer enables a button disabled through its own input |
| `KbqButtonCssStyler`                        | `nativeElement` became `readonly`; `icons` is typed `Signal<readonly KbqIcon[]>` instead of `readonly any[]`                            |
| `getAttribute('disabled')` / `hasAttribute` | `<a kbq-button>` no longer renders `disabled`; `<button kbq-button>` no longer renders `aria-disabled`                                  |
| `KBQ_LOCALE_DATA` / `.addLocale(`           | locale data gained an `a11y` section; custom data without it falls back to the ru-RU accessible names                                   |

**`.scss` / `.css`**

| Trigger                                        | Why                                                                                                     |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `--kbq-button-icon-size-vertical-padding`      | removed — nothing read it even before 20.3.0, so the override was already inert                         |
| `--kbq-button-icon-size-content-padding`       | same                                                                                                    |
| `[disabled]` in a file mentioning `kbq-button` | `a[kbq-button][disabled]` never matches now — use `.kbq-disabled` or `[aria-disabled="true"]`           |
| `@use '…/core/styles/common[/animation]'`      | the import no longer emits `.kbq-progress` or its keyframes; they moved into the `kbq-progress()` mixin |

A template that mentions a group but fails to parse is reported rather than
guessed at, because a regex cannot tell which buttons are inside the group.

## Behaviour note

Printed once per run, since none of it needs a code change but all of it is
visible in tests and screenshots:

- `<a kbq-button [disabled]>` drops `disabled`, keeps `aria-disabled="true"`, `tabindex="-1"` and `.kbq-disabled`
- `<button kbq-button [disabled]>` drops `aria-disabled`, keeps the native `disabled`
- `<button kbq-button>` no longer renders `tabindex="0"` (anchors still do)
- `<a kbq-button>` without `href` is announced as `role="button"`
- every `[kbqDropdownTriggerFor]` renders `aria-expanded`
- the built-in icon-only buttons render a localized `aria-label`
- icon gaps and group corner radii follow `dir`
- `.kbq-progress` is emitted by `kbq-core()` only

## Usage

```bash
# automatically, as part of the update
ng update @koobiq/components@20

# or manually
ng g @koobiq/components:button-state-and-styles --project <your project>

# dry run — report without writing
ng g @koobiq/components:button-state-and-styles --project <your project> --fix false
```

## Options

| Option      | Default | Description                                                    |
| ----------- | ------- | -------------------------------------------------------------- |
| `--project` | —       | Project to migrate. Omitted, the migration runs over the tree. |
| `--fix`     | `true`  | When `false`, prints what would change without writing.        |
