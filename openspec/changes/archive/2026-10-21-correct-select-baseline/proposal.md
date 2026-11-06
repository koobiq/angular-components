# Proposal

## Why

The baseline spec of `select` states behaviour the code does not have. A static audit of `openspec/specs/select/spec.md` against `packages/components/select` and the shared `core` code on `c9c196a9b` found fourteen requirements whose wording contradicts the source, the unit tests or the Playwright tests; this change corrects them so the spec describes what ships.

## What Changes

- **Typeahead**: a projected search field turns typeahead off even while the field is hidden or the panel is closed, so characters reach the field only while it is shown in the open panel; typing on a closed select with a search field does nothing.
- **Values without a rendered option**: a selected option that stops being rendered, for example because a search filters it out, stays selected and keeps its tag or label; only a written value that matches no rendered and no previously selected option is left out.
- **Touched and dirty state**: calling `select()` or `deselect()` on an option in code passes the new value to the form control and marks it dirty, so not only changes made by the user do.
- **Tags for multiple values**: a tag is labelled with the option's `viewValue`, which is its `viewValue` input when one is bound, not always its text.
- **Multiline trigger**: the panel is anchored to the first row only when it fits neither below nor above, the trigger is taller than the panel and the panel fits at full height below the first row; otherwise it opens where more of it is visible.
- **Custom tag template**: the template is rendered once per tag the trigger shows, so `triggerValuesLimit` limits it too.
- **Select-all action**: with no enabled option to act on, activating the row emits neither `selectionChange` nor `onSelectAll`.
- **Search field**: a keystroke in the field makes the first enabled selected option active when it is listed, otherwise the first listed option, whether or not the previous active option is gone; a query changed in code keeps the active option while it is listed.
- **Footer**: a click in the footer returns focus to the select only when focus is still in the panel or nowhere; focus a click handler moved outside the panel stays there.
- **Virtual scrolling**: `*cdkVirtualFor` switches the mode on; a value whose option was rendered while selected keeps that option's label rather than the one from `virtualOptionFactory`; a selected value that the data source no longer holds stays selected without a factory; the viewport is not pinned while the empty search result is shown.
- **Panel position**: with room on neither side the panel opens over the rows of a multiline trigger when it can, otherwise where more of it is visible; a panel that overflows the viewport horizontally is shifted and narrowed; the side is kept while the page scrolls but is resolved again after a viewport resize, a change of the multiline first-row anchor, or the width a search field pins after opening.
- **Panel width**: a panel that overflows the viewport horizontally is narrowed to fit, below the trigger width, `panelMinWidth` or an explicit `panelWidth`.
- **Panel height**: under virtual scrolling the viewport is not pinned to `panelMaxHeight` while the empty search result is shown.
- **Tooltip for truncated options**: the tooltip shows the option's `viewValue`, not its full text.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `select`: corrects the requirements "Typeahead", "Values without a rendered option", "Touched and dirty state", "Tags for multiple values", "Multiline trigger", "Custom tag template", "Select-all action", "Search field", "Footer", "Virtual scrolling", "Panel position", "Panel width", "Panel height" and "Tooltip for truncated options".

## Impact

Only OpenSpec files: the delta under `openspec/changes/correct-select-baseline/` and, once archived, `openspec/specs/select/spec.md`. No source, test, documentation or public API changes.
