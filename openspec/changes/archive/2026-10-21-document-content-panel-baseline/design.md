# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are `packages/components/content-panel/` (`content-panel.ts`, the styles where they set layout or motion, `content-panel.spec.ts`, `e2e.ts` and `e2e.playwright-spec.ts`), the `content-panel.{en,ru}.mdx` and `examples.content-panel.{en,ru}.mdx` pages, the two docs examples under `packages/docs-examples/components/content-panel/`, the API golden file `tools/public_api_guard/components/content-panel.api.md`, and the code the panel relies on: the state-saving directive, store, key resolver and service in `core/state-saving`, `KbqOverflowShadowContainer`, `KbqLocaleOverridesDirective` and the `a11y` locale strings, `kbqAnimationsDisabled()` in `core`, and `KbqResizer` from `@koobiq/components/resizer`. The `E2eAccordionContentPanel` scenario in `packages/components/accordion` was read because it is the only test that relies on panel content existing before the panel opens. Every claim was checked against the source. The general approach follows the archived `document-select-baseline` change.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the component, and every scenario can be checked by an existing test or by hand in the dev app.
- One place to diff against when content panel behaviour changes later.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Internals: class and method names, the template's wrapper classes, timers other than the exported or documented ones, change-detection details, CSS structure and design tokens.
- The shared state-saving rules themselves: the store and its key prefix, expiry, the key derivation algorithm and the dev-mode warnings belong to `core` and are referenced, not restated.
- `kbq-sidepanel`, `kbq-splitter`, the resizer and scrollbar entry points beyond what the panel exposes, and deprecated APIs.
- Changes to tests, docs or examples.

## Decisions

The general decisions of the select baseline apply unchanged: one capability at a flat path named after the entry point, English, quirks documented as they ship, only confirmed behaviour in the spec, and the same definition of what counts as contract. Specific to the content panel:

1. **One capability for all eight declarations.** The container, `kbq-content-panel`, the aside, the header with its title and actions, the body and the footer only work together: the header reads the container and the panel, and the footer reads the panel. Splitting them into capabilities was rejected for the same reason the select was kept whole.
2. **State saving is described from the panel's side.** The spec says what the container stores (`KbqContentPanelState`), when it reads and writes, which input owns which part of the state, and how `clearSavedState()`, `hasSavedState` and the service registration behave. How the store keeps an entry and how a key is derived are covered by one scenario each and otherwise left to `core`. Copying the core rules was rejected: they would drift from the shared code that every persisting component uses.
3. **Members marked `@docs-private` are not contract,** even though they are in the typings: `KbqContentPanel.bodyOverflow`, `KbqContentPanelBody.scrollbar` and `KbqContentPanelBody.overflowContainer`. The panel's own `e2e.ts` calls `scrollbar()`, and the unit spec queries the template classes `kbq-content-panel-container__panel` and `kbq-content-panel-header__close-button`; the spec talks about "the panel" and "the close button" instead. The host classes and `kbq-content-panel-container__opened` are contract.
4. **Motion is described at the level a consumer controls.** That the panel slides and the content follows, that a resize does not animate, and the three switches that turn motion off are contract. Durations and easing curves are styling.
5. **Quirks the spec states as they ship.** Examples:
    - a one-way `[opened]` that ignores `openedChange` cannot reopen the panel by assigning the same value again;
    - `openedChange` stays silent for input changes and restored state;
    - changes made through the inputs are not written to the store;
    - a change of `width` discards a dragged width;
    - focus is never moved, and the resize handle cannot be reached from the keyboard.

    Each fix belongs in its own change, with a `MODIFIED` delta.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/content-panel` updates `openspec/specs/content-panel/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [Many requirements rest on the source rather than on a test: the unit suite has 23 tests (27 with the parametrized cases) and the e2e spec 4] → tasks.md checks each of them by hand in `yarn run dev:content-panel` before archiving. A mismatch is corrected in the delta, not in the code.
