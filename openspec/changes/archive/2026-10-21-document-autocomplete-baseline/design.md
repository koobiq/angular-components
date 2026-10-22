# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are:

- `packages/components/autocomplete/`: the panel component and its template and styles, the trigger directive, the origin directive, the module, the unit spec, `e2e.ts`, the Playwright spec and the WebKit panel-scrolling spec;
- the parts of `packages/components/core` the autocomplete relies on: the option and optgroup, the list key manager, the caret and text-query helpers, the text mirror behind the inline hint, the panel width resolver, the reposition scroll strategy and the sibling pop-up contract;
- `kbq-form-field` (overlay origin, focus origin, control) and the `kbqTagInput` use of `kbqAutocompleteOnBlur`;
- the `autocomplete.{en,ru}.mdx` and `examples.autocomplete.{en,ru}.mdx` pages, the five examples under `packages/docs-examples/components/autocomplete/`, the dev app and the API golden file `tools/public_api_guard/components/autocomplete.api.md`.

Every claim in the spec was checked against the source. The autocomplete provides no localized strings: the name of its option list comes from the field.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the component, and every scenario can be checked by an existing test or by hand.
- One place to diff against when autocomplete behaviour changes later.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Internals: private members, the key manager, timers, change-detection details, CSS structure and design tokens beyond the ones a consumer sets.
- Members marked `@docs-private` that only other entry points use, such as `suppressOpenOnNextFocus()`, `setScrollTop()` and `getScrollTop()`.
- The behaviour of `kbq-tag-input`, `kbq-tooltip`, `kbq-modal` and `kbq-form-field` themselves.
- Changes to tests, docs or examples.

## Decisions

The general decisions follow the select baseline (`openspec/changes/archive/2026-10-21-document-select-baseline/design.md`): one capability at a flat path named after the entry point, English, quirks documented as they ship, only behaviour confirmed by a test or read in the source, and public names, selectors, host classes, ARIA attributes, error messages and exported tokens counting as contract. Component-specific decisions:

1. **The trigger, the panel, the origin and the footer form one capability.** They ship in one entry point, and most behaviour lives in the trigger while the panel holds the inputs (`displayWith`, `panelWidth`, `autoActiveFirstOption`, `openOnFocus`). Splitting by directive would put one interaction into two specs.
2. **Text mode, the caret-anchored panel and the inline hint stay in `autocomplete`.** They are inputs of the same trigger and share the query, the active option and the panel. A separate `autocomplete/text-mode` capability was considered and rejected for now; it can be split off later with `REMOVED` and `ADDED` deltas.
3. **Shared core code is described only through the autocomplete.** Option selection, the key manager, the caret helpers and the width resolver appear only as what a user of the autocomplete sees. The select spec states some of the same option behaviour for `kbq-select`; each spec owns its component's view of it.
4. **Members exposed for other components count when they are public and documented.** `kbqAutocompleteOnBlur`, `isAttached` and `openedChange` are part of the public API that `kbqTagInput` and `kbqTooltip` consume, so the spec states what they return; what those components do with them is out of scope.
5. **Quirks stated as they ship.** Examples:
    - `open()` opens the panel of a read-only, disabled or autocomplete-disabled field;
    - a click on the focused field opens the panel even with `openOnFocus` set to `false`;
    - Tab closes the panel without choosing the active option;
    - `autoActiveFirstOption` defaults to `true` through the token factory;
    - in text mode `displayWith` does not apply to form-written values but does apply to inserted text.

    A fix belongs in its own change, with a `MODIFIED` delta.

6. **Geometry comes from Playwright.** jsdom lays nothing out, so the position and gap requirements cite the e2e numbers (the 2 px and 8 px caret tolerances, the gap probe) and not the unit tests that compare zero rectangles.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/autocomplete` updates `openspec/specs/autocomplete/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [Some requirements rest on the source rather than on a test] → tasks.md checks the most important of them by hand before archiving. A mismatch is corrected in the delta, not in the code.
- [The unit suite runs with `autoActiveFirstOption: false`] → `createComponent` provides that default for every test, so the shipped default runs only in the tests that opt in. The spec states the shipped default, and the hand checks run with it.
- [A defect gets recorded as intended behaviour] → Suspected defects stay out of the spec and are listed under Findings.
- [Overlap with the select spec on shared option behaviour] → A change to the shared option code updates every component spec it alters.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The "Text autocomplete" section says text mode "inserts the selected option after the caret". It replaces the query before the caret, trigger included, with the option. The Enter row of the keyboard table says the option is inserted "at the caret", with the same gap.
2. The keyboard table says ↓ opens the panel. In text mode ↓ never opens it. The table also leaves out Shift+↑/↓, which chooses the newly active option outside text mode and selects text in text mode.
3. The "Inline hint" section does not say that the hint needs a `kbq-form-field`, which the JSDoc of `kbqAutocompleteInlineHint` does. It also does not say that no hint is drawn when text follows the caret on its line or when the text is right-to-left or centred.
4. The JSDoc of `panelClosingActions` lists "on blur" among the closing actions. Blur does not close the panel; an outside click does.
5. The JSDoc of `activeOption` says the option is "coerced to MatOption type", a leftover from Angular Material.
6. The JSDoc of `kbqAutocompleteOnBlur` describes "an event handler for input blur events". The trigger never calls it: only `kbqTagInput` reads it to decide whether to add a tag on blur.
7. The JSDoc of `displayWith` describes mapping "an option's control value". It is also applied to every value the form writes, `null` included, and in text mode to the text an option inserts.
8. The JSDoc of `kbqAutocompleteDisabled` says "the user won't be able to open the panel". `open()` still opens it.
9. `examples.autocomplete.{en,ru}.mdx` are "Documentation in progress" stubs, while `structure.ts` sets `hasExamples: false`, so no route shows them. The "Suggestions next to the caret" and "Inline hint" sections have no live example of their own.

