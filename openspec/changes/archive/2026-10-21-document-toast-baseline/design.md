# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are `packages/components/toast/` (the service, `kbq-toast` and its template, `kbq-toast-container`, the types and configuration, the styles where they define motion, the unit spec, `e2e.ts` and the Playwright spec), the toast examples in `packages/docs-examples/components/toast/`, the `toast.{en,ru}.mdx` and `examples.toast.{en,ru}.mdx` pages, the API golden file `tools/public_api_guard/components/toast.api.md`, and the parts of `packages/components/core` the toast relies on: the read-state directive, the animation helpers, the a11y locale section and its texts. Every claim was checked against the source. Most of the behaviour lives in `KbqToastService`: a toast cannot work without the stack the service injects into it.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the service and the components, and every scenario can be checked by an existing test or by hand in the dev app.
- One place to diff against when toast behaviour changes later.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Internals: private members, the `moveBefore()` fallback that carries animation progress over a move, `leave()` and the `setHovered()` / `setFocused()` reporting methods (all `@docs-private`), layout classes inside the toast, CSS custom properties and design tokens.
- The notification center, which shows its items through `KbqToastService`; its own spec covers that.
- Changes to tests, docs or examples.

## Decisions

The general decisions of the select baseline apply unchanged: one capability at a flat path named after the entry point, English, the spec describes what ships with its quirks, only behaviour confirmed by a test or read in the source goes in, and suspected defects stay out of the spec. The toast adds these:

1. **One capability covers the service, `kbq-toast` and `kbq-toast-container`.** Splitting `toast/service` from `toast/component` was considered and rejected: the countdown, the pause, the read notification and the focus hand-off each need both sides, and `KbqToastStack` exists only to connect them. The `KbqToastStack` interface and the `KBQ_TOAST_STACK` token are wiring; the spec states only their effect, that a container hosted by a consumer works without a stack wired up by hand.
2. **Timing is stated through the public heartbeat.** `timer` is public, and its JSDoc fixes the 500 ms step. The countdown, the one-expiry-per-step rule and the scenarios ("3000 ms plus one step") are written in those terms, so that a test with fake timers can check them. Where the first step falls after a toast is shown is not part of the contract.
3. **The reflow is in the spec as it ships.** The container reports its own resize as a scroll through the global scroll dispatcher. That is what keeps an overlay anchored inside a toast in place, and it is also the suspected cause of the DS-5407 regression below. The spec states the mechanism; "a toast keeps an open tooltip open", which three unit tests claim, is left out, because those tests cannot fail in jsdom. Fixing DS-5407 will need a `MODIFIED` delta on "Stack reflow reported as a scroll".
4. **What counts as contract, beyond the select list.** These count:
    - the host classes `kbq-toast`, `kbq-toast_<style>`, `kbq-toast_dismissible`, `kbq-toast_leaving` and `kbq-animations-disabled`;
    - `kbq-toast-overlay` on the overlay host and `kbq-toast-container-<position>` on the container;
    - the `kbq-toast-close-button` attribute, because the focus hand-off looks for it;
    - the `kbq-toast__title` class a caption takes without a title, because it is how the caption gets the title's styling;
    - the default configuration values and the error message of `KBQ_TOAST_FACTORY`.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/toast` updates `openspec/specs/toast/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [Some requirements rest on the source rather than on a test] → tasks.md checks each of them by hand in `yarn run dev:toast` before archiving. A mismatch is corrected in the delta, not in the code.
- [A defect gets recorded as intended behaviour] → The reflow requirement describes the mechanism behind a suspected regression. Decision 3 says why it is there, and the Findings name the change that would replace it.
- [Timing requirements depend on the 500 ms step] → A different heartbeat period changes several requirements at once. Each of them names the step explicitly, so such a change shows up in one delta.
- [The spec is long: 49 requirements, 82 scenarios] → It follows the order of the docs page: showing and content, styles, the stack, disappearance and the pause, closing, reading, focus, accessibility, template toasts, configuration and position, the overlay, then the API-only parts.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The animation section of `toast.en.mdx` and `toast.ru.mdx` says the toast appears "from the left", that its height does not change as it leaves, and that it slides beyond the right edge of the screen. The enter keyframe starts the toast offset to the right by its full width, for every position, left-anchored stacks included. The exit moves it by half its width while it fades, and collapses its height to zero, which is how the toasts below rise.
2. Both pages say a message "must remain in the toast list for at least 5 seconds". 5000 ms is only the default `duration`. Any duration is honoured (the e2e scenario uses 2000 ms); the only floor the code enforces is `delay`, after a dismissal or a pause.
3. The close button section says a `closeButton` template replaces the built-in button, but not that it needs the `kbq-toast-close-button` attribute. Without it, the focus hand-off skips that toast, and focus falls back to the trigger or is left where the browser puts it.
4. The docs pages do not mention:
    - `onTop`, as an argument or as a configuration key;
    - the `duration`, `delay` and `indent` configuration keys;
    - `hide()`, `hideTemplate()`, `read`, `hovered()` and `focused()`;
    - `KBQ_TOAST_FACTORY`;
    - Escape closing a toast that has no close button.

    In the API golden file `show`, `showTemplate`, `hide`, `close`, `KBQ_TOAST_CONFIG`, `KBQ_TOAST_FACTORY` and every `KbqToastData` field but `style` are `(undocumented)`.

