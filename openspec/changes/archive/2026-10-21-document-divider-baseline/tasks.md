# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/divider/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/divider`, and verify the divider unit suite passes on the baseline commit
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/divider` and verify the divider e2e suite passes. Its screenshots back the spacing and default length requirements
- [ ] 1.3 For each requirement in `specs/divider/spec.md`, name at least one unit or e2e test that asserts it. Verify that every requirement without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour in the dev app

Run each check in `yarn run dev:divider` (http://localhost:3003; the script is defined in `package.json`). The dev app renders a horizontal and a vertical pair of dividers, each with and without `paddings`, the vertical pair in a 50 px tall container.

- [ ] 2.1 Verify the spacing in the computed styles:
    - a horizontal divider with `paddings` has equal non-zero top and bottom margins and zero left and right margins;
    - a vertical divider with `paddings` has equal non-zero left and right margins and zero top and bottom margins;
    - both dividers with `[paddings]="false"` have four zero margins
- [ ] 2.2 Verify the default length: the horizontal dividers are as wide as their container, and the vertical dividers are 50 px tall with no inline `width` or `height`
- [ ] 2.3 Verify that pressing Tab through the page never focuses a divider and that no divider has a `tabindex`
- [ ] 2.4 With a temporary edit to `packages/components-dev/divider/template.html`, reverted before 3.2, verify:
    - `<kbq-divider>Section</kbq-divider>` shows no text and has no child nodes;
    - `length=""` and `[length]="null"` write no inline size;
    - `vertical="false"` gives a horizontal divider with `role="separator"` and no `aria-orientation`;
    - `decorative="false"` keeps `role="separator"`;
    - toggling `paddings` and `decorative` at runtime adds and removes `kbq-divider_paddings` and switches `role` between `separator` and `presentation`

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-divider-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed

## Workflow follow-up

- Archive with `/opsx:archive document-divider-baseline` once the checks pass. This creates `openspec/specs/divider/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The vertical divider that collapses to 0 px in a container without a definite height is the most user-visible one.
