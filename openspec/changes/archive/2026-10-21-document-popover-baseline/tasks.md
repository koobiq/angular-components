# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/popover/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/popover`, and verify the popover unit suite passes on the baseline commit
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/popover` and verify the popover e2e suite passes. It backs the long-content, scrollbar, gap, closing-on-scroll and tooltip requirements
- [ ] 1.3 For each requirement in `specs/popover/spec.md`, name at least one unit or e2e test that asserts it. Verify that every requirement, or part of one, without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour in the dev app

`dev:popover` exists in `package.json`. Run each check in `yarn run dev:popover` (http://localhost:3003), using its controls and the docs examples embedded there. Trigger properties with a public setter, such as `preventClose`, `disabled`, `trigger`, `content`, `header`, `customClass`, `closeOnScroll` and `popoverPlacementPriority`, can be written from the browser console on the directive returned by `ng.getDirectives(<host element>)`. A check that needs a template edit makes it locally and reverts it before task 3.2.

- [ ] 2.1 Verify the content and layout rules:
    - "Save" and "Cancel" in the overview example close the popover through `popover.hide(0)`;
    - the small and width examples open 200, 400 and 640 px wide panels;
    - with `content` of the overview example's trigger set to a long string from the console, the panel stops growing at 480 px and its content scrolls;
    - in the arrow-and-offset example a custom offset moves the panel away from the trigger, and hiding the arrow keeps the gap
- [ ] 2.2 Verify placement:
    - a panel opened near a window edge takes another placement or is pushed back into the window;
    - with `popoverPlacementPriority` set to an array holding a known and an unknown name in the console, the popover still opens in the known placement
- [ ] 2.3 Verify scrolling:
    - a default popover stays open and follows its trigger when the page scrolls;
    - in the layering example, which binds `[kbqPopoverHideIfNotInViewPort]="false"`, the popover stays open when its trigger scrolls out of the container, and closes once that binding is removed;
    - with the class `kbq-hide-nested-popup` added to the layering example's scroll container in DevTools, the popover closes when its trigger scrolls out of view;
    - with "Stick to window" set in the dev app controls, the panel sits on that window edge without an arrow, also after a resize
- [ ] 2.4 Verify the confirmation popover in the dev app:
    - its panel has `role="dialog"` and an `aria-label` equal to the question;
    - writing `content`, `header` or `hasCloseButton` on its trigger from the console changes nothing in the panel
- [ ] 2.5 Verify opening and closing:
    - the hover example stays open when the pointer leaves the trigger and comes back within 500 ms;
    - a click on the trigger of an open click popover closes it;
    - a popover with the "Program" trigger of the dev app, or the text-selection example, stays open on a click elsewhere;
    - a `keydown` Escape dispatched from the console with `preventDefault()` already called, on the trigger and on an element inside the open panel, leaves the popover open;
    - `show()` and `hide()` called from the console without a delay use the enter and leave delays
- [ ] 2.6 Verify the closing guards on a popover with a close button, with `closeOnScroll` and then `preventClose` set to `true` from the console before it opens: the close button, `close()`, `hide()`, a touch on the trigger in the device toolbar, a page scroll and `disabled` set to `true` all leave it open. Then set `preventClose` to `false`, close it, set `disabled` to `true`, and verify that a click on the trigger opens nothing
- [ ] 2.7 Verify focus:
    - opening the overview example by click moves focus to its input, and Tab and Shift+Tab stay inside the panel;
    - with `trigger` set to `click, hover` from the console, a hover open moves focus into the panel;
    - the hover example opened by hover leaves focus where it was
- [ ] 2.8 Verify the scrollable content region on the overview example's trigger, writing its properties from the console before each open:
    - its own short content has no `tabindex`;
    - with `content` set to a long string, the content area has `tabindex="0"` and no `role`;
    - with `header` set to a string as well, the content area also has `role="region"` and an `aria-labelledby` equal to the header text's id
- [ ] 2.9 Verify the classes and strings:
    - an open trigger has `kbq-popover_open`, and the overlay pane has `kbq-popover__panel`;
    - `customClass` set to `a b` from the console puts both classes on the panel;
    - the close button is named "Закрыть" by default and, in `yarn run dev:all`, which has a locale selector, "Close" after switching to `en-US`;
    - a temporary template binding `[kbqPopoverArrow]="undefined"` hides the arrow

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-popover-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed, including the temporary edits of task 2

## Workflow follow-up

- Archive with `/opsx:archive document-popover-baseline` once the checks pass. This creates `openspec/specs/popover/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The hover panel that closes at once when the pointer leaves it, bypassing the leave delay and `kbqPopoverPreventClose`, and the hover confirmation popover that stays open after `confirm`, are the most user-visible ones.
