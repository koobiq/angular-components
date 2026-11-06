# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are `packages/components/title/` (the directive, the module, the unit spec, `e2e.ts` and the Playwright spec), `KbqTooltipTrigger` in `packages/components/tooltip/tooltip.component.ts` and the pop-up trigger in `packages/components/core/pop-up/`, which the directive extends, `KBQ_TITLE_TEXT_REF` in `packages/components/core/title/`, the `kbq-title` tests of the tree selection spec, the `title.{en,ru}.mdx` and `examples.title.{en,ru}.mdx` pages, the five examples in `packages/docs-examples/components/title/`, the `Title` entry of `apps/docs/src/app/structure.ts`, and the API golden file `tools/public_api_guard/components/title.api.md`. Every claim was checked against the source. The general approach follows the select baseline in `openspec/changes/archive/2026-10-21-document-select-baseline/`.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the directive, and every scenario can be checked by an existing test or by hand in the dev app.
- One place to diff against when title behaviour changes later.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- The behaviour of `kbqTooltip` that the directive inherits unchanged: rendering, positioning and fallbacks, the instant-show window, `Escape`, the one-visible-tooltip group, colors, modifiers and the other `kbqTooltip*` inputs. They belong to the tooltip capability.
- Which components provide `KBQ_TITLE_TEXT_REF` and which of their elements they hand over. That belongs to the specs of those components.
- Internals: class and method names, the measurement algorithm beyond its observable verdicts, change-detection details, CSS structure and design tokens.
- Changes to tests, docs or examples.

## Decisions

1. **The general decisions of the select baseline apply.** One capability at the flat path `title`, written in English, describing what ships with its quirks, holding only behaviour backed by a test or read directly in the source, and counting public inputs, getters, selectors, template reference names, overlay classes and ARIA attributes as contract.
2. **Only what the directive adds to the tooltip, or changes in it, is specified.** That is the truncation verdict, the measured elements, the content and how it follows changes, the fixed trigger, the `ignoreTooltipPointerEvents` default, the default placement priority, the precedence of the verdict over `kbqTooltipDisabled`, and the rule that repeated text does not describe the host. The last one is implemented in the tooltip trigger, but it exists for `kbq-title`, whose default content always repeats the host text. Duplicating inherited tooltip behaviour here would make every tooltip change a two-spec change.
3. **Truncation is specified by verdicts, not by the algorithm.** The scenarios name the widths the tests use (124 px against 124.4 px, 296 px against 255 px) so that each rule can be checked, but the way the directive measures (which properties it reads, the temporary element for a plain-text host) stays out, except for the guarantee that the DOM is left unchanged.
4. **The 100 ms intervals are part of the contract.** The resize debounce and the mutation throttle are what a consumer's own test has to wait for, and the unit tests advance the clock by exactly that much. The 400 ms enter delay is stated once, as the tooltip default.
5. **Quirks are specified as they ship.** Examples:
    - a click on a focusable host closes a tooltip that hovering opened;
    - mutations within 100 ms of the previous one are ignored;
    - a resize enables the tooltip but does not open it;
    - `kbqTooltipDisabled="false"` cannot force a tooltip for text that fits.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/title` updates `openspec/specs/title/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [Some requirements rest on the source rather than on a test] → tasks.md checks each of them by hand in `yarn run dev:title` before archiving. A mismatch is corrected in the delta, not in the code.
- [A defect gets recorded as intended behaviour] → Suspected defects stay out of the spec and are listed under Findings. Behaviour the spec does state can change later through `MODIFIED`.
- [Inherited tooltip behaviour changes under the title] → Requirements that depend on the tooltip trigger (the enter delay, the description rule, the pointer-events class) name the observable result, so a tooltip change that breaks them shows up in the title tests or in the hand checks.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The JSDoc of `KbqTitleDirective` says the tooltip hides on "a resize of the measured container". A resize closes it only when the text then fits; a resize that leaves the text truncated keeps it open.
2. The first sentence of `title.en.mdx` and `title.ru.mdx` says the tooltip appears when the content "is truncated with an ellipsis". A clip of a whole pixel or more counts without an ellipsis too, and the unit spec asserts it.
3. The "Accessibility" bullet of the docs says the tooltip opens on keyboard focus, but not that the host has to be focusable on its own. None of the five docs examples has a focusable host, so a keyboard user gets no tooltip in any of them.
4. The `Title` entry of `structure.ts` has `path: 'packages/components/core/title'`, so the docs link to the source points at the folder that holds only `KBQ_TITLE_TEXT_REF`, not at `packages/components/title`. The entry also sets `hasExamples: false`, while `examples.title.{en,ru}.mdx` exist as "documentation in progress" placeholders.
5. `TitleOverviewExample` carries a `field` property, an `onAddText()` method and a `KbqButtonModule` import that its template never uses, and a `wide` class that no rule styles.

**Suspected defects (from reading the code, not reproduced)**

1. The directive overrides `ngAfterViewInit` without calling the tooltip trigger's version, which is where a tooltip subscribes to the closing of a parent pop-up (`KBQ_PARENT_POPUP`, provided by `kbq-select` and `kbq-tree-select`). A `kbq-option kbq-title` tooltip that is open when the select panel closes may therefore stay open, anchored to a detached option.
2. Mutations are throttled without a trailing emission: a second change of the container content within 100 ms of the first is dropped, so an open tooltip may keep showing the earlier text until the next hover.
3. The default content is the `textContent` of the container. With several `#kbqTitleText` elements separated only by markup whitespace, which Angular removes by default, the texts run together: the multiple-text example probably shows `Status:A long value…` with no space after the colon.
4. The resize and mutation observers are bound once, in `ngAfterViewInit`, to the container resolved then. A `#kbqTitleContainer` rendered later, for example inside `@if`, is measured on hover but its resizes and mutations are not followed.
5. Until the first hover, keyboard focus, resize or mutation, `disabled` reads `false` even for text that fits. In a browser the first resize observation closes this gap after about 100 ms.
6. For a plain-text host whose whole-pixel widths show no overflow, which includes every such host whose text fits, the directive adds and removes a temporary element in the container to measure the text. That is a content mutation the directive observes itself, so each such hover probably runs one more overflow evaluation.

**Tests whose name and body disagree, or that cannot fail**

- "should enable but not open the tooltip when the content fits" asserts that `disabled` is `true`: the tooltip is not enabled.
- "should update disabled=true after debounceTime(100) on a container resize when not overflown" checks only after 100 ms and would pass without the debounce.
- "should open tooltip for overflown text with inline element" mocks the widths of the host, which is the measured element as in the plain case; the inline `<span>` plays no part.
- "should stop monitoring focus on destroy" passes on the teardown of the inherited tooltip trigger alone, whatever the directive does with its own focus subscription.

**Behaviour without a test.** The spec states these from the source:

- the `kbqTitle` export name and the `KbqTitleModule` re-export;
- the temporary measuring element being removed again;
- the exception for elements with a zero client width in the sibling-clip rule;
- no tooltip and no overlay pane for empty content;
- mutations being ignored for 100 ms after the one handled;
- a resize enabling the tooltip without opening it;
- `ignoreTooltipPointerEvents` set to `false`;
- the `aria-describedby` rule, which `tooltip.spec.ts` tests for `kbqTooltip` but no test exercises through `kbq-title`.
