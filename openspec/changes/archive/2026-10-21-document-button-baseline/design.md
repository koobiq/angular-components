# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are:

- `packages/components/button/`: `button.component.ts` (the button and its content styler), `button-group.ts`, `button-slots.ts`, `button.dropdown-trigger.directive.ts`, the template, `button.module.ts`, and the SCSS where it defines behaviour (truncation, slot spacing, the focus ring, the forced state classes, the style and color pairs);
- the unit spec `button.component.spec.ts`, the e2e scenarios in `e2e.ts` and `e2e.playwright-spec.ts` with its baselines;
- `button.{en,ru}.mdx`, `button-group.{en,ru}.mdx`, `examples.button.{en,ru}.mdx` and the 13 docs examples under `packages/docs-examples/components/button/`;
- the API golden file `tools/public_api_guard/components/button.api.md`;
- what the button relies on in other entry points: the color directive, `supportsNativeDisabled`, `getContentNodes`, `kbqOptionalNumberAttribute` and the global `kbq-progress` styles in `core`, `kbq-title` with `KBQ_TITLE_TEXT_REF`, and the `opened` state of the dropdown trigger.

The select baseline set the pattern for component specs; this change follows it.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the button, and every scenario can be checked by an existing test or by hand.
- One place to diff against when button or button group behaviour changes later.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Internals and the `@docs-private` seams other components use: `setColorFromGroup`, `setKbqStyleFromGroup`, `setDisabledFromGroup`, `updateRole`, `disabledSignal`, the `*Input` signals, `projectContentChanged`, `updateClassModifierForIcons` and `haltDisabledEvents`.
- Design tokens, sizes and colors beyond the classes a consumer sets or tests against.
- The dropdown's own behaviour, including the `aria-expanded` its trigger writes onto a button.
- Changes to tests, docs or examples.

## Decisions

The general decisions of the select baseline apply unchanged: one capability at the flat path of the entry point, English, the spec describes what ships with its quirks, only confirmed behaviour goes in, and suspected defects go to Findings. These decisions are specific to the button:

1. **The button group belongs to the `button` capability.** It has a docs page of its own, but it lives in the same entry point and golden file, and it works by driving the button's style, color and disabled state. A separate `button-group` capability was considered and rejected: most changes to that propagation touch both halves.
2. **Layout behaviour that the Playwright spec pins down is contract.** Truncation with an ellipsis, slot icons keeping their size, icon-only buttons not shrinking, icon centring, right-to-left mirroring, the six style and color pairs, the forced `kbq-hover` / `kbq-active` looks and the keyboard focus ring are what consumers see and test against. Token values, paddings and colors are not.
3. **What counts as contract.** These count:
    - public inputs and the documented members `focus()`, `focusViaKeyboard()`, `hasFocus`, `kbqStyle`, `color`, `tabIndex`, `textElement`, `parentTextElement`;
    - the exported class-name constants and `KbqButtonStyles`;
    - host classes: `kbq-button`, `kbq-button-icon`, `kbq-button_<style>`, `kbq-<color>`, `kbq-disabled`, `kbq-button_no-label`, the icon position classes, the slot classes, `kbq-active`, the group and group-root classes;
    - the native `disabled`, `aria-disabled`, `tabindex` and `role` attributes;
    - the text of the two dev-mode warnings, since consumers see them in the console.
