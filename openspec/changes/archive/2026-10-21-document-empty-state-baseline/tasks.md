# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/empty-state/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/empty-state`, and verify the empty-state unit suite passes on the baseline commit
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/empty-state` and verify the empty-state e2e suite passes. Its screenshot backs the size spacing and typography, the horizontal centring, the title and text colors, the optical compensation, the title margin and the tint of a wrapped icon
- [ ] 1.3 For each requirement in `specs/empty-state/spec.md`, name at least one unit or e2e test that asserts it. Verify that every requirement without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour in the dev app

Run each check in `yarn run dev:empty-state` (http://localhost:3003; the script exists in `package.json`), using the docs examples and the boxes embedded there. A check that needs markup the dev app does not have is made by adding it to `packages/components-dev/empty-state/template.html` for the check only; revert that file before task 3.2.

- [ ] 2.1 Verify the alignment and the height:
    - in the align example, the top-aligned host puts its content at the top and the other centres it;
    - with `min-height` removed from both hosts in the browser's dev tools, the two look the same
- [ ] 2.2 Verify the size layout in the computed styles:
    - in the "big center" box, the title and the text have `max-width: 480px`;
    - in the "default center" box, they have `max-width: 320px`;
    - a heading title has `margin-top: 0`
- [ ] 2.3 Verify the optical compensation in the computed styles:
    - the "default center" and "big center" hosts have a non-zero `margin-bottom`;
    - the "compact center" and "big top" hosts have `margin-bottom: 0`
- [ ] 2.4 Verify the slots in temporary markup:
    - slots declared in the order actions, text, title, illustration render as illustration, title, text, actions;
    - a `<p>` without a slot attribute and an `@if` block with two root elements are missing from the DOM, with nothing in the console
- [ ] 2.5 Verify the tint limits in temporary markup with `[errorColor]="true"`:
    - a plain `<i kbq-icon="kbq-bell_16" kbq-empty-state-icon>` gets no `kbq-error` class;
    - an `<img kbq-empty-state-icon>` keeps its look while the title and the text turn red;
    - `<i kbq-icon-item="kbq-bell_16" kbq-empty-state-icon>` outside any empty state has the `kbq-empty-state-icon` class and no `kbq-error`
- [ ] 2.6 Verify accessibility and the template reference in temporary markup:
    - the host and the slot elements of any box have no `role` or `aria-*` attribute set by the empty state;
    - `<kbq-empty-state role="status">` keeps the role;
    - after `<kbq-empty-state #state="kbqEmptyState" size="big" />`, a sibling `<span>{{ state.size() }}</span>` compiles and shows `big`

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-empty-state-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed, including `packages/components-dev/empty-state/template.html`

## Workflow follow-up

- Archive with `/opsx:archive document-empty-state-baseline` once the checks pass. This creates `openspec/specs/empty-state/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The docs telling consumers to switch `alignTop` and `errorColor` on with a bare attribute, which does not compile under `strictTemplates`, is the most user-visible one.
