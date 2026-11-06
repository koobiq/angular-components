# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are:

- `packages/components/clamped-text/`: `clamped-text.ts`, `clamped-list.ts` (the list and the trigger), `constants.ts`, `clamped-text.module.ts`, `clamped-text.scss`, the unit specs `clamped-text.spec.ts` and `clamped-list.spec.ts`, `e2e.ts` with `e2e.playwright-spec.ts`, and the pages `clamped-text.{en,ru}.mdx` and `clamped-list.{en,ru}.mdx`;
- the five examples under `packages/docs-examples/components/clamped-text/` and the dev app `packages/components-dev/clamped-text/`;
- the API golden file `tools/public_api_guard/components/clamped-text.api.md`;
- what the entry point relies on: the `clampedText` locale section, `kbqInjectLocaleConfiguration`, `kbqLocaleConfigurationOverrideProvider` and `KbqLocaleOverridesDirective` in `packages/components/core/locales/`, and `KbqLink` in `packages/components/link/link.ts`, which the built-in toggle and every example trigger carry.

The entry point has no examples tab (`hasExamples: false` in `structure.ts`); its two docs pages, Clamped text and Clamped list, share one API tab. The general approach follows the `select` baseline.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the entry point, and every scenario can be checked by an existing test or by hand in the dev app.
- One place to diff against when clamped text, the clamped list or the trigger changes later.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Internals: how lines are counted, the resize observer, the locale plumbing, class and member names that are not public.
- Styling and tokens: `--kbq-clamped-text-line-clamp`, `--kbq-clamped-text-size-toggle-margin`, the spacing of a list trigger, the look of `kbq-link`.
- The `overflow-items` example built on the clamped list, the `clamped-text-disclosure` migration, and changes to tests, docs or examples.

## Decisions

The general decisions of the `select` baseline apply here unchanged: a flat capability path named after the entry point, English, quirks documented as they ship, only behaviour confirmed by a test or read in the source, and public names, selectors, host classes, ARIA attributes and exported constants as the contract. The decisions below are specific to this entry point.

