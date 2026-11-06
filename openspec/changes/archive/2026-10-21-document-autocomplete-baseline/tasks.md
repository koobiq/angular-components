# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/autocomplete/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/autocomplete`, and verify the autocomplete unit suite passes on the baseline commit
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/autocomplete` and verify both Playwright files pass: `e2e.playwright-spec.ts` in Chrome and `e2e.webkit.playwright-spec.ts`, which switches itself to WebKit. They back the position, gap, caret, panel growth, scroll strategy, scrollbar, trigger-character and active-option-in-view requirements
- [ ] 1.3 For each requirement in `specs/autocomplete/spec.md`, name at least one unit or e2e test that asserts it, not counting the jsdom geometry tests that `design.md` lists as unable to fail. Verify that every requirement, or part of one, without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour by hand

`yarn run dev:autocomplete` exists in `package.json` and serves http://localhost:3003 with the five docs examples and a field of its own. Run checks 2.1–2.5 there. Where a check calls the trigger, reach it in the browser console with `ng.getDirectives(input)`.

- [ ] 2.1 Verify the opening rules on the overview example:
    - after Escape, Down in the focused field opens the panel;
    - `open()` called on the trigger of a field made read-only with `input.readOnly = true` opens the panel
- [ ] 2.2 Verify closing and choosing on the overview example:
    - a click and a middle click outside the panel close it, leave focus where the click put it and keep the typed text;
    - with touch emulation in DevTools, a tap outside closes the panel;
    - Escape and then reopening the panel shows the first option active;
    - after a click on an option, the field has focus;
    - after choosing "Austria", clearing the field with `kbq-cleaner` and reopening the panel, "Austria" has no `kbq-selected`
- [ ] 2.3 Verify the keyboard and pointer on the overview example:
    - Home, End, Left and letters move the caret or type, and do not change the active option;
    - `document.activeElement` is the field after each Down;
    - typing a letter and pressing Enter at once never chooses an option the letter filtered out;
    - hovering an enabled option gives it `kbq-active`
- [ ] 2.4 Verify text mode on the textarea and trigger examples:
    - selecting text closes the panel, and so does moving the caret out of the word with Left;
    - a click at the end of a word opens the panel, and so does tabbing into the field when its text ends with a word;
    - scrolling the textarea moves the caret-anchored panel with the caret;
    - an `input` listener added in the console fires once after an option is inserted;
    - after an insertion and a new query, no `kbq-option` has `kbq-selected`;
    - the hint layer has `aria-hidden="true"`, and with `dir="rtl"` set on the textarea in DevTools no hint is drawn
- [ ] 2.5 Verify layout, the footer and the defaults:
    - `.kbq-autocomplete-panel` has a computed `max-width` of 640 px;
    - with the window made short enough that the panel opens above the field, the overlay pane has `kbq-connected-overlay_above`, and otherwise `kbq-connected-overlay_below`;
    - scrolling the page with the panel open keeps the panel at the field, and scrolling the option list does not move the panel;
    - in the footer example, the footer is outside the `role="listbox"` element and outside `.kbq-autocomplete-panel__content`, and a click on the footer's padding keeps the panel open;
    - the dev app's own field has `autocomplete="off"`;
    - `openedChange.subscribe(console.log)` on the trigger logs `true` and then `false` when the panel opens and closes
- [ ] 2.6 In a local, uncommitted edit of `packages/components-dev/autocomplete/template.html`, give the dev app's own `kbq-autocomplete` `[panelMaxWidth]="800"`, `[openOnFocus]="false"`, an option longer than 640 px, a disabled option and a disabled `kbq-optgroup`, and connect the field through `kbqAutocompleteConnectedTo` to a wider `kbqAutocompleteOrigin` element. Then verify:
    - the panel grows past 640 px and stops at 800 px;
    - Tab into the field does not open the panel, but a click on the focused field does;
    - the disabled options ignore hover, and a click on them keeps the panel open;
    - the panel opens under the origin and is at least as wide as it

    Revert the edit and verify `git diff --stat -- packages` prints nothing

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-autocomplete-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that every entry outside `openspec/` was already there before this change started

## Workflow follow-up

- Archive with `/opsx:archive document-autocomplete-baseline` once the checks pass. This creates `openspec/specs/autocomplete/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The first option being selected after an Enter choice, and focus moving onto the options on every arrow key, are the most user-visible ones.