- [A defect gets recorded as intended behaviour] → Suspected defects stay out of the spec and are listed under Findings. Behaviour the spec does state can change later through `MODIFIED`.
- [State saving makes hand checks depend on what an earlier visit left in `localStorage`] → tasks.md has the checker remove the `kbq.state.` entries before each state-saving check.
- [State saving depends on `core`] → A change to the shared state-saving code that alters what the panel does still needs a delta here, even when `content-panel.ts` is untouched.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The JSDoc of `disableClose` says the panel "can not be closed by clicking on the close button or pressing the ESCAPE key". It removes the close button rather than disabling it, and `close()`, `toggle()` and the `opened` input still close the panel.
2. The JSDoc of `openedChange` says it emits "when the content panel opened state is changed". It does not emit when the state comes from the `opened` input or from restored state.
3. The JSDoc of `saveState()` says it is "called whenever the panel is opened, closed or resized". It is not called when the panel opens or closes through the `opened` input, or when the `width` input changes.
4. The "Keyboard interaction" section says Escape closes the panel "by default". It does so only while focus is inside the container, and `disableClose` turns it off too, which the section does not say.
5. The "State Saving" section says `width` "is always restored" and "the persisted one wins over it". That holds on initialization only: a later change of the `width` input replaces the restored or dragged width, and the new width is not written.
6. `disableCloseByEscape` has no `@default`. Its default is read from `disableClose()` once, while the container is constructed, so it is always `false` and does not follow `disableClose`. There is no visible effect, because Escape checks both inputs.
7. The overview page opens with `KbqContentPanel`, but the opened state, the widths, state saving and Escape all live on `kbq-content-panel-container`.
8. These have no place in the docs pages:
    - `[(opened)]`, `openedChange` and `isOpened`;
    - `disableClose` and `disableResizer`;
    - drag resizing itself, which only appears inside the state-saving section;
    - the units and defaults of the width inputs (pixels; 480, 640, 800);
    - `saveState()` and `hasSavedState`;
    - the aside, the header actions, the extra header content and the footer;
    - `localeOverrides` on the header.
9. `examples.content-panel.{en,ru}.mdx` are "Documentation in progress" stubs, and `structure.ts` sets `hasExamples: false`, so the pages exist but are never routed.

**Suspected defects (from reading the code, not reproduced)**

1. The content margin is computed from the unclamped width. When `width` lies outside `minWidth` to `maxWidth`, or a double click resets to such a `width`, CSS clamps the panel but the main content keeps a margin of the unclamped width plus 16 px, leaving a gap or an overlap.
2. A container that is not attached to the document when it initializes, such as one inside an overlay that attaches later, never restores or writes its state, even with an explicit `stateSavingKey`. The container skips the read before the shared directive can warn, so the core warning that suggests a key never appears.
3. Turning `useStateSaving` on after initialization never starts persisting: nothing was read, so the shared directive refuses every write, and a key change does not trigger a read either. The container has to be created again.
4. `clearSavedState()` does nothing while `useStateSaving` is `false`, so the entry a panel left behind cannot be removed through the panel once state saving is turned off.
5. The panel exposes nothing to assistive technology: it has no role and no accessible name, and the open state is not announced. Opening does not move focus into the panel, and closing with the close button drops focus to `<body>` instead of returning it to where the panel was opened. No axe check renders the panel.
6. The resize handle has no `role="separator"`, no `tabindex` and no keyboard alternative, so the width cannot be changed without a pointer.
7. An application that tracks the state through `(openedChange)` alone, without binding `opened`, is not told when a restored state opens the panel.
8. Layout is fixed to the right edge (`right: 0`, `margin-right`, a resizer that grows to the left). Nothing adapts to `dir="rtl"`, and there is no RTL screenshot.

**Tests whose name and body disagree, or that cannot fail**

- "should open/close panel by two-way binding" sets the host's model and reads the same model back. It never looks at the container or the DOM, so it cannot fail.
- "restores the width but not the opened state while the application drives it" asserts only `isOpened()`; the width is never checked.
- "should open panel by KbqContentPanelContainer instance" repeats the second half of "should open/close panel by KbqContentPanelContainer instance".
- The three Escape tests share one module-level `KeyboardEvent` that neither bubbles nor can be cancelled, dispatched on the container itself. They cannot observe the `preventDefault()` and `stopPropagation()` the container calls.
- The three e2e "overflow shadow" tests assert only that a shadow appears, never that it is absent at the top or the bottom.

**Behaviour without a test.** The spec states these from the source:

- the projection order, the dropped loose content of `kbq-content-panel` and the extra header row;
- the content margin and the panel position (seen only in the `01-light` and `01-dark` screenshots);
- panel content existing before the first open and surviving a close (relied on by `E2eAccordionContentPanel`, not asserted by the panel's own tests);
- `kbq-content-panel-container__opened`, the export names and the no-provider error for a header or footer outside its parents;
- `openedChange` staying silent for unchanged state, input changes and restores, and local changes outlasting an unchanged binding;
- `close()` and `toggle()` closing the panel despite `disableClose`, and the close button's `type="button"`;
- focus not being moved on open or close;
- the defaults of `minWidth` and `maxWidth`, a change of `width` after initialization (exercised but not asserted by `E2eAccordionContentPanel`), drag resizing and its bounds, `disableResizer`, the double-click reset and the handle not being focusable;
- `KBQ_STATE_SAVING_ENABLED` as the default of `useStateSaving`, the 300 ms write after a drag, the immediate write after a reset, inputs not being written, clamping a restored width to `minWidth`, `clearSavedState()` and `hasSavedState` while state saving is off, a key change and a detached container;
- Escape from inside the panel, `preventDefault()` and `stopPropagation()`, and Escape on a closed panel;
- the body filling the space between header and footer, and the absence of shadows at the edges;
- the motion and its three switches;
- the close button's `aria-label` and `localeOverrides`.
