# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are `packages/components/accordion/` (the five building blocks, their styles where they define behaviour, `accordion.spec.ts`, `e2e.ts` and `e2e.playwright-spec.ts`), the `accordion.{en,ru}.mdx` and `examples.accordion.{en,ru}.mdx` pages, the examples under `packages/docs-examples/components/accordion/`, the API golden file `tools/public_api_guard/components/accordion.api.md`, and the parts of other entry points the accordion relies on: `KbqStateSaving` and the state store in `core/state-saving`, `kbqAnimationsDisabled` and the `kbq-animations-off()` mixin, `KbqIcon`'s default `aria-hidden`, and the CDK `FocusKeyManager` defaults (`@angular/cdk` 21.2.14). Every claim in the spec was checked against the source, not against test names or the docs. The `select` baseline is the only spec so far and sets the pattern this change follows.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the accordion, and every scenario can be checked by an existing test or by hand in the dev app.
- One place to diff against when accordion behaviour changes later.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Internals: class and member names, the height-pinning mechanism and its custom property, change-detection details, CSS structure and design tokens.
- The state store itself: storage format, key prefix, expiry, and how a key is derived from the document. Those belong to `core` and its own specs.
- Changes to tests, docs or examples.

## Decisions

1. **The general decisions follow the `select` baseline.** One capability at a flat path matching the entry point, written in English, describing what ships with its quirks, holding only behaviour that a test or the source confirms, and counting as contract only public inputs, outputs and methods, selectors, host classes and data attributes, ARIA attributes and exported tokens.
2. **One capability for all five building blocks.** The item, header, trigger and content cannot be used without the accordion and share one expanded state, so splitting them (`accordion/trigger`, `accordion/state-saving`, …) was rejected: most changes would touch several parts at once. State saving was the strongest candidate for a capability of its own; it stays here because what it restores is defined by the accordion's value rules.
3. **`@docs-private` members stay out, with one exception.** `items`, `setActiveItem()`, `keydownHandler()`, `saveState()`, `openCloseAllActions`, `disableAnimation()` / `enableAnimation()` and the trigger and content ids exposed as getters are hidden from the API tab and are not in the spec. The item's `expandedChange` is also marked `@docs-private`, but it is a public output that carries `[(expanded)]` and the tests assert it, so the spec includes it.
4. **The bare `kbqAccordionTrigger` and `kbqAccordionContent` directives are described through the components.** They are exported but not part of `KbqAccordionModule`, nothing in the repository applies them on their own, and every observable trait reaches consumers through `kbq-accordion-trigger` and `kbq-accordion-content`.
5. **Visual behaviour is in only where the docs sell it as a feature or accessibility needs it.** The chevron placement of the three variants ("Trigger placement" on the docs page), the expand and collapse motion with its off switches, and the keyboard focus border are in. Colors, sizes, the clipped header and the caption and badge helper classes are out.
6. **CDK defaults that consumers feel are spelled out.** No wrapping, skipped disabled items, ignored modified arrow keys and the extra Up/Down keys in horizontal orientation come from `FocusKeyManager` defaults the accordion does not override. They are stated as accordion behaviour, because an upgrade of the CDK or a call such as `withWrap()` would change what users get.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/accordion` updates `openspec/specs/accordion/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [Some requirements rest on the source rather than on a test] → tasks.md checks each of them by hand in `yarn run dev:accordion` before archiving. A mismatch is corrected in the delta, not in the code.
- [A defect gets recorded as intended behaviour] → Suspected defects stay out of the spec and are listed under Findings. The two quirks the spec does state — `value()` not following toggles, and value changes reaching disabled items — can change later through `MODIFIED`.
- [The spec is long: 47 requirements, 91 scenarios] → It follows the docs page: structure and variants, expansion, value, item API, disabled state, content placement, keyboard, accessibility, motion, state saving.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. "Inactive section" says a disabled section cannot be expanded. Only user toggles and the item and accordion methods are blocked: a bound `value`, `defaultValue`, a saved state, `[expanded]` and the `expanded` setter still expand a disabled item, and in single mode an expanded disabled item collapses when another one opens. The e2e "states" screenshot shows a disabled item expanded by `defaultValue`.
2. The JSDoc of `orientation` calls it "the layout orientation". The shipped styles have no horizontal layout: `horizontal` changes `data-orientation` and the arrow keys only. Neither docs page mentions `orientation`.
3. The JSDoc of `value` says it falls back to `defaultValue` while unbound. It does not say, and neither docs page does, that `value()` therefore never follows the user's toggles unless `[(value)]` writes them back; with a one-way `[value]` the signal and the expanded items drift apart.
4. The overview page does not document `value`, `defaultValue`, `valueChange`, `collapsible`, `level`, `orientation`, `openAll()` / `closeAll()`, the item's `expanded`, `opened` and `closed`, or the arrow, Home and End keys. "Section expansion" does not name `type="multiple"`.
5. `expandedChange` is marked `@docs-private`, so the API tab hides the output behind `[(expanded)]`.
6. Eight of the ten docs examples, the overview among them, put the trigger straight into the item without `kbq-accordion-header`. Their sections have no heading semantics, and `level` has nothing to apply to.
7. `examples.accordion.{en,ru}.mdx` are "Documentation in progress" placeholders; `structure.ts` sets `hasExamples: false`, so they are not routed.
8. The Russian overview has its Recommendations heading one level deeper than the English one.
9. The "accordion-sections" example misspells the word "Opening" in the label above its toggle group.

