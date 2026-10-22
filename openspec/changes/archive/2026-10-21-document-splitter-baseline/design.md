# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are:

- `packages/components/splitter/`: `splitter.ts`, `splitter.module.ts`, `splitter.scss`, the unit spec `splitter.spec.ts`, the e2e scenarios in `e2e.ts` and the Playwright spec `e2e.playwright-spec.ts`;
- the `splitter.{en,ru}.mdx` pages; `examples.splitter.{en,ru}.mdx` are "Documentation in progress" stubs;
- the eight examples under `packages/docs-examples/components/splitter/`, which the dev app `yarn run dev:splitter` embeds;
- the API golden file `tools/public_api_guard/components/splitter.api.md`;
- the code the splitter relies on: `kbqResizer` and `kbqResizable` from `@koobiq/components/resizer` (pointer handling, pointer capture, the cursor), and the a11y locale section, `KBQ_WINDOW` and `hasModifierKey` from `@koobiq/components/core`.

Every requirement was checked against the source. `openspec/specs/` holds only the `select` capability, and the general approach of this change follows the select baseline.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the component, and every scenario can be checked by an existing test or by hand in the dev app.
- One place to diff against when splitter behaviour changes later.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- The sizing arithmetic as code: the exported and `@internal` helpers, the `KbqSplitterGroup` handler methods the unit tests call, and the order in which limits, collapse and snapping are applied, beyond the sizes a user sees.
- Visual styling: line, handle and focus colors, widths and design tokens.
- `@koobiq/components/splitter/deprecated` and the resizer directives used on their own.
- Changes to tests, docs or examples.

## Decisions

1. **The decisions of the select baseline apply.** One capability at a flat path matching the entry point, English, quirks documented as they ship, only confirmed behaviour in the spec, and suspected defects listed under Findings instead.
2. **One capability for the splitter and its panel.** `kbq-splitter-panel` only works inside `kbq-splitter`, both ship in one entry point, and most behaviour — sizes, snapping, collapsing, the keyboard — involves both. Separate `splitter` and `splitter-panel` capabilities were considered and rejected: nearly every change would touch both.
3. **The resizer appears only through what the splitter exposes.** The primary-button rule, pointer capture and the cursor on the page body come from `kbqResizer`. The spec states what a user sees on a separator — which button starts a drag, that the boundary follows the pointer, which cursor shows — and does not describe the resizer. A resizer change that alters any of it updates this spec.
4. **Scenarios use pixels of a measured splitter.** Track sizes are percentages, but users and tests reason in pixels. Scenarios state the splitter's size, usually 600 px like the unit and e2e fixtures, so their numbers are whole pixels.
5. **What counts as contract.** These count:
    - the inputs and models of both components, with `layoutChange` and `collapsedChange`;
    - `KBQ_SPLITTER_OPTIONS` and `kbqSplitterOptionsProvider`;
    - the selectors, the `exportAs` names and `KbqSplitterModule`;
    - the host classes `kbq-splitter_vertical`, `kbq-splitter_disabled`, `kbq-splitter_dragging`, `kbq-splitter_transparent`, `kbq-splitter_handle` and `kbq-splitter-panel_collapsed`, and the `kbq-splitter-panel__content` and `kbq-splitter-panel__separator` elements;
    - the ARIA attributes and the localized separator name;
    - the development-mode warning for unsupported sizes.

    Style rules count only where a consumer meets them as behaviour and a test asserts them, such as the column flex content area and the invisible line of the `transparent` appearance. The `@docs-private` members (`KBQ_SPLITTER`, `KbqSplitterGroup`, `KbqSplitterPanelRef`, the `handle*` methods) and the exported helpers `resizeSplitterSizesAt` and `KbqSplitterSnapPoint` do not count (see Findings).

6. **Keyboard requirements name the panel before the separator.** Home, End and Enter act on that panel only. The spec says so rather than "the panel", which the docs page leaves open.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/splitter` updates `openspec/specs/splitter/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [Some requirements rest on the source rather than on a test] → tasks.md checks them in `yarn run dev:splitter`. What the dev app cannot show — it has no direction or locale switch, and no example sets `id` or `separatorAriaLabel` — is checked by reading the source. A mismatch is corrected in the delta, not in the code.
- [A defect gets recorded as intended behaviour] → Enter acting only on the leading panel and the nested options provider ship as they are and are stated in the spec. Both are also listed under Findings, so a fix lands as a `MODIFIED` delta.
- [Scenario numbers depend on the fixture] → A scenario's pixel values hold for the splitter size it states, with no padding or border on the splitter.
- [The spec is long: 50 requirements] → It is grouped in the order of the docs page: structure and drag, appearance and options, orientation, disabled state, sizes and constraints, the `layout` binding, snapping, collapsing, nesting, keyboard, double-click, accessibility.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The "Collapsed panel" section in both languages and the JSDoc of `collapsed` say that a panel collapsed to `0` leaves no separator to restore it. The separator stays rendered and in the tab order on the splitter's edge, and the inner half of its hit area still starts a drag: the e2e "nested in a collapsed layout" test grabs it. When the collapsed panel is the one before that separator, Enter on it expands the panel.
2. The English "Collapsed panel" section says pulling past `minSize` collapses the panel. The Russian page and the JSDoc of `collapsible` give the actual rule: past half of `minSize`.
3. The keyboard table says Enter "collapses and expands the panel" and Home collapses a panel at its minimum, without saying which panel. Both act only on the panel before the separator (see suspected defect 1).
4. The double-click row says the second double-click sets the minimum. Whenever `layout` is `null`, the first double-click already does that: nothing has been resized yet, or only Enter or the host changed the collapsed state.
5. The JSDoc of `layout` calls it "sizes of the panels". The model can differ from what is shown:
    - a collapsed panel's entry holds the size it returns to, not its strip;
    - a layout written by the host is shown fitted to the limits, but the bound value is not updated.
