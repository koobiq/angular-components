# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/top-bar/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/top-bar`, and verify the top bar unit suite passes on the baseline commit
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/top-bar` and verify both screenshots match in the light and the dark theme. They back the row layout, spacer, start container minimum width, overflow spacing, sticky inset and layer requirements
- [ ] 1.3 For each requirement in `specs/top-bar/spec.md`, name at least one unit or e2e test that asserts it. Verify that every requirement or scenario without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour by hand

`package.json` defines `dev:top-bar` (`ng serve dev-top-bar --port 3003`). Its app at http://localhost:3003 renders the seven docs examples. The examples set no role, no `aria-label` and no inset, so the checks that need them use the e2e app: `yarn run dev:e2e`, http://localhost:4200/E2eTopBarSticky.

- [ ] 2.1 Verify the host in the DOM of the dev app:
    - no `kbq-top-bar` element has a `role`, a `tabindex` or an `aria-label`;
    - every container carries exactly one placement modifier, and every bar carries `kbq-overlay-layer-exclude`;
    - the slots are direct children of the bar. These examples import `KbqTopBarModule`, which also confirms the module exports all three classes
- [ ] 2.2 Verify focus in the overview example:
    - Tab moves through its buttons in document order and never stops on the bar;
    - Right on a focused button leaves focus where it is
- [ ] 2.3 Verify the layout while narrowing the window in the dev app:
    - the computed width of every `.kbq-top-bar-spacer` stays 80 px;
    - after `--kbq-top-bar-spacer-min-width: 40px` is set on a bar in DevTools, its spacer is 40 px wide;
    - each start container stops shrinking at the min width its example sets on it
- [ ] 2.4 Verify the shadow in the overflow example:
    - scrolling its content fades the shadow in over about 300 ms, and scrolling back to the top removes it at once;
    - with DevTools emulating `prefers-reduced-motion: reduce` and the page reloaded, the bar carries `kbq-animations-disabled` and the shadow appears without a transition
- [ ] 2.5 Verify the custom property scope:
    - in the dev app, `--kbq-top-bar-container-start-min-width` set on an ancestor of a bar changes nothing;
    - in `/E2eTopBarSticky`, the bar sticks with its inset, and scrolls away with the content once the inset is removed in DevTools
- [ ] 2.6 Verify in `/E2eTopBarSticky`:
    - the bar has `role="banner"` and `aria-label="Dashboards"` as written;
    - its computed `z-index` is 990;
    - the "Actions" dropdown paints over the bar
- [ ] 2.7 Verify in `tools/public_api_guard/components/top-bar.api.md` that `placement` of `KbqTopBarContainer` is `"required": true`

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-top-bar-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed

## Workflow follow-up

- Archive with `/opsx:archive document-top-bar-baseline` once the checks pass. This creates `openspec/specs/top-bar/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The opening sentence of the overview pages and the double spacing of a container that is itself the overflow host are the most visible ones.
