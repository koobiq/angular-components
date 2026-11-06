# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/select/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/select`, and verify the select unit suite passes on the baseline commit
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/select` and verify the select e2e suite passes. It backs the position, multiline, footer, panel height and select-all keyboard requirements
- [ ] 1.3 For each requirement in `specs/select/spec.md`, name at least one unit or e2e test that asserts it. Verify that every requirement without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour in the dev app

Run each check in `yarn run dev:select` (http://localhost:3003), using the docs examples embedded there.

- [ ] 2.1 Verify in the DOM:
    - an invalid touched select has `aria-invalid="true"`;
    - `required` sets `aria-required="true"`;
    - a form-field hint or error id appears in the select's `aria-describedby`
- [ ] 2.2 Verify the panel width rules:
    - `panelMaxWidth` stops a content-sized panel from growing past its value;
    - without it, the panel stops at 640 px
- [ ] 2.3 Verify the search threshold:
    - `searchMinOptionsThreshold="auto"` hides the search below 10 options;
    - the same value given through `kbqSelectOptionsProvider` does the same
- [ ] 2.4 Verify these panel details:
    - a search query is gone after the panel is closed and reopened;
    - with `hasBackdrop` set, a click on the backdrop closes the panel;
    - a long single value stays on one line with an ellipsis
- [ ] 2.5 Verify that the select-all row is not rendered in the virtual-scroll example when `selectAll` is added to it

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-select-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed

## Workflow follow-up

- Archive with `/opsx:archive document-select-baseline` once the checks pass. This creates `openspec/specs/select/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The tag remove control hidden by `aria-hidden` is the most user-visible one.