5. The JSDoc of `timer` says the countdown pauses for "the pointer or the keyboard focus". Focus moved by a mouse press or by code pauses it too.
6. The JSDoc of `KbqToastConfig.indent` does not say that `center` ignores the indent and that `top-center` and `bottom-center` ignore its horizontal part.
7. `isFocusedOrHovered` is public and undocumented, and a TODO in the source says nothing in the library uses it.
8. The first sentence of the overview says a toast "appears in the top right corner". That is the default position only.

**Suspected defects (from reading the code, not reproduced)**

1. DS-5407 again. The container merges its resize notifications into `elementScrolled()`, and the scroll dispatcher re-broadcasts them to the whole application. An overlay with the close scroll strategy that does not contain the container, such as a tooltip, would close whenever a toast appears or leaves. The dev app keeps a manual "DS-5407" check block for this case.
2. A toast created in a `kbq-toast-container` that a consumer hosts is not in the root service's records. Its close button and Escape make the root service's `read` emit, but `hide()` finds no record, so the toast stays. Hovering or focusing it pauses the root service's stack.
3. Escape closes a toast that has no close button, such as the progress toast the docs recommend for an operation the user can cancel. The toast goes away without its "Cancel" action running.
4. A style outside `KbqToastStyle` with the default `icon: true` renders an empty icon container, which still takes the icon's width and margin.
5. Toast ids and template ids come from two counters that both start at 0, so `hide()` given a template's id removes the toast with the same number.
6. The focus hand-off picks the first toast in stack order, not the one next to the closed toast. With the default append order, closing the bottom toast from the keyboard sends focus to the top toast, past every toast in between: the jump the source comment says the stack order avoids.
7. Focus moved into a toast by a mouse press, on an action that does not close it, pauses the whole stack until focus leaves the toast. The pointer leaving does not end that pause.
8. Views destroyed from outside are dropped only on a heartbeat step, and steps are skipped while the stack is paused. A view destroyed during a hover keeps the overlay attached and the heartbeat running until the pause ends.
9. The `toast-hide-overview` example changes a plain `progress` field from an rxjs timer in an `OnPush` component. In the zoneless docs app, the "import complete" state probably renders only when the toast starts to leave.

**Tests whose name and body disagree, or that cannot fail**

- These three pass only because the jsdom `ResizeObserver` stub in `tools/vitest/setup-angular.ts` never fires. In a browser, the reflow requirement says the dispatcher is notified, and the "stack reflow" suite, which stubs the observer, asserts exactly that:
    - "does not notify the global ScrollDispatcher when a toast is shown, animated and hidden";
    - "keeps an overlay with the close-on-scroll strategy attached when a toast appears";
    - "keeps an open tooltip open when a toast appears".
- "hands the focus to the adjacent toast rather than the oldest one when `onTop` is set": the code picks the first toast in stack order. It is the adjacent one only because the closed toast was on top.
- "renders a custom icon class next to the default glyph" asserts the custom class only, not that the glyph class is still there.
- "reports a toast as read exactly once across repeated hover cycles and a close" would also pass if hovering never marked the toast as read: the close alone emits once.
- "renders only the title when nothing else is given" uses a fixture that still has a style, an icon and a close button.
- The e2e "renders the toast in the overlay, at the configured stack position" checks the container's class, not where the stack is on screen.

**Behaviour without a test.** The spec states these from the source:

- line breaks kept in string slots;
- the caption taking the title's place;
- the `$implicit` context of the slot templates (the e2e screenshot renders slot templates but does not use their context);
- `icon: false`, an icon template, `closeButton: false`, a close button template and the `kbq-toast_dismissible` class;
- a style outside `KbqToastStyle`: `role="status"` and no glyph;
- a negative duration making a toast sticky;
- one expiry per step;
- the pause renewing short lifetimes;
- template toasts paused by a hovered toast but not by their own hover;
- `read` on a click and on a dwell, and no `read` on expiry or `hide()` (the dwell itself is covered by `core/common-behaviors/read-state.spec.ts`);
- Escape closing a toast without a close button;
- `hide()` ignoring an unknown id;
- the anchoring and the `indent` of each position (only the class is tested);
- the `kbq-animations-disabled` class (the e2e test checks only that a toast still shows and closes under reduced motion);
- the locale texts of the close button and the region (the tests only check that they are not empty);
- the untracked service calls from an `effect()`;
- `createTemplate()` and `remove()` of a container hosted by a consumer;
- the `focused()` signals going back to `false`.
