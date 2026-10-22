# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are:

- `packages/components/ellipsis-center/`: the directive, its stylesheet, the unit spec, `e2e.ts` and the Playwright spec, and the `ellipsis-center.{en,ru}.mdx` and `examples.ellipsis-center.{en,ru}.mdx` pages;
- the API golden file `tools/public_api_guard/components/ellipsis-center.api.md`;
- `KbqTooltipTrigger` in `packages/components/tooltip/tooltip.component.ts` and `KbqPopUpTrigger` in `packages/components/core/pop-up/pop-up-trigger.ts`, which the directive extends;
- the consumers: the file upload components with their unit and e2e specs, and the `breadcrumbs-truncate-center-items` docs example;
- `tools/vitest/setup-angular.ts`, for what jsdom can and cannot show.

There is no `packages/docs-examples/components/ellipsis-center/` folder and no `dev:ellipsis-center` script. Every claim in the spec was checked against the source.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the directive, and every scenario can be checked by an existing test or by hand.
- One place to diff against when the behaviour of the directive changes later.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Restating the tooltip: delays, placements, triggers, `Escape`, the single-visible-tooltip group and the rest of what the directive inherits unchanged belong to a tooltip spec.
- Internals: private members, the debounce pipeline, change detection calls, the style loader component.
- Changes to tests, docs or examples.

## Decisions

The general decisions follow the select baseline (`openspec/changes/archive/2026-10-21-document-select-baseline/design.md`): one capability at a flat path named after the entry point, English, quirks described as they ship, and only behaviour confirmed by a test or read in the source. The decisions below are specific to this directive.

1. **The tooltip is covered only where the directive changes it.** The spec states what the directive sets or overrides: the content, when the tooltip is enabled, how `kbqTooltipDisabled` folds into that, the `ignoreTooltipPointerEvents` default and the `aria-describedby` outcome. Everything else is one requirement saying the inherited inputs and outputs are accepted. Restating the tooltip contract here was rejected: it would have to change with every tooltip change, and it belongs to a tooltip spec.
2. **What counts as contract here.** In addition to the select list (inputs, outputs, selectors, host classes, ARIA):
    - the classes of the two halves, `kbq-ellipsis-center_data-text-start` and `kbq-ellipsis-center_data-text-end`, because this directive's e2e spec and the file upload e2e spec locate the halves by them;
    - the layout rules the directive loads, although styling is otherwise out of scope, because the split depends on them and the Playwright spec asserts them;
    - the public `kbqEllipsisCenter` setter, listed in the API golden file without `@docs-private`, so writing the text from code is in.

    `refresh()` and the `kbqEllipsisCenterInput` member are `@docs-private` and stay out.

3. **The tail length is stated as a formula.** `round(W / 2 / g)` with the clamp is the only precise way to say what `charWidth` does, and the unit tests assert on its results. "About half the host" was rejected as untestable. A change of the algorithm then has to come with a `MODIFIED` delta, which is intended.
4. **The zero-delay timer is part of the contract.** Consumers' tests depend on it: the unit tests advance timers by 0 ms, and the file upload e2e spec polls because the split lands a timer task after the row renders.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/ellipsis-center` updates `openspec/specs/ellipsis-center/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [Some requirements rest on the source rather than on a test, and jsdom lays nothing out] → tasks.md checks them by hand in the e2e app, the breadcrumbs dev app and the file upload dev app, since there is no dev app for the directive. A mismatch is corrected in the delta, not in the code.
- [A defect gets recorded as intended behaviour] → Suspected defects are listed under Findings. The quirks the spec does state (option changes waiting for the next split, `debounceInterval` read once) can change later through `MODIFIED`.
- [The formula and the timer are close to the implementation] → Accepted, see Decisions 3 and 4. A refactor that keeps them needs no spec change.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The constructor JSDoc of `KbqTooltipTrigger` says `KbqEllipsisCenterDirective` skips `super.ngAfterViewInit()`. It calls it, so its tooltip does close when an enclosing pop-up closes.
2. The JSDoc of `minVisibleLength` says a shorter text is cut "by the host's own `text-overflow`". The host has none; the start half carries `text-overflow: ellipsis`. The comment in the Playwright spec repeats this.
3. The overview says the split is recalculated "when the element is resized". Only a change of the host's width does it; a change of the text's rendered width alone does not. The overview also does not say that changing `minVisibleLength` or `charWidth` waits for the next split, or that `debounceInterval` is read once.
4. The overview does not mention `charWidth`, `ignoreTooltipPointerEvents` and its `true` default, or that the tooltip inputs such as `kbqPlacementPriority` are accepted on the host. The breadcrumbs example relies on the last one.
5. `examples.ellipsis-center.{en,ru}.mdx` are "documentation in progress" placeholders. `structure.ts` sets `hasExamples: false`, so they are not routed, and there are no docs examples for the directive; the overview has a snippet but no live example.
6. The main input has no description in the API: the `kbqEllipsisCenter` setter is `(undocumented)` in the golden file, and the input member it is bound through is `@docs-private`.

