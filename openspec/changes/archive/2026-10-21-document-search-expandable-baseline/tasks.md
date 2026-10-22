# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/search-expandable/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/search-expandable`, and verify the search-expandable unit suite passes on the baseline commit
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/search-expandable` and verify the e2e suite passes. It backs the screenshots of both states and the requirements on the input taking focus on expand and the collapsed button taking it back after Escape
- [ ] 1.3 For each requirement in `specs/search-expandable/spec.md`, name at least one unit or e2e test that asserts it. Verify that every requirement or scenario without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour in the dev app

`dev:search-expandable` exists in `package.json`. Run each check in `yarn run dev:search-expandable` (http://localhost:3003), on the dev instance bound to `search` (its value is printed below it) and on the two embedded docs examples. Where a check drives the component from the browser console, take it with `const el = document.querySelector('kbq-search-expandable'); const cmp = ng.getComponent(el);` and render with `ng.applyChanges(el)`.

- [ ] 2.1 Verify in the DOM:
    - the collapsed button has `type="button"`, and the expanded input has `type="text"` and `autocomplete="off"`;
    - after `cmp.tabIndex = 3`, the collapsed button and the expanded input render `tabindex="3"`, and the close button keeps `tabindex="0"`;
    - after `cmp.disabled = true`, `cmp.tabIndex` reads `-1` and the collapsed button is disabled
- [ ] 2.2 Verify the value timing:
    - typing several characters quickly updates the printed value once, about 200 ms after the last one;
    - typing and pressing Escape within 200 ms leaves the printed value empty;
    - expanding and collapsing without typing marks the bound `NgModel` dirty (read it from `ng.getDirectives(el)`)
- [ ] 2.3 Verify the focus hand-offs:
    - the "in header" example, which starts expanded from its seeded value, does not take focus on page load;
    - collapsing with the close button leaves focus on the collapsed button, with no tooltip shown;
    - with the dev instance expanded, `cmp.toggle(); ng.applyChanges(el)` from the console moves `document.activeElement` to its collapsed button
- [ ] 2.4 Verify the state paths from the console:
    - with `cmp.isOpenedChange.subscribe(console.log)` attached, `cmp.isOpened = true` and later `cmp.isOpened = false` change the state without logging;
    - text typed before `cmp.isOpened = false` is still printed below the component and shows again when it expands;
    - `cmp.value.set('written')` on a collapsed component keeps it collapsed and prints `written` after about 200 ms
- [ ] 2.5 Verify the keyboard edges:
    - Escape pressed while the close button has focus does not collapse the field;
    - after `cmp.disabled = true` on an expanded field, it stays expanded with a disabled input and a disabled close button
- [ ] 2.6 Verify the accessible names:
    - with the locale service of the dev app, the collapsed button, the input and the close button are named `Поиск`, `Поиск` and `Закрыть`;
    - after `cmp.tooltipText = ''`, the collapsed button renders an empty `aria-label`;
    - while the tooltip of the collapsed button is open, the button's `aria-describedby` points at it
- [ ] 2.7 Verify by reading the source, since the dev app cannot exercise them without a code change:
    - the error message in the constructor of `search-expandable.ts` matches the spec word for word;
    - the error state with a consumer `ErrorStateMatcher` or after a form submit, against `packages/components/core/error/error-state-matcher.ts`;
    - the provider, the token under a locale service, and `[localeOverrides]`, against `packages/components/core/locales/configuration.ts` and `locale-overrides.directive.ts`

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-search-expandable-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed

## Workflow follow-up

- Archive with `/opsx:archive document-search-expandable-baseline` once the checks pass. This creates `openspec/specs/search-expandable/spec.md`.
- Decide which Findings in `design.md` become changes of their own. A collapse through `[isOpened]` that keeps the query, and the focus pulled to the collapsed button by a collapse started elsewhere, are the most user-visible ones.
