# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/flag/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/flag`, and verify the flag unit suite passes on the baseline commit
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/flag` and verify the flag e2e suite passes. Its screenshots back the size, crop, shape proportions, aspect ratio, custom property, corner radius, inset shadow and empty placeholder requirements
- [ ] 1.3 For each requirement in `specs/flag/spec.md`, name at least one unit or e2e test that asserts it. Verify that every requirement without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour by hand

`package.json` has `dev:flag` (`ng serve dev-flag --port 3003`); its app embeds the nine docs examples. Behaviour that no example exercises is checked with a throwaway test case instead.

- [ ] 2.1 In `yarn run dev:flag` (http://localhost:3003), verify with the browser devtools:
    - in the custom-ratio example (font size 48 px), the default flag measures 72 × 48 px, the 4:3 one 64 × 48 px and the 1:1 one 48 × 48 px;
    - in the fallback example, whose flags set `height: 12px`, each flag is 18 px wide;
    - pressing Tab through the page never puts focus on a flag, and no `kbq-flag` element has a `tabindex`
- [ ] 2.2 In the same app, add the devtools style rule `.kbq-flag { --kbq-flag-aspect-ratio: 4 / 3; }` and verify that the flags of the square and circle examples take 4:3 proportions, while the flags of the custom-ratio example with an `aspectRatio` input keep their own
- [ ] 2.3 Write the source-only cases as a throwaway spec next to `flag.spec.ts`, run `npx vitest run packages/components/flag`, verify each case passes, then delete the file:
    - `#flag="kbqFlag"` refers to the component instance;
    - a projected inline `<svg>` is rendered, and the `.kbq-flag__svg` element is the last child when `svg` is set too;
    - `svg` set to `''`, or changed from a trusted value to `undefined`, leaves no `.kbq-flag__svg` element;
    - a plain SVG string in `svg` renders no `<svg>` element (stub `console.warn`: Angular's dev-mode sanitizer warning fails the test otherwise);
    - `empty` on a flag with a projected `<img>` keeps the image;
    - `decorative="false"` with `label="Germany"` gives `role="img"`, and `empty="false"` gives no `kbq-flag_empty` class;
    - a flag without `label` whose projected image has `alt="Germany"` has `aria-hidden="true"`

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-flag-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed, the throwaway spec of 2.3 included

## Workflow follow-up

- Archive with `/opsx:archive document-flag-baseline` once the checks pass. This creates `openspec/specs/flag/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The blank accessible name of a whitespace-only `label` and the `empty` input missing from the docs pages are the most user-visible ones.