1. **One capability for two containers and the trigger.** `kbq-clamped-text` and `[kbqClampedList]` are documented as two components but ship from one entry point, share `kbqClampedListTrigger`, the `KbqClampedRoot` contract and the `clampedText` locale section. Two capabilities, `clamped-text` and `clamped-list`, were considered and rejected: the trigger and the strings would have to live in one of them or be repeated in both, and a change to the trigger touches both containers at once. The trigger's requirements are written for any clamped container, with scenarios for both.
2. **Order of the requirements.** The Clamped text page first (lines, the one-hidden-line rule, external state), then the Clamped list page, then the trigger from that page's accessibility section, then localization, template references and the NgModule.
3. **The measurement is described by its rule, not its method.** "More than `rows` + 1 rendered lines", "measured again when the content box is resized" and `debounceTime` are contract. How the lines are counted is not, and neither is the `--kbq-clamped-text-line-clamp` custom property that one unit test asserts: it only connects the template to the stylesheet.
4. **Contract classes and ids.** The classes `kbq-clamped-text`, `kbq-clamped-text__content`, `kbq-clamped-text__content_collapsed`, `kbq-clamped-text__toggle`, `kbq-clamped-list` and `kbq-clamped-list__trigger` count; the tests and consumers select by them. `contentId` counts as a unique id that `aria-controls` points at. Its generated prefix does not.
5. **Quirks stay in the spec as they ship.** Examples:
    - `isCollapsed = true` does not collapse content that fits in `rows` + 1 lines;
    - `exceededItemCount` is negative for a short list;
    - a trigger rendered while its container has no toggle reports `aria-expanded="true"`;
    - a `toggle()` call from code emits `isCollapsedChange` like a user action does;
    - a trigger outside any container is still a focusable button that does nothing.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/clamped-text` updates `openspec/specs/clamped-text/spec.md` with a delta, checked in review like the API golden file.
- [The line rule rests on layout that jsdom does not have] → The unit tests stub the resize observer and the measured line boxes, so only three Playwright tests, all in Chromium, see a real measurement. tasks.md checks the rule by hand in the dev app, including narrowing the container.
- [Some requirements rest on the source rather than on a test] → They are listed below under "Behaviour without a test", and tasks.md checks each by hand. A mismatch is corrected in the delta, not in the code.
- [A defect gets recorded as intended behaviour] → Suspected defects stay out of the spec and are listed under Findings. Behaviour the spec does state can change later through `MODIFIED`.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The Accessibility section of `clamped-list.{en,ru}.mdx` says that without `kbqClampedListTrigger` the trigger "is not reachable from the keyboard". Every example's trigger is an `<a kbqLink pseudo>`, which `KbqLink` already makes a focusable `role="button"` activated by Enter and Space. What is lost without the directive is `aria-expanded` and `aria-controls`.
2. The JSDoc of `KbqClampedList.visibleItems` says the list is truncated "to `minVisibleCount`". There is no such input; it is `collapsedVisibleCount`.
3. The JSDoc of `KbqClampedList.isCollapsed` describes "`undefined` = expanded", but the model is typed `boolean`.
4. The JSDoc of `KbqClampedText.isCollapsed` says it is written "when the user operates the toggle", and the "External state control" section says a user action is "the only thing that travels back". A `toggle()` call from code also writes it and emits `isCollapsedChange`.
5. The JSDoc of `rows` ("Max rows before text is clamped") and of `isCollapsed` (`true` = collapsed) leave out that nothing collapses until the content exceeds `rows` + 1 lines.
6. The `KbqClamped` interface, shared by both containers, documents `toggle()` as toggling "the collapsed state of the list". The `@see {KbqClampedText, KbqClampedList}` on `kbqInjectClampedTextLocaleConfiguration` is not a valid `@see` target.
7. Examples:
    - `clamped-list` and `clamped-list-dotted` render the separator only while `hasToggle()` is true, so a list that fits shows no separators, and the last visible item keeps one before the trigger;
    - `clamped-list-overview` declares a `collapsed` signal it never uses, and on expanding moves focus to the first item of the list rather than to the first item that was revealed.

**Suspected defects (from reading the code, not reproduced)**

1. The content is measured only when the content box changes size. A change of `rows`, or of the projected text, that leaves the box the same size is not measured. Expanded 20-line text whose `rows` grows to 30 probably keeps a toggle that changes nothing. Collapsed text whose content shrinks to `rows` + 1 lines probably keeps its toggle as well.
2. The trigger toggles on every Enter or Space keydown, auto-repeat included. Holding a key probably flips the state on each repeat, while a native button fires once. `KbqLink` guards against the repeat, but it never sees the event, because the trigger has already prevented its default.
3. Lines are counted from the line boxes of an inline wrapper around the projected content. Block-level content, such as several `<p>`, probably counts as fewer lines than it renders, so long block content may get no toggle.
4. With `hiddenThreshold` at 0 or below, `hasToggle()` is true when nothing is hidden, and the list's trigger would read "Show 0 more".
5. The toggle of `kbq-clamped-text` changes its accessible name between "Expand" and "Collapse" while also exposing `aria-expanded`, so a screen reader announces the state twice. This is a design question rather than a clear defect.

**Tests whose name and body disagree, or that cannot fail**

- `clamped-list.spec.ts` "should keep an id the host already carries" renders a host without an id and only checks that some id exists. The generated id is tested; keeping an existing id is not.
- The test host of `clamped-list.spec.ts` binds `collapsedVisibleCount` to 10 and `hiddenThreshold` to 6 and never changes them, so neither the defaults nor other values are tested. The `rows` default is untested the same way: the hosts bind 5 or `kbqClampedTextDefaultMaxRows`.
- The `measure` helper in `clamped-text.spec.ts` explains its extra wait by "a timer scheduled outside the Angular zone"; the suite runs without zone.js.

**Behaviour without a test.** The spec states these from the source:

- the default `rows` of 5 and `rows` given as a string;
- `isCollapsed = true` on content that fits;
- the server-rendered state;
- `debounceTime`, and a resize that makes the toggle appear;
- the text and icons of the built-in toggle (only an `en-US` screenshot shows them);
- expanding never scrolls;
- click and keydown propagation stopped by a trigger;
- the list defaults `collapsedVisibleCount` 10 and `hiddenThreshold` 6;
- `exceededItemCount` and `showMoreCountText` (only a screenshot shows "Show 7 more");
- `[(isCollapsed)]` and `isCollapsedChange` on the list;
- a list host keeping the id written on it;
- a trigger without a toggle reporting `aria-expanded="true"`;
- a written `role` or `tabindex` winning on a trigger;
- a trigger outside any container;
- switching the locale, `[localeOverrides]` and `KBQ_CLAMPED_TEXT_LOCALE_CONFIGURATION` (the provider is shown only by screenshots);
- the `kbqClampedText` and `kbqClampedListTrigger` template references and `KbqClampedTextModule`.
