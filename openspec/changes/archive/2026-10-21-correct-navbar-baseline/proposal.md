# Proposal

## Why

The baseline spec of `navbar` states behaviour the code does not have. A static audit of `openspec/specs/navbar/spec.md` against `packages/components/navbar` on `main` found requirements whose statements the source or the stylesheets contradict, so a consumer relying on them would expect the wrong thing.

## What Changes

- **Horizontal navbar collapses items to fit**: a collapsed item hides only its title, suffix and chevron; its leading icon and other projected content, such as a badge, stay visible, not "only its icon".
- **Collapsed vertical navbar shows icons only**: the same for the items of a collapsed vertical navbar, and the brand hides its title rather than showing "only its logo".
- **When the brand title is measured**: the title is measured on expand, not on collapse; a title hidden in a collapsed vertical navbar is not measured and the brand keeps its last presentation.
- **Automatic tooltip of items and brands**: an element without a title keeps the `tooltipText` content except while it is collapsed with `collapsedText` set, which then replaces it.
- **One tab stop per navbar**: the host is not the only tab stop. A `<button kbq-navbar-toggle>` and the control of a projected `kbq-form-field` keep their own, and only the first projected `kbq-button` is taken out of the tab order.
- **Entering the navbar**: focus goes to the first enabled element, which can be a link brand, not necessarily an item.
- **Leaving the navbar with Tab**: Tab moves to the next tab stop in document order, which is the toggle button of a vertical navbar or a form field control when the navbar holds one, not always out of the navbar.
- **Arrow keys in a horizontal navbar**: Down on a dropdown trigger item opens its dropdown, which takes focus, so Up and Down only do not move focus between the navbar's elements.
- **Arrow keys in a vertical navbar**: the same for Right on a dropdown trigger item.
- **Clicked item becomes the active item**: a click on a nested `kbq-button` or form field control focuses that control and leaves the active element unchanged, and a decorative brand never becomes active.
- **Text fields in a horizontal navbar**: Left and Right at the edges of the text move relative to the navbar's active element, which is the item holding the field only when focus reached it through the navbar.
- **Accessible name of items**: a collapsed icon-only item also gets its name from `collapsedText`.
- **Stacking of the navbar**: the toggle's 991 applies within the navbar's own 989 layer while the navbar is opened over the content.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `navbar`: corrects the requirements listed above so that they state what the code does.

## Impact

Only OpenSpec files: `openspec/changes/correct-navbar-baseline/` now, and `openspec/specs/navbar/spec.md` once the change is archived. No source, test, documentation or API change.
