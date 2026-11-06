# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are:

- `packages/components/sidepanel/`: the service, the ref, the config, the container and its template, the header, body, footer, actions and close directives, the styles where they decide layout, `sidepanel.spec.ts`, `e2e.ts` and `e2e.playwright-spec.ts`;
- the `sidepanel.{en,ru}.mdx` and `examples.sidepanel.{en,ru}.mdx` pages and the eight examples under `packages/docs-examples/components/sidepanel/`;
- the API golden file `tools/public_api_guard/components/sidepanel.api.md`;
- what the sidepanel takes from elsewhere: the state saving service and store, the locale overrides, the animation helpers and the overflow shadow in `packages/components/core`, the custom scrollbar, the `kbq-title` tooltip, and the CDK overlay (keyboard and outside-pointer dispatchers, backdrop, scroll strategies) and focus trap as installed (`@angular/cdk` 21.2.14).

Every claim in the spec was checked against that source, not taken from the docs or the test names.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the package, and every scenario can be checked by an existing test or by hand in the dev app.
- One place to diff against when sidepanel behaviour changes later.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Internals: the animation state names and transforms, the members of `KbqSidepanelContainerComponent` and `KBQ_SIDEPANEL_WITH_INDENT` (exported, but only the service uses them), timers and change-detection details.
- Styling and design tokens beyond the size presets, the top and bottom layout and the overflow shadows, which the docs describe as behaviour.
- `kbq-modal`, which shares much of this behaviour, and changes to tests, docs or examples.

## Decisions

1. **The general decisions follow the select baseline** (`openspec/changes/archive/2026-10-21-document-select-baseline/design.md`): one capability at the flat path `sidepanel`, matching the entry point; English; the spec describes what ships, quirks included; only behaviour confirmed by a test or read in the source goes in; public names, selectors, host classes consumers style or test against, ARIA attributes, thrown error messages and exported tokens count as contract. The requirements follow the order of the docs page: opening and configuration first, which the page does not cover, then structure, positions, modal mode, `disableClose`, non-modal mode, stacking, focus, accessibility, state saving, size and the examples page.
2. **CDK behaviour the sidepanel exposes counts as contract.** Escape reaches only the topmost overlay, a backdrop closes on a primary-button click only, the focus trap honours `cdkFocusInitial`, and the block scroll strategy pins the page. These come from the CDK, but a consumer sees them as sidepanel behaviour, and the docs promise most of them. Leaving them out was considered and rejected: it would drop the focus, Escape and scroll requirements that consumers rely on most. A CDK upgrade that changes one of them is therefore a sidepanel change and updates this spec.
3. **Stacking is described by what the user sees, not by state names.** The spec says "pushed back and partly visible" and "hidden" instead of naming the `lower` and `bottom-panel` states. Only the classes the tests and the e2e scenarios select on (`kbq-sidepanel-indent`, `kbq-sidepanel_nested`, `kbq-sidepanel-container_<position>`) are named.
4. **State saving is specified down to the stored value.** `KbqSidepanelState` is exported and the store is the application's, so `{ opened: boolean }` under the consumer's key is part of the contract, as is the difference between closing one sidepanel and closing a group.
5. **The empty-string close result goes in as it ships.** A bare `kbq-sidepanel-close` attribute sets the aliased input to `''`, so `afterClosed()` emits `''`. This follows from Angular's handling of static attributes rather than from a test, and the spec states it so that a fix shows up as a `MODIFIED` delta.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/sidepanel` updates `openspec/specs/sidepanel/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [Some requirements rest on the source, or on the CDK, rather than on a test] → tasks.md checks each of them by hand in `yarn run dev:sidepanel` before archiving. A mismatch is corrected in the spec, not in the code.
- [A defect gets recorded as intended behaviour] → Suspected defects stay out of the spec and are listed under Findings. The two quirks the spec does state — the empty-string close result and Escape not reaching a sidepanel under one with `disableClose` — can change later through `MODIFIED`.
- [Timing claims depend on the test environment] → jsdom has no Web Animations API, so the unit tests see every transition end right after its render. The requirements state order ("once the transition has ended", "never inside the `close()` call"), not durations.
- [The spec is long: 57 requirements, 94 scenarios] → It is grouped in the order of the docs page.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The keyboard table says Escape closes the sidepanel "if no data was changed in the sidepanel". The sidepanel tracks no changes: Escape closes it unless `disableClose` is set or the key's default action was already prevented.
2. "Focus is set on the first available element inside the sidepanel body." The built-in default is the first element Tab can reach in the whole panel, so the close button of a closeable header gets focus before anything in the body.
3. The examples page says every option but `disableClose` is "read once, when the sidepanel opens". `size`, `ariaLabel` and, for `aria-modal`, `trapFocus` feed host bindings of the container, which are read again on every change detection, so changing them through `ref.config` changes those parts of an open panel. This comes from reading the code and was not reproduced.
4. "How it works" names only the right and left edges. `top` and `bottom` exist in `KbqSidepanelPosition`, in the position select of the modal, non-modal and stacked examples, in the dev app and in the e2e scenarios, but the text never mentions them. They also do not say that the size presets do not apply there: a top or bottom panel spans the width and takes a third of the height, at least 400 px.
5. "Stacked panels" says that non-modal sidepanels stack with an offset. Modal sidepanels at the same position stack the same way: the indent strip does not depend on the backdrop, and the e2e "nested" scenario opens modal panels.
6. "Disable close on backdrop click" lists the backdrop and Escape. `disableClose` also blocks the indent strip and a click on a panel underneath, and it does not block the close buttons or the header close button. The page does not say either.
7. The JSDoc of `ariaLabel` says it is "used when no `kbq-sidepanel-header` names it and no `ariaLabelledBy` is given". The attribute is always written; it is ARIA's precedence of `aria-labelledby` that leaves it unused.
8. The golden file marks `open()`, `close()`, `position`, `size`, `backdropClass`, `KbqSidepanelPosition`, `KbqSidepanelSize` and `KbqSidepanelModule` as undocumented. The API tab has nothing to say about the main entry points.