**Suspected defects (from reading the code, not reproduced)**

1. With `autoActiveFirstOption` on, its default, choosing an option other than the first with Enter makes the first option active after the panel has closed. The active-option handler then selects that option, because the panel is closed. While it is still rendered, the first option becomes `selected` next to the chosen one, and `optionSelections` reports a user selection of it. In text mode this breaks the promise that no option stays selected.
2. Every arrow key and every hover moves DOM focus onto the option and straight back to the field. The WebKit e2e records those focus calls. The field fires `blur` and `focusin` each time, so the control is marked touched, and a required field may show its error, while the user is still in it.
3. When the panel is bound after the trigger's first render, for example inside an `@if` that turns true later, the trigger never subscribes to active-option changes. Arrow keys then no longer scroll the active option into view, and the inline hint does not follow them.
4. `opened` and `openedChange(true)` fire again, with no `closed` in between, when the options run out while the panel is attached and later come back.
5. Focusing a field whose `kbqAutocomplete` is not bound throws a `TypeError` (`openOnFocus` of `undefined`). It is not the descriptive missing-panel error that `open()` throws.
6. Every selection event of an option while the panel is open counts as a choice. A programmatic `select()` or `deselect()` closes the panel, writes that option's value to the field and the form, even the value of an option being deselected, and emits `optionSelected`.
7. Deselecting on an empty field works only when `kbq-autocomplete` sits inside the field's `kbq-form-field`. Placed outside, as in the unit fixtures and the fallback e2e route, a cleared field leaves the old option `kbq-selected`.
8. `aria-autocomplete="both"` is set whenever text mode and the inline hint are on, also where no hint can be drawn: outside a `kbq-form-field`, or with right-to-left or centred text.

**Tests whose name and body disagree, or that cannot fail**

- "should close the panel when the user taps away on a touch device" dispatches `focus`, but the trigger listens to `focusin`. The panel never opens, so the assertions hold without the touch event.
- These compare `getBoundingClientRect()` values, which are all zero in jsdom:
    - "should use below positioning by default";
    - "should reposition the panel on scroll";
    - "should align panel properly when filtering in "above" position";
    - "should fall back to above position when requested if options are added while the panel is open";
    - "should reposition the panel when the amount of options changes";
    - "should be able to set a custom panel connection element";
    - "should be able to change the origin after the panel has been opened".
- "should use below positioning by default" also asserts the absence of `kbq-autocomplete-panel-above`, a class nothing sets.
- "should not move active option past the first when pressing UP from the top" reads `scrollTop` of `.kbq-autocomplete-panel`. That element does not scroll, and jsdom does not scroll at all, so only the active-option assertion can fail. The `getScrollTop()` assertions of "should move the active option through the panel via DOWN/UP" are always 0 for the same reason.
- "should not open the panel if the `input` event was dispatched with changing the value" dispatches the event without changing the value.
- "should close the panel when pressing escape" under "panel closing" asserts only that `panelClosingActions` emitted, not that the panel closed.
- "should show the panel when the first open is after the initial zone stabilization" refers to zone stabilization. TestBed is zoneless, and `runOutsideAngular` changes nothing there.

**Behaviour without a test.** The spec states these from the source:

- opening:
    - Down opens a closed panel outside text mode;
    - a click on the focused field opens the panel with `openOnFocus` set to `false`;
    - `open()` ignores the read-only, disabled and autocomplete-disabled states;
- closing:
    - a middle-button click and the end of a touch outside the panel close it;
    - a click inside the `kbq-form-field` keeps it open;
    - an outside click does not move focus and keeps the typed text;
    - Escape and Alt+Up reset the active option to the first one when `autoActiveFirstOption` is on;
    - the default scroll strategy repositions the panel;
- choosing:
    - focus returns to the field after a pointer choice;
    - a click on a disabled option leaves the panel open, hover skips disabled options, and a disabled `kbq-optgroup` disables its options;
    - hover makes an option active (the WebKit e2e asserts only that the list does not move);
    - Enter resolves a stale active option again;
    - Home, End, Left and printable characters are left to the field;
    - focus is back in the field after each arrow key;
- forms:
    - an emptied number field writes `null`;
    - the selection is cleared with the field;
    - the default `autocomplete="off"`;
- caret and text mode:
    - the field's box is used when the caret cannot be measured;
    - a caret-anchored panel is repositioned on `input`, `click`, `select` and `scroll` (only the key release is tested);
    - no query while text is selected;
    - text mode opens on focus and on a click;
    - text mode closes when only the caret moves;
    - the bubbling `input` event after an insertion;
    - an inserted option does not stay selected;
- inline hint:
    - the `aria-hidden` hint layer;
    - no hint outside a `kbq-form-field` or for right-to-left, centred or end-aligned text;
    - the hint is hidden when `kbqAutocompleteDisabled` is set;
- layout:
    - `panelMaxWidth` and the 640 px cap;
    - positioning and width against a custom origin;
    - the `kbq-connected-overlay_below` and `kbq-connected-overlay_above` pane classes;
    - the footer's place outside the listbox and the scrolling area, and clicks inside it;
- `openedChange`.
