# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/loader-overlay/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/loader-overlay`, and verify the loader-overlay unit suite (21 tests, one snapshot) passes on the baseline commit
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/loader-overlay` and verify the three screenshot tests ("states", "card", "surfaces") pass. They back the covering, size and surface requirements
- [ ] 1.3 For each requirement in `specs/loader-overlay/spec.md`, name at least one unit or e2e test that asserts it. Verify that every requirement or scenario without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour in the dev app

`yarn run dev:loader-overlay` exists in `package.json` and serves `packages/components-dev/loader-overlay` on http://localhost:3003, with the seven docs examples embedded below its own blocks. Run each check there with the browser devtools.

- [ ] 2.1 Verify the covering and the parent class:
    - with the overlays shown, each `.dev-container` that holds one has the class `kbq-loader-overlay_parent`;
    - after "toggleLoading", the overlays disappear at once and the containers no longer have that class;
    - in the background example, the overlays have the rounded corners of their cards
- [ ] 2.2 Verify pointer and keyboard access: add a `<button>` to a `.dev-container` that shows an overlay, using "Edit as HTML" in the devtools. Clicking where the button is does not activate it, and pressing Tab still moves focus onto it
- [ ] 2.3 Verify the projected parts in the "custom" block:
    - the red spinner is the only spinner in that overlay;
    - "Создание отчета" and the size caption are shown, and the bound "text text…" and "caption caption…" strings are not;
    - the projected elements have the classes `kbq-loader-overlay-indicator`, `kbq-loader-overlay-text` and `kbq-loader-overlay-caption`
- [ ] 2.4 Verify the default spinner of the first block has the class `kbq-progress-spinner_indeterminate`, and that no overlay, spinner or `.dev-container` has a `role`, `aria-busy` or `aria-live` attribute
- [ ] 2.5 Add a temporary block to `packages/components-dev/loader-overlay/template.html` and verify:
    - an overlay with `text=""` and `caption=""` renders neither a text nor a caption element and has the class `kbq-loader-overlay_empty`;
    - an overlay with only `caption` set shows the caption and no text element;
    - an overlay whose only content is a projected caption does not have the class `kbq-loader-overlay_empty`;
    - a projected caption written before a projected text is rendered under it;
    - a plain `<span>` inside the overlay is not rendered.

    Discard the block afterwards; task 3.2 checks that it is gone

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-loader-overlay-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed

## Workflow follow-up

- Archive with `/opsx:archive document-loader-overlay-baseline` once the checks pass. This creates `openspec/specs/loader-overlay/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The docs promising focus blocking that the overlay does not provide, together with the missing `aria-busy`, is the most user-visible one; the inert `fixed-top` attribute in the examples is the cheapest to fix.
- The change that removes the deprecated `transparent` and `card` inputs in 22.0.0 updates the "Default surface" and "Surface takes precedence over the deprecated inputs" requirements with a `MODIFIED` and a `REMOVED` delta.
