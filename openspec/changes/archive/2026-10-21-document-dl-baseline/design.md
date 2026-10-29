# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are `packages/components/dl/` (the component, its stylesheet, the unit spec, `e2e.ts` and the Playwright spec), the `kbqResizer` and `kbqResizable` directives in `packages/components/resizer` that drive the separator, the number coercion, the locale overrides directive and the `a11y` locale section in `packages/components/core`, the docs examples under `packages/docs-examples/components/dl/`, the `dl.{en,ru}.mdx` pages, and the API golden file `tools/public_api_guard/components/dl.api.md`. Every claim was checked against the source before going into the spec. The select baseline in `openspec/specs/select/spec.md` sets the pattern this change follows.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the component, and every scenario can be checked by an existing test or by hand.
- One place to diff against when description list behaviour changes later.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Internals: class and member names, the debounce and resize-observer wiring, change-detection details, CSS structure and design tokens beyond the layout a consumer relies on.
- The `kbqResizer` and `kbqResizable` directives as components of their own, and every other component.
- Changes to tests, docs or examples.

## Decisions

1. **The general decisions follow the select baseline.** One capability at the flat path of the entry point (`dl`), English, the spec describes what ships with its quirks, only confirmed behaviour goes in, and suspected defects stay in Findings. Only the decisions specific to the description list follow.
2. **`kbq-dt` and `kbq-dd` belong to the `dl` capability.** They have no inputs and no behaviour without the list, and they ship in the same entry point and module. Separate capabilities would hold one requirement each.
3. **Layout counts as contract here.** The list is a layout component: the column ratio, the wide and vertical layouts and long-text wrapping are what a consumer uses it for, so they are stated as requirements even though they come from the stylesheet. Colors, typography and spacing tokens stay out.
4. **What counts as contract.** On top of the select list (public inputs, outputs and selectors, ARIA, locale keys), these count:
    - the host classes a consumer styles or tests against: `kbq-dl_vertical`, `kbq-dl_wide`, `kbq-dl_resizable`, `kbq-dl_resized` and the four alignment classes;
    - the custom property `--kbq-description-list-dt-min-width`, which a unit test asserts;
    - the 400 px default breakpoint, the 8 px keyboard step and the 100 ms measurement delay, because a user can see each of them.

    The separator's internal class names and the protected members listed in the golden file do not count.

5. **Separator behaviour that `kbqResizer` provides is stated once, as the list's.** The body cursor during a drag, the primary-button rule and pointer capture are implemented by the resizer, but a consumer of the list sees them only through its separator, and the list's own tests assert the cursor. A later change to the resizer that alters them updates this spec too.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/dl` updates `openspec/specs/dl/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [A change to `kbqResizer` silently changes the list] → Decision 5 names the requirements that rest on it: "Resizing with a pointer" and "Cursor while dragging".
- [Some requirements rest on the source rather than on a test] → tasks.md checks each of them by hand before archiving. A mismatch is corrected in the delta, not in the code.
- [Layout requirements rest on a screenshot test] → The column ratio, wide, vertical and alignment requirements are backed only by the `E2eDlStates` screenshot, which shows a layout change but not which rule broke.
- [A defect gets recorded as intended behaviour] → Suspected defects stay out of the spec and are listed under Findings. Behaviour the spec does state can change later through `MODIFIED`.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The "Small (adaptive)" section shows `dl-small`, which is the `dl-overview` example under another name: nothing in it is smaller.
2. The English page shows four examples (`dl-overview`, `dl-small`, `dl-horizontal-overview`, `dl-vertical-overview`) whose terms and descriptions are in Russian.
3. The overview page leaves out:
    - `verticalBreakpoint`, its 400 px default, and the switch happening at or below it, about 100 ms after render;
    - `verticalAlign` and `horizontalAlign`;
    - the keyboard (Home, End, arrows) and the double-click on the separator;
    - `resizerAriaLabel` and `[localeOverrides]`;
    - that unset minimums default to the first term's rendered width, so by default the term column can only grow, and that `ddMinWidth` also defaults to the term's width, not a description's;
    - that `dtWidth` sets a fixed term width without `resizable`.
