# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are `packages/components/search-expandable/` (component, template, the unit spec, `e2e.ts` and the Playwright spec), the `search-expandable.{en,ru}.mdx` pages, the two docs examples under `packages/docs-examples/components/search-expandable/`, the dev app in `packages/components-dev/search-expandable/`, and the API golden file `tools/public_api_guard/components/search-expandable.api.md`. Shared code was read where the component relies on it: the locale sections, `KbqLocaleOverridesDirective` and `kbqInjectLocaleConfiguration` in `packages/components/core/locales/`, `ErrorStateMatcher`, `kbqOptionalNumberAttribute`, the Escape handling of `kbq-modal`, and the `aria-describedby` handling of the tooltip trigger. Every claim was checked against the source by one reader; no subagent surveys were used.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the component, and every scenario can be checked by an existing test or by hand in the dev app.
- One place to diff against when search-expandable behaviour changes later.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Internals: the private form control behind the input, the focus-monitor wiring, change-detection hooks and the `@docs-private` members (`onChange`, `onTouch`, `ngControl`, `lastFocusOrigin`).
- The behaviour of the parts the component composes — tooltip delays and placement, the form field and the input — beyond what the component sets on them.
- `kbq-filter-bar`, which projects the search into its right slot, and the deprecated tokens.
- Changes to tests, docs or examples.

## Decisions

The general decisions follow the select baseline (`openspec/changes/archive/2026-10-21-document-select-baseline/design.md`): one capability at the flat path of the entry point, English, only confirmed behaviour, and the spec describes what ships, quirks included. Component-specific decisions:

1. **Quirks that a fix would change stay in the spec and are also flagged.** These quirks are deterministic, and the first one is intended by the code comments, but each may surprise a consumer:
    - every collapse hands `''` to the bound control and marks it dirty, even when it was already empty;
    - `[isOpened]` changes the state without the event and without the reset;
    - any collapse moves focus to the collapsed button, even one started elsewhere on the page;
    - Escape is handled only in the input.

    The spec states them as they ship, so that a fix shows up as a `MODIFIED` delta. Findings lists them as candidates for such a fix.

2. **What counts as contract.** These count:
    - the inputs (`isOpened`, `disabled`, `tabIndex`, `tooltipText`, `placeholder`, `emitValueTimeout`, `isEmitValueByEnterEnabled`, `localeOverrides`) and the `isOpenedChange` output;
    - the public members `toggle()`, `value`, `isOpened`, `disabled`, `tabIndex`, `tooltipText`, `placeholder` and `localeConfiguration`;
    - the host classes `kbq-search-expandable` and `kbq-search-expandable_opened`, and the element classes `kbq-search-expandable__button` and `kbq-search-expandable__search`, which the unit and e2e tests locate by and consumer tests can too;
    - ARIA attributes and the thrown error message;
    - the exported constants and the locale provider and token.

    The timing of the debounce counts, because a consumer's filtering depends on it. The order of internal emissions does not.

3. **Focus is specified by outcome, not by mechanism.** The spec says where focus ends up after each kind of expand and collapse, and that the tooltip does not open on the way. It does not mention the focus origin bookkeeping or the change-detection hook that moves focus.

4. **Locale behaviour shared with every component is stated once here, for this component.** The provider, the token and `[localeOverrides]` are core mechanisms. The spec states only what they do to this component's three strings, so a later change to the core mechanism shows up here only if these strings change.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/search-expandable` updates `openspec/specs/search-expandable/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [Some requirements rest on the source rather than on a test] → tasks.md checks each of them by hand in `yarn run dev:search-expandable` before archiving. A mismatch is corrected in the delta, not in the code.
- [A defect gets recorded as intended behaviour] → The quirks listed in decision 1 are in the spec and in Findings. Fixing one is a `MODIFIED` delta, so the spec does not hide it.
- [The dev app binds only `[(ngModel)]` and has no form control, modal or locale switcher] → Several hand checks go through the browser console (`ng.getComponent`) on the existing instances instead. Checks that need a locale service or a modal rely on reading the source and are listed under "Behaviour without a test".

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The JSDoc of `value` says a write reaches the bound control once `emitValueTimeout` passes. With `isEmitValueByEnterEnabled` set, it reaches the control only on Enter. A write to a collapsed field does not expand it either.
2. The JSDoc of `isOpenedChange` says it fires when the search "has been toggled". It also fires when a model value expands the field. It does not fire when `[isOpened]` or the `isOpened` property changes the state.
3. The JSDoc of `localeConfiguration` calls it the strings "currently rendered by the component". With `tooltipText` or `placeholder` set, the rendered strings are those, not the locale's.
4. The JSDoc of `emitValueTimeout` says the default comes from `defaultEmitValueTimeout`. That holds only while the input is unbound: a bound `null` or a non-numeric string becomes `NaN` (see suspected defect 5).
5. The JSDoc of `KBQ_SEARCH_EXPANDABLE_LOCALE_CONFIGURATION` does not say that, once a locale service is provided, the token is ignored for every registered locale.
6. The JSDoc of the `isOpened` property ("state of component") does not say that writing it skips the event and the reset.
7. The docs page covers only the forms requirement, the emit timing and the auto-expand. It says nothing about these:
    - collapsing clears the model;
    - Escape;
    - `isOpened` and `isOpenedChange`;
    - `tooltipText`, `placeholder`, `disabled` and `tabIndex`;
    - localization.
