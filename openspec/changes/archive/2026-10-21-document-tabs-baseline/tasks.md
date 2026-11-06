# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/tabs/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/tabs`, and verify the four tabs unit suites (group, header, nav bar, body) pass on the baseline commit
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/tabs` and verify the tabs e2e suite passes. It backs the vertical binding, the scrollbar reveal of a vertical strip and the unclickable disabled link
- [ ] 1.3 For each requirement in `specs/tabs/spec.md`, name at least one unit or e2e test that asserts it. Verify that every requirement without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour by hand

`dev:tabs` exists in `package.json`. Run each check in `yarn run dev:tabs` (http://localhost:3003), using the groups, nav bars and docs examples embedded there. Where the dev app has no markup for a check, add it temporarily to `packages/components-dev/tabs/template.html` or drive the group from the browser console with `ng.getComponent()` and `ng.applyChanges()`, and revert any edit before 3.2.

- [ ] 2.1 Verify the selection from code:
    - `selectedIndex="2"` as a string attribute selects the third tab;
    - `activeTab` set to an id no tab has selects the first tab;
    - `activeTab` set to a function selects the tab it returns, and to a function returning `null` selects the first tab;
    - `selectedIndex` set to the index of the disabled tab in "Tabs underlined" selects it;
    - clicking the disabled label leaves the selection unchanged;
    - in the "selectedTabIndex" group (`[(activeTab)]` bound to a number), a click turns the bound value into the clicked index;
    - with `(selectedTabChange)` and `(activeTabChange)` handlers that log, a click logs `selectedTabChange` first
- [ ] 2.2 Verify the content:
    - a tab with both `label` and `kbqTabLabel` renders the template;
    - a `kbqTabContent` template is created when its tab is selected and destroyed when another tab is selected (a component in it logs `ngOnDestroy`)
- [ ] 2.3 Verify the keyboard in the "Tabs vertical" group and in "Tabs with scrolled content":
    - Down and Up move focus in the vertical group, Left and Right do nothing there, and Up and Down do nothing in a horizontal one;
    - focus stops at the first and last label without wrapping;
    - Ctrl+Right, Alt+Right and Shift+Right do not move focus;
    - the label with `tabindex="0"` follows keyboard focus, and moves to the first enabled label once the selected tab is disabled from the console
- [ ] 2.4 Verify pagination in "Tabs with scrolled content":
    - one click on the next arrow scrolls by 80% of the strip's visible width;
    - holding the primary button on it starts repeating after about 650 ms and stops at the end; a right-button press does not repeat;
    - widening the window until the labels fit removes the arrows and scrolls the strip back to its start;
    - changing a label's text from the console re-checks pagination;
    - a press on a nested button (the remove button in `tabs-add-tab`) or with the right button does not start a drag, and a new press stops a running coast
- [ ] 2.5 Verify the generated ids and classes in the DOM:
    - label ids read `kbq-tab-label-<group>-<n>` and region ids `kbq-tab-content-<group>-<n>`;
    - "Tabs onSurface + transparent" carries `kbq-tab-group_on-surface` and `kbq-tab-group_transparent`, "Tabs underlined" labels `kbq-tab-label_underlined`, "Tabs kbq-stretch-tabs" `kbq-tab-group_stretch-labels`, the empty tab `kbq-tab-label_empty`, an `iconOnly` label `kbq-tab-label_icon-only`;
    - a group with `[dynamicHeight]="true"` carries `kbq-tab-group_dynamic-height`
- [ ] 2.6 Verify the motion:
    - `animationDuration="300"` slides the new content in from the side of the previous tab over 300 ms, and from the other side when moving the other way;
    - with `prefers-reduced-motion: reduce` emulated in the browser, the content does not move
- [ ] 2.7 Verify the effect on other components inside a tab:
    - the panel of a `kbq-select`, a `kbq-tree-select` and a `kbqDropdownTriggerFor` dropdown closes when the page scrolls;
    - a growing `kbqTextarea` in an inactive tab has the right height once its tab is selected with a non-zero `animationDuration`
- [ ] 2.8 Verify the nav bars:
    - the arrow keys, Home and End move focus between links, and after tabbing onto a link Right moves on from that link;
    - Space and Enter on an enabled link of a nav bar with a panel switch the active link, and Space does not scroll the page;
    - Enter and Space on a disabled link have their default action prevented (`defaultPrevented` of a dispatched `keydown`);
    - without a panel (`tabs-actionbar`, or `/E2eTabNavBar` in `yarn run dev:e2e`), a `role` attribute written on a link stays, and two links with `active` set mark only the first;
    - a `kbqTabNavPanel` with `id="custom-panel"` has that id and the links' `aria-controls` point at it;
    - the nav bar host carries `kbq-tab-nav-bar_transparent` and `kbq-tab-nav-bar_on-surface` as bound, and writes nothing to `localStorage`
- [ ] 2.9 Verify state saving in the docs example `tabs-state-saving` (`yarn run docs`, or embedded temporarily in the dev app):
    - assigning `selectedIndex` from the console writes nothing, and calling `saveState()` afterwards writes the new selection;
    - changing `stateSavingKey` at runtime to a key that holds a stored state selects that state's tab;
    - with `KBQ_STATE_SAVING_ENABLED` provided as `false`, nothing is read or written

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-tabs-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed

## Workflow follow-up

- Archive with `/opsx:archive document-tabs-baseline` once the checks pass. This creates `openspec/specs/tabs/spec.md`.
- Decide which Findings in `design.md` become changes of their own. Enter doing nothing on the links of a nav bar without a panel, and the arrow keys ignoring right-to-left layouts, are the most user-visible ones.
