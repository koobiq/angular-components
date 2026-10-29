# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/tooltip/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/tooltip`, and verify the tooltip unit suite passes on the baseline commit
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/tooltip` and verify the tooltip e2e suite passes. It backs the default gaps, Escape without focus, the hoverable pane, following the caret and the color screenshots
- [ ] 1.3 For each requirement in `specs/tooltip/spec.md`, name at least one unit or e2e test that asserts it. Verify that every requirement without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour in the dev app

Run each check in `yarn run dev:tooltip` (http://localhost:3003; the script is defined in `package.json`), using its "Single visible tooltip" row, its configuration panel and the docs examples embedded below them. Where a check needs a directive instance, select the trigger in DevTools and read it in the console with `ng.getDirectives($0)`.

- [ ] 2.1 Verify the triggers:
    - the "click" button opens its tooltip after about 400 ms and a click elsewhere closes it;
    - Space on the focused "keydown" button opens its tooltip;
    - hovering or tabbing to the "manual" button opens nothing;
    - with touch emulation on in DevTools, a tap that ends on an open tooltip's trigger closes it
- [ ] 2.2 Verify that scrolling the page closes an open tooltip
- [ ] 2.3 Verify the width rules:
    - the "Max Width" tooltip of the width example is 300 px wide and wraps;
    - `.kbq-tooltip` has the computed style `white-space: pre-line`
- [ ] 2.4 Verify the placement rules:
    - setting `tooltipPlacement` to `'middle'` on a directive logs "Unknown position: middle. Will used default position: top";
    - a `top` trigger scrolled to the top edge of the viewport opens below it, and a `placementChange` subscription made in the console logs `bottom`;
    - choosing only "Bottom" in the kbqPlacementPriority field of the configuration panel opens the configured tooltip below its trigger
- [ ] 2.5 Verify `kbqRelativeToPointer` in the relative-to-pointer example:
    - entering the button near its right end centres the tooltip on the pointer, and moving the pointer does not move it;
    - after setting `tooltipPlacement` to `'right'` on that directive, the tooltip is anchored to the button
- [ ] 2.6 Verify the pointer rules with `leaveDelay` set to 1000 on a directive:
    - without `hideWithTimeout`, moving from the overview button onto its tooltip still closes it about 1 s after leaving the button;
    - leaving the button and coming back within 1 s keeps the tooltip open;
    - in the interactive example, moving onto the tooltip and then off it closes it without waiting 1 s
- [ ] 2.7 Verify that `show(1000)` called on the manual tooltip less than 2 s after a hover tooltip was shown opens it at once
- [ ] 2.8 Verify on the manual tooltip, opened with its toggle button:
    - setting `disabled` to `true` closes it;
    - setting `content` to a new text updates the open tooltip;
    - setting `tooltipVisible` to `false` closes it;
    - the trigger has the class `kbq-tooltip_open` while it is open
- [ ] 2.9 Verify on the manual tooltip, closed: after setting `header` to "H" and `customClass` to "a b" and calling `show(0)`, the tooltip renders the header with the default modifier and its element has the classes `a` and `b`
- [ ] 2.10 Verify the "-8px" tooltip of the offset example overlaps its button by 8 px
- [ ] 2.11 With "prefers-reduced-motion: reduce" emulated in DevTools, verify that a tooltip appears without the entrance animation

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-tooltip-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed

## Workflow follow-up

- Archive with `/opsx:archive document-tooltip-baseline` once the checks pass. This creates `openspec/specs/tooltip/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The `warning` modifier that no stylesheet targets is the most user-visible one, followed by Escape closing the pinned validation tooltip from inside its form field.
