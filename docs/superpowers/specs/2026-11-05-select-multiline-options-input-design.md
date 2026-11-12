# Select multilineOptions input design

## Intent and why

DS-3000 currently demonstrates multiline options through `panelWidth="auto"`, `panelClass` and consumer CSS. The user wants one Select parameter to enable the behavior instead, with an API consistent with the existing Filter Bar `multilineOptions` name.

## Goals

- Add a public boolean `multilineOptions` input to `KbqSelect`, defaulting to `false`.
- When enabled, wrap option names and captions and let options grow to different heights.
- When no explicit `panelWidth` is set, use `auto` so the panel follows the trigger width and wrapping actually occurs.
- Preserve an explicitly provided `panelWidth` as the width override.
- Recompute the effective width when `multilineOptions`, `panelWidth` or `panelMinWidth` changes while the panel is open.
- Support the same option through `KBQ_SELECT_OPTIONS` / `kbqSelectOptionsProvider`.
- Replace the CSS-based DS-3000 docs recipe with the new input in the same PR #2325.

## Non-goals and anti-goals

- Do not change the existing `multiline` input, which controls the selected-value trigger and implies multiple selection.
- Do not add per-option wrapping inputs or change shared `KbqOption` API.
- Do not change default behavior when `multilineOptions` is false.
- Do not remove `panelClass`, `panelWidth`, or their existing behavior for other consumers.
- Do not support variable-height options in the fixed-size `cdk-virtual-scroll-viewport` setup. With virtual scroll, omit the multiline panel modifier and automatic width fallback.

## Constraints

- Declare the input as `input<boolean, boolean | string | null | undefined>(…, { transform: booleanAttribute })` and document the false default.
- Keep the panel modifier class distinct from the trigger's `kbq-select_multiline`: use `kbq-select__panel_multiline`.
- Preserve custom `panelClass` values when adding the modifier.
- Keep `overflow: hidden` on option text; set only `white-space: normal` and `overflow-wrap: break-word` for wrapping.
- Explicit `panelWidth` takes precedence over the multiline `auto` fallback.
- Use one effective-width calculation for initial attachment and open-panel input changes. Effects must not write plain fields read by templates; refresh the existing overlay-width state after render and only while the panel is open.
- Document the automatic trigger-width fallback, explicit-width precedence and unsupported virtual-scroll combination in both public JSDoc declarations and RU/EN. Mention the `panelMinWidth` floor (200 px by default) in the localized prose.
- Update both documentation locales, public API golden files and any API documentation ratchets required by CI.

## Approaches

- **Selected: Select-level input with a built-in width fallback.** `multilineOptions` adds the panel modifier and supplies `panelWidth="auto"` only when `panelWidth` is nullish. This gives consumers one simple switch, preserves explicit sizing and matches the Filter Bar vocabulary. Include provider support for module-wide defaults. Open-panel changes reuse the same effective-width calculation, and virtual scroll explicitly retains single-line options and existing width behavior.
- Per-option wrapping input. Rejected: it expands the shared option API, is more granular than requested and cannot solve panel sizing by itself.
- Input that only adds a CSS modifier. Rejected: consumers would still need `panelWidth="auto"`, so the original combination would remain necessary.
- Variable-height virtual scrolling. Rejected: the documented virtual-scroll contract uses fixed `itemSize="32"`; multiline options would make overlap and incorrect positioning possible.

## Implementation

Add `multilineOptions` to `KbqSelectOptions` and `KbqSelect`. In `getPanelClasses()`, append `kbq-select__panel_multiline` when enabled and virtual scroll is absent, while retaining theme and custom classes. In `select.scss`, nest the two wrapping declarations under that modifier.

Resolve the effective width as the explicit `panelWidth()` when non-nullish, otherwise `auto` when `multilineOptions()` is enabled without virtual scroll, otherwise the existing null behavior. Use the same method in `attachPanel()` and when relevant inputs change while open. The input-tracking effect only schedules an after-render update; it does not write the overlay's template-bound plain fields itself. The after-render callback rechecks that the panel is still open before updating and marking for check.

Update `select-two-line-option` to use only `multilineOptions` for wrapping; remove its example-only `panelClass`, `panelWidth` and `::ng-deep` rule. Update RU/EN prose with the width floor and virtual-scroll limitation.

## Verification

- Unit tests: default no modifier; enabled modifier with custom classes preserved; automatic trigger-width sizing; explicit `panelWidth` precedence; provider-enabled behavior; both open-panel toggle directions; explicit width preserved across toggles; virtual-scroll guard with virtualization confirmed active.
- Playwright: a focused non-screenshot scenario asserts `white-space: normal`, panel width matching the trigger and a long option taller than a short one. A second test toggles the input in both directions while open and verifies real browser width updates. No new visual baseline is needed.
- Builds/checks: components and docs-examples, focused Select unit tests, Select Playwright spec in Docker, spec/E2E type checks, docs-content, Prettier/ESLint/stylelint on changed files.
- Public API: rebuild components, run `approve-api "components/select"`, then `check-api`; run `check-public-api-any`, `check-typings`, docs API generation and `check-api-docs`, addressing only changes caused by this input.
- Browser: verify the docs example uses only `multilineOptions` and preserves trigger truncation in RU and EN.
