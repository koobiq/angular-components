# Navbar item ↔ custom component parity contract (vertical)

## Intent

A plain `kbq-navbar-item` (icon / title / badge built on the shipped primitives) and a custom interactive
component projected through `KBQ_NAVBAR_ITEM_TRIGGER` must render identically for the same logical parameters:
the same leading icon, the same badge, the same title and the same states. This document is the canonical
contract of the vertical navbar item's geometry and interaction, plus an audit of where the two currently
diverge.

## Goals

- Enumerate the vertical item's geometry (expanded and collapsed) as token-backed parameters.
- Enumerate its interaction contract (roving tabindex, role, activation, focus/blur, tooltip, collapse).
- For each parameter, state what a custom component must do to match the plain item.
- Audit the current plain and custom examples and list concrete deltas.

## Non-goals and anti-goals

- Horizontal orientation — out of scope.
- Deep a11y semantics (ARIA roles/names) beyond what focus and keyboard already imply.
- Fixing the examples — that is a separate implementation plan.
- Anti-goals: regress the accepted DS-5344/DS-2719 decisions (40×40 custom area, absolute badge, 3.5px e2e
  alignment tolerance, collapsed behavior); change horizontal auto-collapse (it stays icon-only).

## Constraints

- Vertical only; expanded and collapsed.
- Token values (`@koobiq/design-tokens`): `--kbq-size-m` 12px, `--kbq-size-l` 16px, `--kbq-size-xl` 20px,
  `--kbq-size-4xl` 40px, `--kbq-size-6xl` 56px.
- Navbar item height: `--kbq-navbar-item-vertical-size-height` = 41px (40px content + 1px focus-ring gap).

## Approaches

1. **Rejected: canonical contract only.** A single parameter table with no statement of what currently differs.
2. **Chosen: canonical contract + delta audit.** The table plus a list of today's plain ↔ custom deltas, so the
   spec doubles as the fix checklist.
3. **Rejected: contract + test-coverage map.** A coverage map is useful but answers "what is covered", not "what
   to change"; it can be added as a section later.

## Design — geometry

### Expanded (vertical)

| Parameter                    | Token / rule                                    | Plain item                             | Custom component                                                                                                      |
| ---------------------------- | ----------------------------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Item height                  | `--kbq-navbar-item-vertical-size-height` (41px) | —                                      | —                                                                                                                     |
| Side padding                 | `--kbq-size-xl` (20px)                          | 20px each side                         | 20px each side (`.kbq-expanded` restored for the custom trigger)                                                      |
| Leading slot                 | inline icon, min `--kbq-size-l` (16px)          | icon sits right after the left padding | `:first-child` = 40×40 (`--kbq-size-4xl`), `flex-shrink: 0`, icon left-aligned inside (`justify-content: flex-start`) |
| Gap leading ↔ title          | `--kbq-size-m` (12px)                           | icon ↔ title                           | 40×40 box ↔ title                                                                                                     |
| Container gap title ↔ suffix | `--kbq-size-m` (12px)                           | —                                      | —                                                                                                                     |
| Badge                        | expanded = `position: static`                   | trailing flex child after icon/title   | absolute top-right of the 40×40 box (see audit)                                                                       |
| Title                        | `kbq-navbar-title`, `nowrap` + ellipsis         | —                                      | same when projected                                                                                                   |

### Collapsed (vertical)

| Parameter       | Token / rule                                                 | Plain item    | Custom component   |
| --------------- | ------------------------------------------------------------ | ------------- | ------------------ |
| Width           | `--kbq-size-6xl` (56px)                                      | —             | —                  |
| Alignment       | `justify-content: center`                                    | icon centered | 40×40 box centered |
| Title container | `display: none`                                              | hidden        | hidden             |
| Badge           | absolute, `top: -1 * --kbq-size-3xs`, `right: --kbq-size-xs` | icon corner   | 40×40 corner       |
| Tooltip         | hover-only, title text, placement right, offset 0, arrow off | —             | same via the item  |

## Design — interaction

| Parameter       | Plain `<kbq-navbar-item>`                          | Native `<a>`/`<button>` item | Custom component (`KBQ_NAVBAR_ITEM_TRIGGER`)                   |
| --------------- | -------------------------------------------------- | ---------------------------- | -------------------------------------------------------------- |
| Roving tabindex | `-1`; host owns the single stop; arrows move focus | `-1`                         | `-1`; inner controls `tabindex="-1"`                           |
| Role            | `button`                                           | `null` (native semantics)    | `null` (nested element)                                        |
| Enter / Space   | synthetic `click`                                  | native activation            | none — component owns activation                               |
| Focus           | FocusMonitor                                       | —                            | delegates `focus()` / `focusViaKeyboard()`; exposes `hasFocus` |
| Blur            | hide tooltip, emit `onBlur`                        | —                            | item keeps focus while the component reports `hasFocus`        |
| Tooltip         | owned tooltip (hover, right, offset 0)             | —                            | same, via the item                                             |

## Delta audit (current)

1. **Badge placement in expanded — the main divergence.** A plain item renders its badge as a static flex child
   after the icon/title; the custom component renders it absolute in the top-right corner of the 40×40 leading
   box (which matches the collapsed plain item). Decided: the corner overlay is canonical, so the plain item's
   expanded badge CSS must follow.
2. **Leading area.** A plain item shows the icon inline (16px, no reserved square); the custom component reserves
   40×40 and left-aligns the icon inside. Alignment already matches (e2e `should align the custom component with a
plain item`); the contract above pins the rule.
3. **Title.** The custom example has no title, so its parity counterpart must be titleless (icon + badge only),
   or both must carry the same title.
4. **Activation matrix.** Already aligned by DS-5344/DS-2719 (no synthetic click, `tabindex="-1"`, Enter/Space
   reach the component). No delta found.

## Decisions

1. **Badge placement in expanded = corner overlay.** The badge sits in the top-right corner of the leading icon /
   40×40 box in both expanded and collapsed, matching the custom component. The plain item's expanded badge CSS
   (`position: static`) changes accordingly; the trailing variant stays available but is not the parity target.

## Verification

- Existing e2e already covers alignment, the 40×40 area, tab order and Space activation.
- Once the badge decision is made, add a parity e2e comparing a plain icon+badge item against the custom
  component, plus the standard unit / type / lint gates.

## Left to the implementer

Exact markup of the plain reference example, the badge CSS change implied by the decision, the parity e2e,
and the docs update. All follow from the badge decision above.
