# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are:

- `packages/components/split-button/`: the component, the module, the styles and theme where they define the host and nested-button classes, the unit spec, `e2e.ts`, the Playwright spec and its baseline screenshots, the `split-button.{en,ru}.mdx` and `examples.split-button.{en,ru}.mdx` pages;
- the docs examples under `packages/docs-examples/components/split-button/` and the dev app in `packages/components-dev/split-button/`;
- what the split button relies on: `KbqButton` (the style, color and disabled state a group hands to a button, and the default color of each style), `KbqColorDirective` in `core`, `KbqDropdownTrigger` and `KbqDropdown` (`xPosition`, the width origin, `panelWidth`, `panelMinWidth`) and the panel width resolver in `core/overlay`;
- the API golden file `tools/public_api_guard/components/split-button.api.md` and the `split-button` entry of `apps/docs/src/app/structure.ts`.

Every claim was checked against the source before going into the spec.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the component, and every scenario can be checked by an existing test or by hand in the dev app.
- One place to diff against when split-button behaviour changes later.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Internals: member names, the effects that apply the settings, change-detection details, CSS structure and design tokens.
- The full contracts of `kbq-button` and `kbq-dropdown`.
- Changes to tests, docs or examples.

## Decisions

The general decisions follow the `select` baseline (`openspec/specs/select/spec.md` and its archived change): one capability at the flat path `split-button`, written in English; the spec describes what ships, quirks included; only behaviour confirmed by a test or read in the source goes in, and the rest goes to Findings. The decisions below are specific to the split button.

1. **The contract is what the split button does to its children.** The split button has almost no behaviour of its own: it sets classes on the buttons it holds, hands them its style, color and disabled state, and sets the position and width origin of the dropdown its trigger opens. Those effects are the contract. A requirement mentions behaviour of `kbq-button` or `kbq-dropdown` only where the split-button docs page promises it and the split button must not break it: the tab order of a disabled button, the trigger's `aria-expanded`, the menu's fallback position and `panelMinWidth`. Their full contracts belong to their own specs.
2. **What counts as contract.** These count:
    - the `kbqStyle`, `color`, `disabled` and `panelAutoWidth` inputs;
    - the public `kbqStyle`, `disabled`, `firstDisabled` and `secondDisabled` properties and the `color` signal;
    - the element and attribute selectors and `KbqSplitButtonModule`;
    - the host classes `kbq-split-button`, `kbq-split-button_styles-for-nested`, `kbq-split-button_first-disabled`, `kbq-split-button_second-disabled`, `kbq-button_<style>` and `kbq-<color>`;
    - the classes on the nested buttons `kbq-split-button_item`, `kbq-split-button_first` and `kbq-split-button_second`; the Playwright spec itself locates the leading button by `.kbq-split-button_first`;
    - `role="group"` and the development-mode error text.

    The `@docs-private` members (`buttons`, `dropdownTrigger`, `kbqStyleInput`, `disabledInput`) and `_disabled` do not count.

3. **Visual styling stays out; truncation stays in.** The narrower menu button next to an icon-only leading button, the divider, the focus ring and the disabled colors are covered by the screenshot baselines `01` to `03` and are not stated. Truncating a long label is stated, because the docs page promises it as a content rule and the e2e spec asserts it by measuring the element, not only by screenshot.
4. **Order of the docs page.** Overview (host, content, classes), style (style and color), content (truncation), disabled state, menu width and accessibility. The "In progress" section has no requirement, because the split button has no progress behaviour of its own (see Findings).

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/split-button` updates `openspec/specs/split-button/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [Some requirements rest on the source rather than on a test] → tasks.md checks each of them by hand in `yarn run dev:split-button` before archiving. A mismatch is corrected in the delta, not in the code.
- [A defect gets recorded as intended behaviour] → The host color under `transparent` and the `contrast-fade` written in code are stated because they ship, and are also listed under Findings. Changing them goes through `MODIFIED`.
- [Requirements that mention button and dropdown behaviour overlap their future specs] → They state only what the split button changes or promises. When `button` and `dropdown` get baselines, these requirements can point to them.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The JSDoc of `panelAutoWidth` says it "sets the width of the dropdown to the width of the trigger". It measures the whole split button, not the trigger. With the dropdown's default `panelWidth`, it sets only a minimum width. The menu matches the control exactly only with `panelWidth="auto"`, and `panelMinWidth` 0 for a control narrower than 200 px, which is what the `split-button-menu-width` example binds.
2. The "Menu width matching the button" section never names `panelAutoWidth`.
3. The same section says menu positioning "is configured the same way as in the Dropdown component". The split button writes the dropdown's `xPosition` itself (suspected defect 1).
4. The "In progress" section says progress, like the disabled state, can be applied "to the entire button group". The split button has no progress input. The example sets the `kbq-progress` class on each button, on both of them for "Completely in Progress".
5. The "Completely Disabled" header of the `split-button-disabled-state` example starts with a Cyrillic "С" (U+0421) instead of a Latin "C".
6. These are not documented on the pages:
    - `panelAutoWidth` by name, `firstDisabled` and `secondDisabled`;
    - the host and nested-button classes and the attribute selector;
    - the development-mode error;
    - that only direct `kbq-button` children are rendered.

    `KbqSplitButton` and `KbqSplitButtonModule` have no class JSDoc; the golden file marks them "(undocumented)".