**Suspected defects (from reading the code, not reproduced)**

1. The docs promise that a sidepanel closes "on a left mouse button click only". That holds for the backdrop and the indent strip. In a non-modal stack, though, the click on a panel underneath arrives through the CDK outside-pointer stream, which also carries middle-button and context-menu clicks, and the sidepanel filters it only by target. A right or middle click on the panel underneath then closes the panel above it.
2. Closing a panel in the middle of a same-position stack of three or more leaves the panel under it hidden, while the top panel keeps its indent strip, which then exposes an invisible panel. The panel reappears only when the top one closes. The lookups that promote the panel underneath index from the top of the stack, not from the panel that closed.
3. A `backdropClass` with several space-separated classes, or an empty one, makes `open()` throw from `classList.add`. By then the overlay, the backdrop and the scroll block are already attached, and the panel never enters `openedSidepanels`, so nothing disposes of them.
4. The selectors `kbqSidepanelBody`, `kbqSidepanelFooter` and `kbqSidepanelActions` have no brackets. They match elements of those names, not attributes, so `<div kbqSidepanelBody>` gets none of the body behaviour.
5. A close button without a value, including the one in a closeable header, closes with `''` instead of `undefined` (spec: "Close button without a value").
6. When the first focus-trapping sidepanel opens, the page is hidden from assistive technology by marking the overlay container's siblings of that moment. Elements appended to the page later stay reachable while the panel is open.
7. When a header that named the sidepanel is removed, `aria-labelledby` keeps pointing at its missing title. A header rendered after a first one cannot rename the panel.
8. Backdrops become transparent only within a same-position stack. A modal sidepanel opened at another edge over a modal one leaves both backdrops visible, so the page is dimmed twice.

**Tests whose name and body disagree, or that cannot fail**

- "should fall back to the root injector when no custom injector is provided" only checks that `instance` is set. It does not look at the injector.
- "should close the sidepanel underneath when a same-position stack is clicked through": the code closes the panel above the click, while the name reads as if the lower one closes. The test only counts containers, so it cannot tell which panel closed.
- "should close sidepanel on indent click" counts indent strips. Closing the lower panel instead of the top one would remove the strip too.
- "should show only the topmost backdrop when multiple sidepanels are open" checks that all but one backdrop are transparent, not that the visible one is the topmost.
- "should set the proper animation states" and "should not animate a closing sidepanel back into view when closing all sidepanels" assert internal state names, so they break on a rename without any visible change.

**Behaviour without a test.** The spec states these from the source, or from the CDK source:

- `KBQ_SIDEPANEL_DEFAULT_OPTIONS`;
- the text of the duplicate-id error (the test only checks that `open()` throws);
- the generated id format, the container's `id` attribute and its `tabindex="-1"`;
- `ref.instance` staying unset for a template sidepanel;
- header title truncation, its class, its tooltip and `truncateText: false`;
- the close button's localized name and `[localeOverrides]` on the header;
- the empty-string result of a close button without a value;
- a close button keeping an author-set `type`, and the directive applying to `button` elements only;
- `align` on `kbq-sidepanel-actions`;
- the 400 px width of a small sidepanel (medium and large are backed by screenshots);
- `kbq-animations-disabled` and the events under reduced motion;
- right and middle clicks on the backdrop not closing the panel;
- Escape reaching only the topmost sidepanel;
- `close()` and the close buttons ignoring `disableClose`;
- a click elsewhere on the page not closing a non-modal sidepanel;
- lower panels of a stack being pushed back and hidden, beyond the transparency of their backdrops;
- `closeAll()` reaching sidepanels opened through other service instances;
- focus going to the first element Tab can reach when nothing is marked `cdkFocusInitial`, and focus returning before `afterClosed()` emits;
- Shift+Tab inside the focus trap, and `trapFocus` given explicitly;
- `script`, `style` and `aria-live` elements left visible to assistive technology, and earlier `aria-hidden` values restored;
- `wasOpen('')` returning `false`.
