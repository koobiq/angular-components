# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/link/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/link`, and verify the link unit suite passes on the baseline commit (the pattern also runs the `link/deprecated` suite, which has to pass too)
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/link` and verify the link e2e suite passes. It backs the requirements on the underline, visited links, sizes, the printed page, wrapping, right-to-left layout and the pointer on a wrapped link
- [ ] 1.3 For each requirement in `specs/link/spec.md`, name at least one unit or e2e test that asserts it. Verify that every requirement without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour by hand

Run each check in `yarn run dev:link` (http://localhost:3003; the script exists in `package.json`), using the links of its template and the docs examples embedded there. Where no rendered link covers a case, the task names the source to read instead.

- [ ] 2.1 Verify in the DOM:
    - an enabled `<a>` link and an enabled pseudo `<span>` have `tabindex="0"`;
    - a disabled pseudo `<span>` keeps `role="button"` and has `aria-disabled="true"` and `tabindex="-1"`;
    - the external icon has `aria-hidden="true"`
- [ ] 2.2 Verify the methods in the DevTools console with a link element selected: after `ng.getComponent($0).focus()`, `document.activeElement === $0`, and `ng.getComponent($0).getHostElement() === $0`. Verify that `tools/public_api_guard/components/link.api.md` declares the `kbqLink` export name and that `KbqLinkModule` exports `KbqLink`, `KbqLinkPrefix` and `KbqLinkSuffix`
- [ ] 2.3 Verify the keys of a disabled link: add a keydown listener to a disabled pseudo `<span>` from the console, dispatch bubbling, cancelable keydown events for ArrowDown, ArrowLeft, ArrowRight, ArrowUp and Tab, and verify that only ArrowUp and Tab reach the listener and that the other three have their default action prevented
- [ ] 2.4 Verify the declared role in `yarn run dev:dropdown`: its `<span kbqLink role="button" tabindex="0">` keeps `role="button"`, and Enter opens the dropdown once, through the trigger rather than through a click from the link
- [ ] 2.5 No rendered example covers the rest, so verify each in `packages/components/link/link.ts`:
    - a `<button>` host is a pseudo link without a role or activation from the component, and a `<label>` that declares a role keeps the tab stop;
    - Enter and Space pressed on an element inside the link do not activate it;
    - non-breaking spaces at the edges of the text are not trimmed;
    - a given `print` text on a link without a `href` is written to `data-print` as is

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-link-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed

## Workflow follow-up

- Archive with `/opsx:archive document-link-baseline` once the checks pass. This creates `openspec/specs/link/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The `NaN` tab index from `[tabIndex]="null"` and the external icon hidden from assistive technology are the most user-visible ones.