4. The JSDoc of `dtWidth` says a drag or a double-click sets it. The keyboard and the clamps after a resize or a minimum change set it too, and emit `dtWidthChange`.
5. The JSDoc of `wide` calls it "the wide two-column layout". The default layout also shows two columns; `wide` makes them equal.
6. `KbqDlComponent`, `KbqDtComponent`, `KbqDdComponent` and `KbqDlModule` have no JSDoc. The protected getters `maxDtWidth` and `currentDtWidth` lack the `@docs-private` the other protected members carry, so they appear in the golden file as `(undocumented)`.
7. `examples.dl.en.mdx` and `examples.dl.ru.mdx` are "documentation in progress" placeholders that no route shows: `structure.ts` sets `hasExamples: false`.

**Suspected defects (from reading the code, not reproduced)**

1. `kbq-dl`, `kbq-dt` and `kbq-dd` carry no role, and they are not native `dl`, `dt` and `dd` elements. Assistive technology gets a flat run of text with no term–description relation (WCAG 1.3.1).
2. Restoring the default column ratio is only possible with a double-click. The keyboard reaches the minimum and the maximum but has no way to set `dtWidth` back to `null` (WCAG 2.1.1).
3. A `dtWidth` bound after the first measurement is not clamped when it arrives. It is clamped only at the next change of the list's size, which a reflow of its height may or may not cause, or of a minimum. Until then the grid column takes the raw value while the separator is held at the bound, and `aria-valuenow` reports the separator, not the column.
4. A drag writes the raw pointer width onto the separator's track. After a drag that ended past a bound, a later lower minimum or wider list can leave the separator away from the column border until the width changes again.
5. The default minimums are measured once, right after the first render, from the first `kbq-dt`:
    - a list first rendered hidden, or with terms that arrive later, keeps a minimum of 0;
    - a list first rendered with `vertical` true measures a full-width term, so when it later turns horizontal and resizable, the term column takes the whole row.
6. The second double-click sets the `col-resize` cursor without checking the bounds. When there is no room, or when the default minimum equals the resting width, the cursor disagrees with the "Separator cursor" rules until the next resize.
7. An unparsable `verticalBreakpoint` becomes `NaN`, so the automatic layout always stays horizontal.
8. A narrow list in automatic mode renders horizontally for its first 100 ms and then jumps to the vertical layout. On the server it is always horizontal, so a hydrated narrow list shifts layout. The spec states this as shipped.

**Tests whose name and body disagree, or that cannot fail**

- "should apply the col-resize cursor to the separator at rest" checks the initial value before any measurement. In a browser, a resizable list without minimums rests at its minimum and shows `e-resize`.
- "should resize the first column with keyboard and expose separator semantics": the list is 0 px wide in jsdom, so the minimum and maximum are both 96 and ArrowRight only proves the clamp.
- "should keep the col-resize cursor while the width is between the bounds" would pass if the key did nothing: `col-resize` is the initial cursor.
- "should update the shared dt width on pointer drag" renders one list; nothing is shared.
- "should expose the dt min width as a CSS variable so the resting grid honors it" checks only the custom property, not the grid.
- "should use start alignment by default" expects the class to be exactly `kbq-dl`. That holds only because the 100 ms measurement has not run; afterwards jsdom's 0 px width adds `kbq-dl_vertical`.
- The e2e "should resize the first column with the keyboard" asserts the width with `toBeGreaterThanOrEqual(startWidth)`, which passes when nothing moves; only the class assertion can fail.

**Behaviour without a test.** The spec states these from the source:

- the vertical layout at a width equal to `verticalBreakpoint`;
- the horizontal layout before the first measurement and on the server, and the 0 px measurement of a hidden list;
- the `kbq-dl_resizable` host class;
- `dtWidth` applying without `resizable` and being kept in the vertical layout;
- `dtWidthChange` on a drag, a key and a clamp, its silence on a consumer's binding, and the width shared through `[(dtWidth)]`;
- the clamp after a resize and after a change of `dtMinWidth` or `ddMinWidth`;
- the default of `ddMinWidth`, and Home keeping the initial width of a list without minimums;
- `aria-valuemax`;
- the 8 px step and ArrowLeft in a left-to-right list, keys other than Home, End, ArrowLeft and ArrowRight being left alone, and the default action of the double-click being prevented;
- a change of direction at runtime, and the mirrored pointer drag in a right-to-left list;
- `[localeOverrides]` and an empty `resizerAriaLabel` falling back to the locale;
- the wrapping of long text.