**Suspected defects (from reading the code, not reproduced)**

1. A change of the text's rendered width that leaves the host's width unchanged, typically a web font swapping in after the first render, keeps the split and the tooltip state measured with the old metrics. The tail can then be cut, or a text that now overflows keeps its tooltip disabled. The file upload e2e works around it by loading fonts first.
2. `minVisibleLength` and `charWidth` have no `numberAttribute` transform, unlike `debounceInterval`. A static `minVisibleLength="10"` passes a string, which works at run time only through JavaScript coercion and is rejected by strict template type-checking.
3. Changing `minVisibleLength` or `charWidth` alone does not split the text again, and a later `debounceInterval` is never applied. The spec records both as they ship.
4. Content already inside the host is kept beside the halves. It takes width the tail length does not account for, so the end half can overflow the host. The host's text then also differs from the tooltip text, so the open tooltip gets linked through `aria-describedby`.
5. `ignoreTooltipPointerEvents` defaults to `true`, so the tooltip cannot be hovered. The tooltip's own JSDoc ties its hoverable default to WCAG 1.4.13 (content on hover): at high magnification the full text can disappear as the pointer moves towards it. Together with a host that is not focusable, sighted keyboard users have no way to read the full text. The default is deliberate per its JSDoc but worth an accessibility review.

**Tests whose name and body disagree, or that cannot fail**

- "should initialize with input value and call refresh" checks neither the initialization nor a call to `refresh()`. It asserts that the protected `content` follows a changed binding, read through bracket access.
- "should let clicks reach whatever the hint floats over" only asserts that `ignoreTooltipPointerEvents()` returns `true`. It never opens the tooltip, checks the pane class or clicks through it.
- In "should properly split content on refresh", the last assertion (`start.length + end.length` at most the text length) cannot fail once `start + end` equals the text.
- Every unit test drives the split through the `@docs-private` `refresh()`, not through a text change or a resize. `ResizeObserver` is a no-op stub in `tools/vitest/setup-angular.ts`, so no unit test reaches the resize path.

**Behaviour without a test.** The spec states these from the source:

- other children of the host being kept, and a static `kbqEllipsisCenter` attribute value;
- writing the text from code through the `kbqEllipsisCenter` setter;
- the full text in the start half before the timer runs, and a newer render cancelling a pending measurement;
- text that fits staying whole in the start half with an empty end half (tests only check the tooltip state);
- a `charWidth` larger than the measured width shortening the tail;
- `minVisibleLength` and `charWidth` changes waiting for the next split;
- the `cdk-overlay-pane_ignore-pointer-events` class on the tooltip pane, and `false` making it hoverable;
- the inherited tooltip inputs and outputs on this host;
- re-splitting on a width change, no re-split on a height-only change, and the `debounceInterval` value, its string form and its single read;
- no `aria-describedby` on the host while the tooltip is open (the tooltip spec covers the general rule, not this directive);
- no `tabindex` or `role` on the host, and the tooltip opening on keyboard focus of a focusable host.
