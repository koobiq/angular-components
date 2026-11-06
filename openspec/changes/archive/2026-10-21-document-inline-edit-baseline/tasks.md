# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/inline-edit/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/inline-edit`, and verify the inline-edit unit suite passes on the baseline commit
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/inline-edit` and verify the inline-edit e2e suite passes. It backs the Tab chaining, select Tab-out, focus ring, label and save-state requirements
- [ ] 1.3 For each requirement in `specs/inline-edit/spec.md`, name at least one unit or e2e test that asserts it. Verify that every requirement, or part of one, without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour in the dev app

Run each check in `yarn run dev:inline-edit` (http://localhost:3003; the script is defined in `package.json`), using the docs examples and the `E2eInlineEditStates` scenario embedded there. Where a check needs an input that no example binds, bind it in the browser console through `ng.getComponent()` where that reaches it, or temporarily in `packages/components-dev/inline-edit/template.html`, reverted before 3.2.

- [ ] 2.1 Verify opening and the view:
    - a click on the label of a labelled field opens its editor;
    - the opening click does not reach a click listener added to the host's parent in the console;
    - with `interactiveSelectors` bound to `[]`, a click on a link in the view opens the editor;
    - the text of the input is selected when the editor opens;
    - an empty view renders only the projected `kbqInlineEditPlaceholder` element, which carries `kbq-inline-edit__placeholder`
- [ ] 2.2 Verify the panel width:
    - without a label the panel is as wide as the host;
    - with a label it is as wide as the area inside the host's padding;
    - with `editModeWidth` bound it has that width
- [ ] 2.3 Verify the action buttons and saving by click:
    - the save and cancel buttons are named by `a11y.save` and `a11y.cancel`;
    - a click on the field's own host while editing saves and leaves it in view mode;
    - after a click outside on another focusable element, focus stays on that element
- [ ] 2.4 Verify the validation tooltip in the validation example:
    - it opens at the bound `tooltipPlacement`;
    - with `showTooltipOnError` set to `false` it does not open;
    - with a template as `validationTooltip` the template is rendered
- [ ] 2.5 Verify cancelling:
    - Escape on an invalid value closes the editor and restores the value;
    - with the date-time example's calendar open, Escape closes only the calendar and the editor stays open;
    - `setValueHandler` restores the file in the custom handler example
- [ ] 2.6 Verify the background save in the save-progress and save-error examples:
    - saving an unchanged value sends no request and emits no `saved` (subscribe through `ng.getComponent()`);
    - with a `compareWith` that throws, saving an unchanged value sends a request;
    - a `saveHandler` returning `of(1, 2)` emits `saved` once;
    - after a failed save, reopening and cancelling keeps `kbq-inline-edit_save-error`;
    - with `saveErrorHandler` bound to `null`, a failure opens no toast
- [ ] 2.7 Verify the action menu in the menu and disabled examples:
    - the menu button has `role="button"` and Enter or Space on it does not open the editor;
    - the host carries `kbq-inline-edit_with-menu`;
    - the menu is gone in edit mode and stays usable on the disabled field
- [ ] 2.8 Verify the disabled example:
    - the host carries `kbq-inline-edit_disabled`;
    - click, Enter and Space do not open it
- [ ] 2.9 Verify switching modes in code: type into an open editor, call `ng.getComponent(host).toggleMode()`, and check that the field is in view mode, the control keeps the typed value, and neither `saved` nor `canceled` fired
- [ ] 2.10 Verify the view's ARIA:
    - it has `tabindex="-1"` while the editor is open;
    - with `aria-label=""` its name falls back to `a11y.edit`;
    - with `localeOverrides` setting `a11y.edit`, only that field takes the new name
- [ ] 2.11 Verify the Tab-out edge cases:
    - in the select-basic example, a Tab `keydown` dispatched from the console with `ctrlKey`, `metaKey` or `altKey` while the options panel is open neither saves nor moves focus, since the browser and the OS keep those shortcuts;
    - with a toast from the save-error example still open, Tab out of the last inline edit on the page returns focus to that field instead of moving it into the toast

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-inline-edit-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed

## Workflow follow-up

- Archive with `/opsx:archive document-inline-edit-baseline` once the checks pass. This creates `openspec/specs/inline-edit/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The view's accessible name hiding the current value is the most user-visible one; `disabled` and `mode` writes bypassing the documented locks are next.
