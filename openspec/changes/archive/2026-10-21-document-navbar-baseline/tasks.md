# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/navbar/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/navbar`, and verify the navbar unit suite passes on the baseline commit
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/navbar` and verify the navbar e2e suite passes. It backs the requirements that need a real layout: content never overflowing, the long brand title, the suffix position, the toggle, the dropdown `aria-expanded`, the roving focus after Tab, the tooltip on keyboard focus, the tooltip of a cut title and the disabled brand
- [ ] 1.3 For each requirement in `specs/navbar/spec.md`, name at least one unit or e2e test that asserts it. Verify that every requirement, or part of one, without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour in the dev app

`dev:navbar` is defined in `package.json`. Run each check in `yarn run dev:navbar` (http://localhost:3003). Checks 2.1 to 2.5 use the docs examples and the `E2eNavbarCollapse` fixture that the dev app already renders. Checks 2.6 to 2.8 need markup the dev app does not render: add it to `packages/components-dev/navbar/template.html` for the check only.

- [ ] 2.1 Verify in the horizontal overview example:
    - the tasks item shows a down-pointing chevron, and the icon-only profile dropdown item shows none;
    - Up, Down, Home, End, PageUp and PageDown on a focused item neither move focus nor scroll the page;
    - Right stops at the last element and Left at the first, without wrapping;
    - Down on the tasks item opens its dropdown;
    - a letter that starts the title of a later item moves focus to that item about 200 ms after it is typed;
    - Tab from an item moves focus past the navbar, and Shift+Tab from an item moves it to the element before the navbar
- [ ] 2.2 Verify the responsive collapse in the `E2eNavbarCollapse` fixture:
    - narrowing the browser window collapses items starting from the last one;
    - widening it expands them again;
    - changing only the width of the fixture's frame in devtools, without resizing the window, leaves the items as they are
- [ ] 2.3 Verify in the vertical example:
    - the toggle is hidden until the navbar is hovered or holds keyboard focus;
    - the toggle's tooltip appears to its right and closes when the toggle is clicked;
    - after `ng.getComponent(host).expanded.subscribe(console.log)` in the console, with `host` the navbar element, clicking the toggle logs the new value;
    - Right on the "more" dropdown item opens its dropdown, and Down moves focus to the next item without opening it;
    - Left and Right on an item without a dropdown do not move focus;
    - clicking the brand and pressing Down moves focus to the item after it;
    - the tooltips of the collapsed items appear to their right, without an arrow, on hover only;
    - in the expanded navbar the bento title appears only while the bento item is hovered or has keyboard focus
- [ ] 2.4 Verify that the divider of the dev app's own vertical navbar has `aria-orientation="horizontal"`, and that in the open-over example the expanded navbar lies over the page text instead of pushing it aside
- [ ] 2.5 Verify the shortcut and the stacking:
    - with a window `keydown` listener added in the console that logs `event.defaultPrevented`, `Ctrl` + `/` toggles a vertical navbar and logs `false`;
    - the computed `z-index` is 990 on the horizontal navbar, 989 on the container of the open-over navbar and 991 on its toggle
- [ ] 2.6 Add a temporary horizontal navbar and verify:
    - an item written outside a container is not rendered;
    - `kbq-navbar-logo` and `kbq-navbar-divider` carry their classes;
    - a disabled item with a click handler does not react to a click;
    - a `kbq-button` projected into an item has `tabindex="-1"`;
    - a `kbqInput` field in a `kbq-form-field` item receives focus from the arrow keys, and Right at the end of its text and Left at its start move focus to the next and the previous element;
    - a `<div kbq-navbar-brand>` with `[kbqTooltipDisabled]="false"` shows its tooltip although its title fits
- [ ] 2.7 Add a temporary vertical navbar and verify:
    - a toggle holding `<i kbq-icon="kbq-chevron-right_16"></i>` renders that icon instead of the chevrons;
    - a `kbq-navbar-toggle` element that is clicked becomes the element the arrow keys move from;
    - `[localeOverrides]` with its own `navbar.toggle.expand` changes the toggle of that navbar only
- [ ] 2.8 Place a `kbq-navbar-toggle` in a temporary horizontal navbar and verify that the console shows a missing-provider error for `KbqVerticalNavbar`. Then revert `packages/components-dev/navbar/template.html` and verify that `git diff --stat packages/components-dev` prints nothing

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-navbar-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed

## Workflow follow-up

- Archive with `/opsx:archive document-navbar-baseline` once the checks pass. This creates `openspec/specs/navbar/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The vertical navbar moving focus out of a text field on typeahead, and the navigation keys blocked in plain fields, are the most user-visible ones.
