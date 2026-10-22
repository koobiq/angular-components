# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/skeleton/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/skeleton`, and verify both skeleton unit suites (`skeleton.spec.ts` and `skeleton-presets.spec.ts`) pass on the baseline commit
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/skeleton` and verify the skeleton e2e suite passes. It backs the border radius, element preset size, typography, description list, table, form field, accordion, checkable, tabs and tree geometry requirements
- [ ] 1.3 For each requirement in `specs/skeleton/spec.md`, name at least one unit or e2e test that asserts it. Verify that every requirement without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour in the dev app

`dev:skeleton` exists in `package.json` (`ng serve dev-skeleton --port 3003`). Run each check in `yarn run dev:skeleton` (http://localhost:3003), using the docs examples embedded there and the browser's developer tools.

- [ ] 2.1 Verify in the "Skeleton directive" example, with Loading on:
    - every host has the `kbq-skeleton` class and `inert`, and none of them can be focused with Tab or clicked;
    - the long paragraph shows one bar per line and its text cannot be selected;
    - after turning Loading off, the hosts keep `kbq-skeleton` and gain `kbq-skeleton_disabled`, and lose `inert`
- [ ] 2.2 Verify the export name and the input parsing without editing any file:
    - the golden file lists `["kbqSkeleton"]` as the export name of `KbqSkeleton`;
    - in the browser console, `ng.getDirectives(host)` on a skeleton host returns a `KbqSkeleton` whose `enabled()` follows the Loading toggle;
    - the input goes through Angular's `booleanAttribute`, which reads `null` and `undefined` as `false`
- [ ] 2.3 Verify motion:
    - with the system's reduced-motion setting on (or emulated in the developer tools), skeletons show a still fill;
    - a page reloaded with reduced motion gives the hosts the `kbq-animations-disabled` class
- [ ] 2.4 Verify the pause outside the viewport: scroll a skeleton more than 100 px out of the viewport and check that it gains `kbq-skeleton_offscreen`, and loses it when scrolled back
- [ ] 2.5 Verify that the skeleton styles need no skeleton stylesheet: `packages/components-dev/skeleton/styles.scss` imports the deprecated `skeleton-light.css` and `skeleton-dark.css` of `@koobiq/design-tokens`. In the developer tools, disable those two stylesheets and confirm that the skeletons keep their fill and wave, the wave colors then coming from the global tokens in `packages/components-dev/main.scss`
- [ ] 2.6 Verify in the accessibility tree of the developer tools that an active skeleton host and its content are absent and that no `role`, `aria-busy` or `aria-label` was added to any host
- [ ] 2.7 Verify in the "Skeleton basic block" example that the `kbq-skeleton` element takes half the width and has a non-zero height without a height of its own
- [ ] 2.8 Verify the remaining source-only claims by reading `skeleton-presets.ts`, `module.ts` and `tools/public_api_guard/components/skeleton.api.md`:
    - the element presets list no inputs, and the layout preset hosts have no `kbq-skeleton` class or `inert`;
    - `preset` of `kbq-skeleton-group` is required;
    - `count`, `columns`, `contentLines` and `children` go through the same parsing as `lines` and `rows`;
    - the default `treeChildren` is 3;
    - `KbqSkeletonModule` imports and exports the directive and the fourteen presets

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-skeleton-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed

## Workflow follow-up

- Archive with `/opsx:archive document-skeleton-baseline` once the checks pass. This creates `openspec/specs/skeleton/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The docs claim that typography lines vary randomly and the missing accessibility guidance are the most visible to consumers.