7. `examples.split-button.{en,ru}.mdx` are "Documentation in progress" placeholders. `structure.ts` sets `hasExamples: false`, so the site does not show them.

**Suspected defects (from reading the code, not reproduced)**

1. The split button sets the dropdown's `xPosition` to `before` on initialization and again whenever its buttons, the trigger, the trigger's dropdown or `panelAutoWidth` change. A consumer's `xPosition` on that dropdown seems to be overwritten. A dropdown shared with a trigger outside the split button opens `before` there too.
2. `panelAutoWidth` has no boolean transform, unlike `disabled`. A bare `panelAutoWidth` attribute passes `''`, which is falsy, so the menu keeps measuring the trigger. With strict template type-checking, the attribute form does not compile.
3. `panelAutoWidth` measures the host box, which can be wider than the visible buttons: the host is a flex row whose buttons do not grow. The e2e baseline `05-light.png` shows it. The split button is given 240 px, the visible control is narrower, and the menu is 240 px wide. As it does not fit toward the start, it falls back to opening from the chevron instead of lining up with the control.
4. The host color class does not follow the style. Under `transparent` with no `color`, the host has `kbq-contrast-fade` while its buttons are `kbq-contrast`. The host-level rules in `_split-button-theme.scss` key on the host's color and style pair, so they target a pair the buttons do not have.
5. `contrast-fade` written in code through `color.set()` is not passed to the buttons, because it equals the split button's own default. The same value bound through `[color]` is passed, so under `transparent` the two give different button colors.
6. A `kbq-button` wrapped in another element is dropped without a warning. When it is the only button, development mode throws "must contain at least one button" although the template has one.
7. Nothing limits the split button to two buttons. With three or more, the middle ones get only `kbq-split-button_item`, `secondDisabled` follows only the last one, and the joined styles assume two.

**Tests whose name and body disagree, or that cannot fail**

- "should have kbq-button_filled class on host by default" binds `kbqStyle` to `filled`. No unit test renders the unbound default.
- "should propagate style to all nested buttons" checks `filled`, which every `kbq-button` has on its own, so it cannot fail on propagation. "should update host class and nested buttons when kbqStyle changes" does cover propagation.
- "should default color on nested buttons to contrast-fade" binds `color` to `contrast-fade`, so it tests a bound color, not the default. Under `filled` that is also the buttons' own default, so it cannot fail.
- "should release nested buttons back to the style default when an empty value is set" runs under `filled`. There the style default and the split button's own default are both `contrast-fade`, so it cannot tell a released button from one given the split button's default.
- The e2e test "renders the open menu aligned to the whole control" shows the opposite. Its baseline, and the comment on `E2eSplitButtonDropdown`, have the menu anchored to the chevron, not aligned with the control.

**Behaviour without a test.** The spec states these from the source:

- the attribute selector;
- content other than direct `kbq-button` children not being rendered, including a wrapped button;
- the development-mode check running only once;
- a middle button of three getting no position class;
- the unbound `kbqStyle` default on the host, custom style strings, and reading and writing `kbqStyle` in code;
- the host `kbq-<color>` class;
- a color set in code;
- the color and the disabled state reaching a button added later;
- the bare `disabled` attribute, a button's own `disabled` set to false under a disabled split button, and `disabled` reading `undefined` while unset;
- the menu matching the split button exactly with `panelWidth="auto"`, and the split button being measured on each open;
- the host having no `aria-label`, not being a tab stop, and the tab order of its buttons.
