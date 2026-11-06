# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are:

- `packages/components/actions-panel/`: the service, the panel reference, the configuration class, the panel container and its template, the scoped overlay container, the styles where they define behaviour, the unit spec and the Playwright spec with its `e2e.ts` scenarios;
- the `actions-panel.{en,ru}.mdx` and `examples.actions-panel.{en,ru}.mdx` pages and the six examples under `packages/docs-examples/components/actions-panel/`;
- the API golden file `tools/public_api_guard/components/actions-panel.api.md`;
- the `actionsPanel` section of the locales, `KbqLocaleOverridesDirective` and `kbqAfterAnimations` / `kbqAnimationsDisabled` in `packages/components/core`;
- the parts of `@angular/cdk` 21.2.14 the panel is built on (`Dialog`, `CdkDialogContainer`, `DialogRef`, the overlay and its keyboard dispatcher), read to pin down what the panel's own settings make observable.

The general approach follows the archived `document-select-baseline` change.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the service, and every scenario can be checked by an existing test or by hand in the dev app.
- One place to diff against when actions panel behaviour changes later.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Internals: the `@docs-private` members of `KbqActionsPanelRef` (`containerInstance`, `overlayRef`, `id`, `open()`), the animation API of `KbqActionsPanelContainer`, the scoped `Dialog` and `OverlayContainer` classes, timings and design tokens.
- The components the docs examples put inside the panel (`KbqOverflowItems`, dropdown, popover, tooltip) and the `actions-panel-overlay-container` schematic migration.
- Changes to tests, docs or examples.

## Decisions

1. **General decisions follow the select baseline.** One capability at a flat path matching the entry point, English, the spec states what ships with its quirks, only behaviour confirmed by a test or read in the source goes in, and suspected defects stay in Findings.
2. **One capability for the whole entry point.** The service, `KbqActionsPanelRef`, `KbqActionsPanelConfig`, the tokens and the provider functions are one API: a consumer never uses one without the others. The scoped overlay container is part of it, since it is reached only through the `overlayContainer` option. Splitting placement into a capability of its own was considered and rejected: replacing a panel, the event order and closing all cross it.
3. **What counts as contract for a service.** These count:
    - the methods and streams of `KbqActionsPanel` and `KbqActionsPanelRef` that are not `@docs-private`;
    - every key of `KbqActionsPanelConfig`, `KBQ_ACTIONS_PANEL_DATA`, `KBQ_ACTIONS_PANEL_DEFAULT_CONFIG`, `KBQ_ACTIONS_PANEL_LOCALE_CONFIGURATION` and the two provider functions;
    - the classes of the DOM the panel produces that tests and consumers select on: `kbq-actions-panel-container` and its `_visible` and `_rtl` modifiers, `kbq-actions-panel-container__close-button`, `kbq-actions-panel-overlay`, `kbq-actions-panel-scoped-overlay-container` and `kbq-animations-disabled`;
    - ARIA attributes and the locale string.

    `kbq-actions-panel-overlay` comes from an `@internal` constant and the wrapper class from one that is not exported. Both are still in the spec, because the e2e spec and the docs rely on them.