**Suspected defects (from reading the code, not reproduced)**

1. `collapsible="false"` is checked only on click. Enter or Space on the focused trigger of an expanded item collapses it, and `toggle()`, `close()` and `closeAll()` ignore the input too.
2. In single mode, switching from one expanded item to another emits `valueChange` twice. When the previously expanded item comes first in the document, the first emission carries its value, not the new one.
3. `orientation` and the `Directionality` are read once, when the content initializes. Changing `orientation` later updates `data-orientation` but not the arrow keys, and a switch to right-to-left at runtime is not followed.
4. The trigger's element form `<kbq-accordion-trigger>`, or any host that is not a native `<button>`, gets `role="button"` but no `tabindex`, so keyboard users cannot reach it. Its `flex: 1` layout is also scoped to `button.kbq-accordion-trigger`.
5. The trigger's and the content's `id` are host bindings, so an `id` the consumer writes on either element is replaced.
6. An item without content keeps an `aria-controls` that points at a missing id, and a content without a trigger keeps a dangling `aria-labelledby`.
7. `collapsible` has no boolean transform, unlike `disabled`. A static `collapsible="false"` is a template type error under strict templates and a truthy string otherwise.
8. A disabled trigger stays in the Tab order, while the arrow keys skip it. The WAI-ARIA pattern allows either choice, but mixing them makes the same header reachable one way and not the other.

**Tests whose name and body disagree, or that cannot fail**

- "hidden attribute should be "true" when closed" and "… "false" when open" assert the presence of an empty `hidden` attribute; it never holds `true` or `false`.
- "has no axe violations with header actions in RTL" provides a right-to-left `Directionality`, but nothing sets `dir="rtl"` in the DOM, so axe checks the same markup as the left-to-right test.
- "Right/Left arrows are mirrored in RTL" presses only Right.
- "ENTER should toggle active item", "SPACE should toggle active item" and "ENTER on an active disabled item should not toggle it" call `setActiveItem()` first, so they do not show that a key on a trigger that is not yet active toggles its own item.
- "should emit valueChange with the current value when item state changes" uses an accordion with one item, so it cannot see the double emission in suspected defect 2.
- "should expand and collapse with motion by default" and "… without motion when animations are disabled" check only the `kbq-animations-disabled` class, not motion.
- "disabled trigger should not have the HTML disabled attribute" and "should have aria-disabled="true" when item is disabled" repeat assertions already made in "should set aria-disabled on trigger when item is disabled".
- "the accordion host should not handle keys itself" dispatches to a host with no key listener; it fails only if one is added back.
- "stops focus monitoring and completes openCloseAllActions on destroy" accepts a `stopMonitoring` call for any element.
- "create then immediately destroy does not throw" runs change detection before destroying.

**Left out of the spec.** Whether `valueChange` fires for items expanded on the first render (by `defaultValue`, a saved state or `expanded`) depends on effect timing, and no test covers it.

**Behaviour without a test.** The spec states these from the source:

- a trigger placed directly in the item, without a header, toggling it;
- a click moving focus to the trigger;
- `collapsible="false"` in single mode still collapsing the expanded item when another opens;
- `defaultValue`: only its first value in single mode, empty strings ignored, later changes ignored;
- the user toggling items under a one-way `[value]`, and `value()` not following those toggles;
- the `valueChange` payload in multiple mode and its once-per-changed-item count;
- a change of an item's `[expanded]` binding after the first render;
- `open()`, `toggle()` and `close()` doing nothing on a disabled item, and the `expanded` setter working on one;
- `openAll()` and `closeAll()` skipping disabled items, and `closeAll()` in single mode;
- `close()`, `closeAll()` and `clearSavedState()` called from an effect;
- Space on a disabled item, and clicks on the items of a disabled accordion;
- a disabled expanded item collapsing in single mode when another item opens (the e2e screenshot covers only the `defaultValue` case);
- arrow keys skipping disabled items, not wrapping, ignoring Left and Right in vertical orientation and ignoring modified keys; Home and End skipping disabled items;
- Left in right-to-left layout, and Up and Down in horizontal orientation;
- the focus border not showing for header actions or content;
- the chevron's `aria-hidden`;
- each nested accordion persisting only its own items;
- the 300 ms duration of the motion;
- the absence of motion on the first render;
- `hasSavedState`.