8. `examples.search-expandable.en.mdx` and `examples.search-expandable.ru.mdx` are empty files, and `structure.ts` sets `hasExamples: false` for the component.
9. `KbqSearchExpandable`, `toggle()`, `defaultValue`, `defaultEmitValueTimeout` and `KbqSearchExpandableModule` have no JSDoc; the golden file marks them `(undocumented)`. A stray, empty `/** @docs-private */` sits above the JSDoc of the private control.

**Suspected defects (from reading the code, not reproduced)**

1. A collapse through `[isOpened]` or the `isOpened` property skips the reset. The query stays in the field and in the bound control, unlike every other collapse, so a parent that collapses a `[(isOpened)]` search leaves its filter applied. It also applies while disabled.
2. Every collapse moves focus to the collapsed button, including a collapse started by another control (`toggle()` from a toolbar button) or by `[isOpened]`. Focus is pulled away from where the user is.
3. Writing `value` while collapsed sends the text to the bound control after the debounce but leaves the field collapsed. The model then holds a query the user cannot see, against the docs rule that a model value renders the search expanded.
4. Every collapse hands `''` through the change callback, even when nothing was typed and the control already holds `''`. The control is marked dirty and `valueChanges` and `ngModelChange` fire, so a consumer that reloads data on `valueChanges` reloads on every collapse.
5. A bound `emitValueTimeout` of `null` or of a non-numeric string becomes `NaN`. The typed value then reaches the control almost at once, on a zero-delay timer, instead of after the 200 ms default. `tabIndex` uses `kbqOptionalNumberAttribute` for the same case; `emitValueTimeout` does not.
6. Escape is bound only on the input. With focus on the close button, Escape does not collapse the field, and inside a modal it closes the modal.
7. `tabIndex` is not applied to the close button, which keeps its own default stop. A consumer that sets `tabIndex` to `-1` still has a tabbable close button.
8. The collapsed button carries the same string as its `aria-label` and as its tooltip. While the tooltip is open, the button's `aria-describedby` points at it, so a screen reader may announce "Search" twice. The tooltip skips `aria-describedby` only when its text equals the host's text content, which an icon-only button does not have.
9. An empty-string `tooltipText` or `placeholder` is used as given, which leaves the button or the input with an empty `aria-label` and no accessible name. No axe test covers it.

**Tests whose name and body disagree, or that cannot fail**

- "should force-emit the reset value on close even mid-debounce" sets the control to `alpha`, which is a programmatic write: it starts no debounce and records `alpha` as the last exchanged value. A collapse that did not force the emission would also hand `''` to the control, so neither "mid-debounce" nor "force" is exercised.
- "should move focus into the input when the toggle button was focused at auto-open time" never focuses the button. It writes the protected `lastFocusOrigin` field instead.
- "should add opened class when opened" sits under `describe('toggle')` but opens through `[isOpened]`, which takes a different path: no event and no reset.
- "should not show input when closed" sits under `describe('disabled state')` but involves no disabled state; it repeats "should show button when closed".
- "should have default empty value" asserts `toBeFalsy()`, which also passes for `undefined` or `null`, not only for `defaultValue`.
- The two "focus monitoring" tests count calls to `FocusMonitor.monitor`. They test the wiring, and no requirement maps to them.

**Behaviour without a test.** The spec states these from the source:

- the error thrown without a form directive;
- `type="text"` and `autocomplete="off"` on the input, and `type="button"` on the collapsed button;
- the debounce restarting on each keystroke, and a changed `emitValueTimeout` applying from the next keystroke;
- `isOpenedChange` not firing for `[isOpened]`, for `toggle()` while disabled, or for the close button (only its collapse is tested);
- a collapse through `[isOpened]` keeping the query;
- `toggle()` hiding the tooltip, and the tooltip not opening when focus returns to the collapsed button;
- no focus move on a first render with `[isOpened]="true"` or with an initial form-control value;
- focus moving to the collapsed button after the close button or a collapse started elsewhere (the e2e test covers Escape only);
- the reset of an already empty field marking the control dirty, a pending emission dropped on collapse, and unconfirmed text discarded in Enter mode;
- `null` and `undefined` written to the control showing an empty field;
- a write to `value` not expanding a collapsed field;
- the error state through a consumer `ErrorStateMatcher` and after a form submit;
- a field disabled while expanded staying expanded, with a disabled close button;
- `tabIndex` reading `-1` while disabled, and `tabIndex` reaching the button and the input in the DOM;
- an empty-string `tooltipText` or `placeholder` used as given;
- the strings under a locale service and after `setLocale()`, `kbqSearchExpandableLocaleConfigurationProvider()` and `[localeOverrides]`;
- Escape on the close button not handled (the modal test covers only the collapsed button).