4. **CDK behaviour is specified where the panel's own settings expose it.** The panel sets `autoFocus: null`, `restoreFocus: false`, `hasBackdrop: false` and the position strategy, leaves `role` and `ariaModal` at their CDK defaults, and leaves the keydown stream and history navigation to CDK. What a consumer observes as a result is stated in the spec without naming CDK internals: the attributes on the panel, the page marked `aria-hidden`, the keydown stream, the closing on back and forward navigation.
5. **The `aria-hidden` marks on the page are in the spec, although Findings call them a likely defect.** A unit test asserts them as the state before its own check, so they are confirmed behaviour rather than a suspicion. Leaving them out would let a CDK upgrade or a fix change what assistive technology sees without a delta.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/actions-panel` updates `openspec/specs/actions-panel/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [Several requirements rest on CDK rather than on the panel's code, so a CDK upgrade can change them without a change here] → tasks.md checks the CDK-derived ones by hand. A CDK bump that changes them updates the spec in the same pull request.
- [Some requirements rest on the source rather than on a test] → tasks.md checks each of them by hand in `yarn run dev:actions-panel` before archiving. A mismatch is corrected in the delta, not in the code.
- [A defect gets recorded as intended behaviour] → Suspected defects stay out of the spec and are listed under Findings, except the `aria-hidden` marks (Decision 5). Behaviour the spec does state can change later through `MODIFIED`.
- [The spec is long for a service: 42 requirements, 63 scenarios] → It is grouped in the order of the docs page: opening and the reference, adaptability, closing, keyboard, data, placement, then configuration, accessibility, localization and motion.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The JSDoc of `disableClose` says "Whether the user can use ESC or click on close button to close the actions panel". `true` means the opposite, and it removes the close button instead of disabling it.
2. The JSDoc of `keydownEvents` says it emits keydown events "targeted on the overlay". It emits every keydown that reaches `body` while the panel's overlay is the most recently attached overlay that listens for keys, wherever the target is.
3. The keyboard section of the docs says Escape closes the panel. It does so only when the keydown starts inside the panel, and the panel never takes focus when it opens, so Escape pressed in the table it acts on does nothing.
4. The `@default` tags of `scrollStrategy`, `direction` and `closeOnNavigation` hold only for the built-in default configuration. A value given to `kbqActionsPanelDefaultConfigProvider` replaces it whole, and neither the provider's JSDoc nor the docs say so (see suspected defect 3).
5. On the component overload of `open()`, `@param componentOrTemplateRef` names a parameter that is called `component`.
6. "Managing OverlayContainer" says the default container is `document.body`. It is the CDK overlay container element appended to `body`.
7. The comment above `hostDirectives` of the panel container says the container's injector is parented on the root injector unless `injector` is given. With `KbqActionsPanel` provided in a component, as the docs recommend, it is parented on that component's injector.
8. The close button's name comes from `actionsPanel.closeTooltip`, not from `kbqInjectA11yLocaleConfiguration()` as AGENTS.md asks of default ARIA text. Its `en-US` value "Clear" does not match the other locales, which say "deselect".

**Suspected defects (from reading the code, not reproduced)**

1. A panel in the application-wide container makes CDK mark every sibling of the overlay container, the application root included, with `aria-hidden="true"` once the entrance ends. The panel is not modal: `aria-modal="false"`, no backdrop, no focus move, no focus trap. Screen reader users lose the content the panel acts on, and keyboard users can still tab into hidden content (axe `aria-hidden-focus`). The scoped path avoids the marks on purpose; the global one does not.
2. The panel has `role="dialog"` without an accessible name (axe `aria-dialog-name`), and `KbqActionsPanelConfig` has no option to give it one. No axe test opens a panel.
3. A partial value for `kbqActionsPanelDefaultConfigProvider`, the shape its type and its test use, drops the class defaults:
    - `scrollStrategy` becomes `undefined`, so CDK falls back to the dialog's block strategy and page scrolling is locked while a panel is open;
    - `data` becomes `undefined` instead of `null`.
4. Closing that bypasses `KbqActionsPanelRef.close()` skips the exit animation and never emits `beforeClosed`. This covers `closeOnNavigation`, `Dialog.closeAll()` and an overlay disposed from outside. A later `close()` on the reference still emits `beforeClosed`, after `afterClosed`.
5. The close button and Escape call `close()` on the `KbqActionsPanel` that the container's injector resolves. When the `injector` option resolves a different instance, for example the root one, they close that instance's panel, or nothing, instead of their own.
6. `direction` reaches only the overlay's `dir` attribute and the RTL class. CDK provides a `Directionality` to the content only when the content injector has none, and the injector built for the panel always reaches the root one. Content that reads `Directionality`, such as a dropdown, keeps the application's direction. The `'ltr'` default also ignores the application's direction.
7. A replacement panel closed before the panel it replaces has finished closing never emits `beforeOpened` or `afterOpened`, and those streams never complete.
8. Closing the panel from its close button or with Escape leaves focus on `body`: the focused element is removed, `restoreFocus` is off and the focus trap is never set up.

**Tests whose name and body disagree, or that cannot fail**

- "should not close on ESCAPE" (with `disableClose`) checks synchronously after dispatching the key. Closing is asynchronous, so it passes even if Escape closes the panel.
- "should apply global custom OverlayContainer by providers" only checks a class that `FakeOverlayContainer.getContainerElement()` adds whenever it is called, including by the test's own helper. It passes wherever the panel renders.
- "should keep the scoped container as an only child, so that CDK has no siblings to aria-hide" checks `aria-hidden` synchronously after opening, while CDK sets the marks only after the entrance ends. That half probably cannot fail.
- "should emit beforeOpened synchronously on open, before afterOpened" subscribes after `open()` has returned and sees the replay, so it cannot tell a synchronous emission from a later one. It duplicates "should replay beforeOpened to subscribers that missed the synchronous emission".
- The suite is named after `KbqActionsPanelModule`, which no test imports; every host provides `KbqActionsPanel` directly.

**Behaviour without a test.** The spec states these from the source:

- `KBQ_ACTIONS_PANEL_DATA` resolving to `null` without `data`;
- dependency resolution of component content through `injector` or the opening instance's injector;
- a replacing panel emitting `beforeOpened` only after the replaced one has closed;
- `KbqActionsPanelModule` providing an instance of its own;
- the result of the first close being kept when `close()` is called again;
- `keydownEvents`;
- `close()` on the service doing nothing when no panel is open;
- the vertical divider and the `undefined` result of the close button;
- Escape not closing the panel when focus is outside it, and the prevented default action;
- Escape with `disableClose`, since its only test cannot fail, and closing from code with `disableClose`;
- an outside click not closing the panel;
- overlays of the content not being scoped to the element;
- the `dir` attribute and the `'ltr'` default of `direction`;
- the reposition strategy as the default;
- router navigation not closing the panel;
- a per-call option winning over the default configuration;
- no focus trap and no focus restore on close;
- `role`, `aria-modal`, `tabindex` and the missing accessible name of the panel;
- the close button's tooltip text, the `KBQ_ACTIONS_PANEL_LOCALE_CONFIGURATION` default and `kbqActionsPanelLocaleConfigurationProvider`;
- `kbq-animations-disabled` and the events under reduced motion.