6. The JSDoc of `KbqSplitterGroup.resizerDirection` describes "the separator of the panel at `index`". The member is a signal and takes no index.
7. The docs page says `kbqSplitterOptionsProvider` sets defaults "for the whole application or for one injector". It does not say that a nested provider drops the keys of the outer one (see suspected defect 2).
8. `examples.splitter.{en,ru}.mdx` are "Documentation in progress" stubs. `structure.ts` sets `hasExamples: false`, so no route reaches them.

**Suspected defects (from reading the code, not reproduced)**

1. Enter, Home and End act only on the panel before the separator. A collapsible panel that is the last one, or that comes after its separator, therefore cannot be collapsed or expanded from the keyboard. Once a drag or the host collapses it, a keyboard user cannot get it back. The Terminal panel of the `splitter-collapsible` example is such a panel.
2. `kbqSplitterOptionsProvider` spreads the given keys over the built-in defaults, not over the options already in scope. So a component that provides `{ snapTolerance: 64 }` silently resets an application-wide `appearance: 'handle'` to `divider` for its subtree.
3. Only separators handle F6 and Shift+F6. Once focus is on a panel, F6 does nothing, so keyboard users cannot cycle through the panes, and there is no way back from a panel to the separators other than Tab.
4. Nothing relates `collapsedSize` to `minSize`:
    - a collapsible panel without `minSize` has its midpoint at `0`, so a drag collapses it only once the pointer passes the panel's far edge;
    - a `collapsedSize` larger than `minSize` makes collapsing grow the panel, and Home does the same.
5. `resizeSplitterSizesAt` and `KbqSplitterSnapPoint` are in the public API golden file without `@internal` or `@docs-private`, unlike their sibling helpers `resolveSplitterSize`, `fitSplitterSizes` and `snapSplitterSize`. `KbqSplitterSnapPoint` is used only by the `@internal` `snapSplitterSize`. This looks like unintended public surface, and removing it later will be a breaking change.

**Tests whose name and body disagree, or that cannot fail**

- "should report the room the boundary still has as the separator value range": the values report the room of the panel before the separator, not of the boundary, as the next test, "should report the pane it controls, not the boundary", states. In this two-panel fixture the two coincide, so the test would also pass if the values reported the boundary.
- "should keep a track below the container when the minimums cannot fit" asserts three 250 px tracks in a 600 px splitter, which overflow the container rather than stay below it.
- "should move focus between panels on F6" dispatches Shift+F6 on the separator after focus has already moved to the panel. A user pressing Shift+F6 there gets nothing (suspected defect 3).

**Behaviour without a test.** The spec states these from the source:

- a panel inside a wrapper element being left out and rendering no separator;
- pointer drags and the `w-resize` / `e-resize` cursors in right-to-left layout, and the `n-resize` / `s-resize` cursors;
- `kbq-splitter_dragging` and the panel content ignoring the pointer during a drag;
- the separator values before the first measurement, and drags and keys doing nothing in that state;
- equal tracks on the server;
- re-measuring when the orientation changes;
- a nested `kbqSplitterOptionsProvider` falling back to the built-in defaults;
- no warning in production builds;
- a `maxSize` below the `minSize`;
- the values `layoutChange` carries after a drag or a key press (only indirectly, through the double-click test);
- a host-supplied layout not being written back after fitting;
- `minSize` and `maxSize` acting as snap points;
- ties between the snap points of the two panels;
- a drag released with a panel collapsed not snapping;
- keyboard resizing not snapping;
- panels further out never collapsing by drag;
- `kbq-splitter-panel_collapsed`;
- End expanding a collapsed collapsible panel;
- Home, End, Enter and double-click being ignored while disabled;
- Up and Down Arrow in a vertical splitter;
- modified key presses passing through;
- `separatorAriaLabel`;
- the separator name following a locale change;
- a custom panel `id`;
- `KbqSplitterModule` and the `exportAs` names.
