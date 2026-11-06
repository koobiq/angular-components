# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/ellipsis-center/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/ellipsis-center`, and verify the unit suite of the directive passes on the baseline commit
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/ellipsis-center` and verify the Playwright spec passes. It backs the split, layout, single-line and tooltip requirements
- [ ] 1.3 For each requirement in `specs/ellipsis-center/spec.md`, name at least one unit or e2e test that asserts it; the two file upload unit tests under "with ellipsis in the center" count for the tooltip. Verify that every requirement without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour by hand

`package.json` has no `dev:ellipsis-center` script. Run `yarn run dev:e2e` and open http://localhost:4200/E2eEllipsisCenterOverflow, which mounts bare hosts; the app is a development build, so `ng.getDirectives(element)` in the browser console returns the directive instance. Use `yarn run dev:breadcrumbs` (http://localhost:3003) where a task says so.

- [ ] 2.1 Verify in the DOM of the e2e page:
    - every host has the class `kbq-ellipsis-center` and no `tabindex` or `role`;
    - the `ellipsisFits` host has `report.pdf` in its start half and an empty end half;
    - while the tooltip of `ellipsisTruncated` is open, the host's text content is the full name, the host has no `aria-describedby`, and the tooltip's overlay pane has the class `cdk-overlay-pane_ignore-pointer-events`
- [ ] 2.2 Verify writing the text from code: get the directive of the `ellipsisTruncated` host from the console and assign `kbqEllipsisCenter = 'quarterly-report.pdf'`:
    - read synchronously, the start half holds the full text and the end half is empty;
    - a moment later the halves hold the new text, split or whole depending on the width;
    - a child element added to the host in the devtools before the assignment is still there afterwards, in front of the halves
- [ ] 2.3 Verify the resize rules in the devtools:
    - widening the first `.cell` from 200 px to 600 px moves the whole name into the start half about 50 ms later, and hovering then shows no tooltip;
    - giving the host a larger height only leaves the halves untouched (watch them with a "subtree modifications" DOM breakpoint)
- [ ] 2.4 Verify by reading `ellipsis-center.directive.ts`, because signal inputs cannot be set from the console:
    - only the text input splits the text again in `ngOnChanges`;
    - `minVisibleLength()` and `charWidth()` are read inside the timer callback;
    - `debounceInterval()` is read once in `ngAfterViewInit` and has the `numberAttribute` transform.

    If a run-time check is wanted, use a local spec case and delete it before 3.2

- [ ] 2.5 Verify the inherited tooltip inputs and outputs:
    - in `yarn run dev:breadcrumbs`, hovering the last item of the "truncate center items" example shows "Report dated 28.08.2018" below the item, as its `kbqPlacementPriority` asks;
    - on the e2e page, after `directive.visibleChange.subscribe(console.log)` in the console, hovering and leaving `ellipsisTruncated` logs `true` and then `false`
- [ ] 2.6 Verify keyboard access on the e2e page: Tab skips the hosts; after `tabindex="0"` is added to `ellipsisTruncated` in the devtools, tabbing onto it shows the tooltip with the full name after about 400 ms

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-ellipsis-center-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed

## Workflow follow-up

- Archive with `/opsx:archive document-ellipsis-center-baseline` once the checks pass. This creates `openspec/specs/ellipsis-center/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The split that is not redone after a web font swaps in, and the tooltip that keyboard and magnification users cannot reach, are the most user-visible ones.
