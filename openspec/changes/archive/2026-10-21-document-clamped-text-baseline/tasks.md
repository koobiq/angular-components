# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/clamped-text/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/clamped-text`, and verify that both unit suites, `clamped-text.spec.ts` and `clamped-list.spec.ts`, pass on the baseline commit
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/clamped-text` and verify the e2e suite passes. It backs the clipping, the `rows` + 1 rule in a real layout, keeping the expanded state on resize, and Space on a pseudo-link trigger
- [ ] 1.3 For each requirement in `specs/clamped-text/spec.md`, name at least one unit or e2e test that asserts it. Verify that every requirement or scenario without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour by hand

`package.json` has `dev:clamped-text`. Run `yarn run dev:clamped-text` (http://localhost:3003); it embeds all five docs examples and a locale selector. In the browser console, `ng.getComponent(element)` and `ng.getDirectives(element)` give the instances whose signals a check reads.

- [ ] 2.1 In the clamped-text overview example, drag the resize handle of its container and verify:
    - the toggle appears once the text needs more than six lines, and collapsed text then shows five;
    - at six lines or fewer the full text shows with no toggle;
    - text expanded by the user stays expanded when the container is narrowed again
- [ ] 2.2 Verify the toggle and the strings:
    - under `ru-RU` the toggle reads "Развернуть" with a chevron-down icon, and "Свернуть" with a chevron-up icon once expanded;
    - after switching the locale selector to `en-US` it reads "Expand" and "Collapse", and the overview list trigger reads "Show 7 more"
- [ ] 2.3 Verify scrolling: expanding does not scroll the page; after scrolling so that the top of an expanded text is above the viewport, collapsing it with the toggle scrolls the text back into view
- [ ] 2.4 In the clamped-list examples, verify:
    - the overview list shows 10 of 17 items, and its `ng.getDirectives` instance reports `collapsedVisibleCount()` 10, `hiddenThreshold()` 6 and `exceededItemCount()` 7;
    - expanding the overview list focuses its first link, which shows `isCollapsedChange` emitting;
    - after the comma-separated list is expanded, `ng.getComponent` on its example host reports `collapsed()` as `false`
- [ ] 2.5 Verify the trigger in the DOM:
    - a list trigger has `role="button"`, `tabindex="0"`, an `aria-controls` equal to the list host's id, and an `aria-expanded` that flips on activation;
    - neither the list host nor the `kbq-clamped-text` host has `aria-expanded`;
    - with a `click` and a `keydown` listener added to `document.body` from the console, clicking a trigger or pressing Enter on it toggles the container and logs nothing
- [ ] 2.6 Verify the server-rendered state: run `yarn run docs:build`, open the prerendered `en/components/clamped-text/overview` page under `dist/releases/koobiq-docs/`, and verify that its example markup has `kbq-clamped-text__content_collapsed` and no `kbq-clamped-text__toggle`
- [ ] 2.7 No example binds the remaining inputs. Add a temporary template to `packages/components-dev/clamped-text/` that you revert before 3.2, and verify:
    - `debounceTime="300"` delays the toggle until 300 ms after resizing stops;
    - `rows="3"` given as a string clamps to three lines;
    - `[isCollapsed]="true"` on text of three lines shows it in full with no toggle
- [ ] 2.8 With the same temporary template, verify:
    - `<span kbqClampedListTrigger tabindex="-1">` keeps `tabindex="-1"` and `role="button"`;
    - a trigger outside any container has no `aria-expanded` or `aria-controls`, and clicking it changes nothing;
    - a list host written with `id="tags"` keeps that id and its trigger has `aria-controls="tags"`;
    - `[localeOverrides]` with only `clampedText.openText` changes the collapsed label of that one text, while its expanded label still follows the locale

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-clamped-text-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed, the temporary dev template of 2.7 included

## Workflow follow-up

- Archive with `/opsx:archive document-clamped-text-baseline` once the checks pass. This creates `openspec/specs/clamped-text/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The measurement that ignores a change of `rows` or of the content and the accessibility docs that misstate what the trigger directive adds are the most user-visible ones.
