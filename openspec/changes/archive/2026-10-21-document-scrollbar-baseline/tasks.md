# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/scrollbar/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/scrollbar`, and verify the scrollbar unit suite passes on the baseline commit. The `deprecated` suite under the same path runs too; it is out of scope, but it has to pass as well
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/scrollbar` and verify the scrollbar e2e suite passes. It backs the hover and always visibility, content-change, virtual-scroll, geometry, corner, stacking, nested, native-styling and edge-scrolling requirements
- [ ] 1.3 For each requirement in `specs/scrollbar/spec.md`, name at least one unit or e2e test that asserts it. Verify that every requirement without such a test, and every part of one that no test reaches, is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour in the dev app

Run each check in `yarn run dev:scrollbar` (http://localhost:3003; the script is in `package.json`), which renders the four docs examples: overview with a mode select, virtual scroll, scroll-to methods and native scrollbar. Where a check needs a setting no example has, make a temporary edit inside `packages/components-dev/scrollbar/` only, and revert it before 3.2.

- [ ] 2.1 Verify these pointer details in the overview example in `hover` mode:
    - pressing the vertical thumb and dragging the pointer out of the scrollbar keeps the track visible until the button is released;
    - with the mode select focused, pressing a bar leaves focus on the select and starts no text selection;
    - with `scroll-behavior: smooth` added to the scrollbar through a devtools style rule, a thumb drag moves the content with the pointer, without easing
- [ ] 2.2 Verify the visibility rules in the overview example:
    - in `hidden` mode, the wheel and the keyboard still scroll the content;
    - after resizing the example (it has `resize: both`) until `clientHeight / scrollHeight` of the scrollbar is above 0.99 but below 1, no vertical bar is drawn
- [ ] 2.3 Verify the hide delay with a temporary `kbqScrollbarHideDelay="3000"` on the overview scrollbar: in `hover` mode the track stays visible 3 s after the last scroll, and a new scroll within that time restarts the 3 s
- [ ] 2.4 Verify the provider fallback with a temporary `kbqScrollbarOptionsProvider({ mode: 'always' })` in the dev app's `bootstrapApplication` providers and `kbqScrollbarOptionsProvider({ hideDelay: 500 })` in the `providers` of `DevDocsExamples`: the virtual-scroll example, which binds no mode, uses `hover`
- [ ] 2.5 Verify programmatic scrolling from the devtools console on the scroll-to example, with `ng.getComponent(<its kbq-scrollbar>)`:
    - `scrollTo({ bottom: 0 })` and `scrollTo({ right: 0 })` reach the bottom and right edges;
    - `scrollTo({ end: 0 })` and `scrollTo({ start: 0 })` reach the right and left edges;
    - with a temporary `document.documentElement.dir = 'rtl'` before bootstrap in `main.ts`, `scrollEnd()` reaches the left edge and `scrollStart()` the right one
- [ ] 2.6 Verify from the console on the virtual-scroll example that `flashScrollIndicators()` of its `KbqScrollbarViewport`, taken from `ng.getDirectives(<the viewport>)`, reveals the track for 1000 ms, and that a subscriber to its `flashes` is called once per call
- [ ] 2.7 Verify re-measuring on hover and on focus: delete all but one paragraph of the overview scrollbar in devtools so the vertical bar goes away, then add a devtools stylesheet rule that gives that paragraph `transform: translateY(400px)`. No vertical bar is drawn until the pointer enters the scrollbar, or, with the pointer kept away, until Tab moves focus from the mode select into it
- [ ] 2.8 Verify in the DOM:
    - the overview scrollbar's id starts with `kbq-scrollbar-viewport-` and its thumbs' `aria-controls` equals it;
    - the `.kbq-scrollbar-viewport` rule sets no `overflow`, so the virtual-scroll viewport's overflow comes from CDK
- [ ] 2.9 Verify motion: with `prefers-reduced-motion: reduce` emulated in devtools, and separately with a temporary `{ provide: ANIMATION_MODULE_TYPE, useValue: 'NoopAnimations' }` in the dev app's providers (`@angular/animations` is not installed, so `provideNoopAnimations()` is not available here), the track, the bars and the thumbs carry `kbq-animations-disabled` after a reload
- [ ] 2.10 Verify by reading `scrollbar.ts` and the API golden file `tools/public_api_guard/components/scrollbar.api.md`:
    - a finished web font load, reported by `document.fonts`, is one of the content changes the scrollbar re-measures on, which no hand check reproduces reliably;
    - `KbqScrollbarModule` imports and exports the three public classes;
    - `KbqScrollbarViewport` has no export name

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-scrollbar-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Revert any temporary dev-app edits, run `git status --short`, and verify that nothing outside `openspec/` has changed

## Workflow follow-up

- Archive with `/opsx:archive document-scrollbar-baseline` once the checks pass. This creates `openspec/specs/scrollbar/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The keyboard and touch claims of the overview page, the `undefined` mode that behaves like `always`, and `scrollToElement` on a viewport that is not positioned are the most user-visible ones.
