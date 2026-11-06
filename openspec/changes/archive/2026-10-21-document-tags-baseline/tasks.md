# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/tags/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/tags`, and verify the three tags unit suites pass on the baseline commit
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/tags` and verify the tags e2e suite passes. It backs the separator requirements for typing and pasting
- [ ] 1.3 Run `npx vitest run packages/components/select -t "removing a selected value from the trigger"` and verify it passes. It backs the role and the keyboard activation of the remove control
- [ ] 1.4 For each requirement in `specs/tags/spec.md`, name at least one unit or e2e test that asserts it. Verify that every requirement without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour in the dev app

The script is `yarn run dev:tag` (singular; `dev:tags` does not exist). Run each check there (http://localhost:3003), using the docs examples embedded in it, with the browser devtools open.

- [ ] 2.1 Verify the classes in the DOM:
    - a `kbq-tag` has `kbq-standard-tag`, and `kbq-tag_removable` while removable;
    - an editable tag has `kbq-tag_editable`;
    - a tag with a remove control has `kbq-tag-with-trailing-icon`, and the control has `kbq-tag-remove`;
    - a default tag list has `kbq-tag-list_selectable` and `kbq-tag-list_removable`, and an editable one `kbq-tag-list_editable`;
    - the tag input has `kbq-tag-input`, and the list's `id` starts with `kbq-tag-list-`;
    - in the tag input validators example, the list gets `kbq-invalid` once it is invalid and touched
- [ ] 2.2 Verify the remove control: it has `role="button"`, `aria-label="Удалить"` and `tabindex="-1"`. The dev app cannot switch the locale, so verify the English name "Remove" on the docs site (`yarn run docs`) after switching the site language
- [ ] 2.3 Verify keyboard details:
    - Space, Delete and Backspace on a focused tag do not scroll the page or navigate back;
    - Up and Down move focus between tags of a tag list, and no arrow wraps from the last tag to the first;
    - after removing every tag of the tag list overview example, the list has `tabindex="-1"`;
    - Ctrl + A in the empty input of the tag input overview example selects every tag and focuses the last one
- [ ] 2.4 Verify editing in the tag editable example, reading its console:
    - Enter and F2 log the start reasons `Enter` and `F2`, and a double click logs the name of the native double-click event;
    - the text of the edit input is selected when editing starts;
    - a `keydown` listener added on `document` from the console does not receive Escape pressed in the edit input;
    - the missing edit input error cannot be produced from the examples; verify it by reading `startEditing()` in `tag.component.ts`
- [ ] 2.5 Verify selection and events by subscribing from the console to the outputs of `ng.getComponent(element)` for a `kbq-tag` or `kbq-tag-list` element:
    - a selectable standalone tag focused with Tab emits `selectionChange` with `isUserInput: false`, and is deselected on blur;
    - deselection when focus leaves a tag list emits no `selectionChange`;
    - dropping a tag in the tag list draggable example emits `dropped` with `tag`, `previousIndex`, `currentIndex` and `event`;
    - submitting an edit in the tag input editable example emits `valueChange` with the array of tag values
- [ ] 2.6 Verify the tag input in the tag input examples:
    - blur on an empty input calls the `kbqTagInputTokenEnd` handler with an empty value (set a breakpoint in the handler);
    - " tag " typed into the `kbqInput` of the overview example becomes the tag "tag";
    - with Tab among the separators of the overview example, Tab on typed text adds a tag and keeps focus in the input;
    - the typed text stays in the input when the handler does not clear it (step over the clearing line at a breakpoint);
    - pasting into the paste-off example inserts the text into the input;
    - after `ng.getComponent(list).disabled.set(true)` and `ng.applyChanges(list)` from the console, the tag input has the `disabled` attribute
- [ ] 2.7 Verify the cleaner in the tag input cleaner example:
    - Escape in the input does not clear the list;
    - no example keeps an enabled tag through `clearPredicate`, so verify the focus after such a clear by reading `focusFirstTag()` in `tag-list.component.ts`;
    - no example binds `[localeOverrides]` on a tag, so verify the override of the remove control name by reading `KbqTagRemove` and the locale override directive in `core`

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-tags-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed

## Workflow follow-up

- Archive with `/opsx:archive document-tags-baseline` once the checks pass. This creates `openspec/specs/tags/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The missing ARIA of the tag list and its tags, the backward keyboard trap in an empty tag input and the form control that never becomes dirty in the documented pattern are the most user-visible ones.