4. **No localization requirement.** The button renders no text and no ARIA text of its own, so it uses no locale configuration.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/button` updates `openspec/specs/button/spec.md` with a delta, reviewed like the API golden file.
- [Some requirements rest on the source rather than on a test] → tasks.md checks each of them by hand before archiving. A mismatch is corrected in the delta, not in the code.
- [Screenshot baselines prove the look did not change, not that it is right] → The requirements built on them name only what the docs examples and the design system pairs show; the hand checks look at the same states in the dev app.
- [Other components drive the button through `@docs-private` seams that this spec leaves out] → Their behaviour belongs in the specs of breadcrumbs, button toggle and filter bar; this spec states only what a consumer of the button sees.
- [A defect gets recorded as intended behaviour] → Suspected defects stay out of the spec and are listed under Findings. Where shipped behaviour is half of a likely defect, as with releasing a button's own style in a group, the spec states only the half the test pins down.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. `button.en.mdx` says an icon button is made with `<button kbq-icon-button>`. `kbq-icon-button` is a different component from `@koobiq/components/icon`, put on the icon itself. A `kbq-button` becomes icon-only by itself when its content is one or two icons.
2. `button.en.mdx` says there are "two button variants, each applied as an attribute". There is one attribute, `kbq-button`, and the variant follows the content.
3. `button.en.mdx` lists the colors `theme`, `secondary` and `error`. `KbqButtonColor` is `theme`, `theme-fade`, `contrast` and `contrast-fade`; there is no `secondary`, and status colors have no button look.
4. The English and Russian overview pages describe different things. Only the Russian page shows `kbqStyle`, the content slots, the width cases (hug, fixed, fill) and the loading example; neither page mentions the `kbqButtonPrefix` / `kbqButtonSuffix` markers in text, anchors, `tabIndex`, `kbq-title` or `kbqButtonGroupRoot`.
5. `examples.button.{en,ru}.mdx` are "documentation in progress" stubs, and `structure.ts` sets `hasExamples: false` for Button and Button Group, so the site never routes to them.
6. The JSDoc of `buttonLeftIconClassName` and `buttonRightIconClassName` says the class is set when the first or last visible child is an icon. A lone icon is both, but gets neither class: the classes need more than one visible node.
7. The JSDoc of `KbqButtonGroupRoot.kbqStyle` says the style reaches "every nested button". Only buttons placed directly in the group's content are reached; a button inside a wrapper element is not.
8. `KbqButton`, `KbqButtonModule`, `focus()`, `focusViaKeyboard()`, `hasFocus` and `getHostElement()` have no JSDoc; the golden file marks them `(undocumented)`.

**Suspected defects (from reading the code, not reproduced)**

1. A disabled `<a href kbq-button>` keeps its `href`, and only `click` and a few keys are halted. A middle click, which fires no `click` event, or "Open link in new tab" from the context menu probably still opens the link.
2. On an `<a kbq-button>`, a `role` the consumer sets is replaced by `button` when there is no `href` and removed when there is one, on every check. A link button with `role="tab"` or `role="menuitem"` loses it.
3. When a button's own `kbqStyle` turns falsy inside a group whose style is not `filled`, the button becomes `filled` and stays so until the group style changes again, instead of taking the group style. The only test uses a `filled` group, where the two are the same.
4. A group color set in code to `contrast-fade`, the group's default, is not propagated, while the same value bound through the input is. Transparent buttons then stay `contrast`.
5. `kbq-progress` is purely visual: it sets no `aria-busy`, does not disable the button and lets clicks through. Assistive technology gets no loading cue, and a repeated click submits again. This may be intended, but the docs do not say so.
6. `KbqButton` imported without `KbqButtonCssStyler` fails with a bare missing-provider error, while the opposite mistake gets a dev-mode warning that names the fix.

**Tests whose name and body disagree, or that cannot fail**

- "should remove tabindex if disabled" expects `tabindex="-1"`, not a removed attribute, and its first assertion runs before the first change detection, when the anchor has not rendered its `tabindex="0"` yet.
- `KbqButtonGroupRoot` "should fall back to Filled when falsy value is set" never sets a falsy value: the fixture binds `filled`.
- "should toggle host button class type on icon removal/reveal" and the left and right icon variants only remove the icon; nothing is revealed.
- "should switch to kbq-button-icon via the effect when an icon is revealed while the content observer is disabled": the template never disables the content observer, so the test cannot tell the effect from the observer, and its comment is stale.
- "should leave every child on the default color of its own style while the color is unbound" binds the group color to `null`; no unit test renders a group without a `color` binding.
- "should expose aria-expanded on a dropdown trigger" asserts an attribute the dropdown trigger writes, not the button.
- "should should not clear previous defined classes" has a doubled word in its name.

**Behaviour without a test.** The spec states these from the source:

- `KbqButton` without the styler failing with a missing-provider error;
- no `type` attribute added to a native button;
- the `kbq-disabled` class (only the disabled screenshot depends on it);
- Left and Right being halted, and Tab and Escape passing, on a disabled anchor;
- the CDK focus-origin classes on the host;
- no focus ring for mouse focus or for a disabled button that keeps focus;
- `kbq-progress` standing still under reduced motion and leaving the button clickable;
- the fallback look of a style and color pair the design system does not define, and a custom style getting no colors;
- the forced hover and pressed looks not applying to a disabled button;
- an icon nested in a wrapper element counting as other content (`kbq-button`);
- `kbq-active` going away when the dropdown closes;
- `role="group"` and no `aria-orientation` on `kbq-button-group`;
- the group's `disabled` input through `kbq-button-group` (tests use `kbqButtonGroupRoot`), and an unbound group style leaving buttons alone;
- the `kbq-button-group-root_<style>` class in the DOM (tests read the property) and its absence on an unstyled group;
- a group color set in code;
- a button inside a wrapper element not being reached by the group.
