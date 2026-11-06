# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are `packages/components/notification-center/` (the trigger and panel in `notification-center.ts` and `.html`, the row in `notification-item.ts` and `.html`, the service, the tokens, the stylesheets where they decide visibility, the unit spec, `e2e.ts` and the Playwright spec), the pop-up base classes, the read-state directive, the locale data and the locale overrides directive in `packages/components/core`, the overlay click and scroll dispatchers of `@angular/cdk`, the `notification-center.{en,ru}.mdx` pages, the six docs examples under `packages/docs-examples/components/notification-center/`, the dev app and the API golden file `tools/public_api_guard/components/notification-center.api.md`. Every claim was checked against the source before going into the spec.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the component, and every scenario can be checked by an existing test or by hand in the dev app.
- One place to diff against when notification center behaviour changes later.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Internals: private members, timers, change-detection details, CSS structure and design tokens beyond the custom property `popoverHeight` writes.
- The toast, dropdown, navbar and badge components, and the deprecated locale tokens.
- Changes to tests, docs or examples.

## Decisions

The general decisions follow the select baseline (`openspec/changes/archive/2026-10-21-document-select-baseline/design.md`): one capability at a flat path named after the entry point, English, the spec describes what ships with its quirks, only confirmed behaviour goes in, and the same rules for what counts as contract. Specific to this component:

1. **The trigger, the panel and the service are one capability.** The panel only renders the service state, and the trigger only opens the panel and forwards its inputs; a change to one of them almost always shows in the others. Splitting off a `notification-center/service` capability was considered and rejected for that reason.
2. **The panel component counts as contract although it is `@docs-private`.** `KbqNotificationCenterModule` exports it, the Playwright fixtures render `<kbq-notification-center>` in place, and the overlay pane class and `data-testid` values are what consumer tests locate. They are in the spec; the component's members are not.
3. **Requirements are phrased against the rendered panel where possible, and against the service where the panel adds nothing.** `groupedItems` is `@docs-private`, so the grouping and ordering requirements describe the rendered groups, although the tests read the signal.
4. **Inputs that have no visible effect stay out of the spec.** `offset` and `backdropClass` are public inputs, but reading the code says they change nothing on screen. Writing "`offset` SHALL do nothing" into a baseline would turn a probable defect into a contract, so both are listed under Findings instead. `kbqNotificationCenterPlacement` is in the spec only as the value it writes to the trigger's `placement`, which a test asserts; that it does not move the panel is a finding.
5. **What a click on the open trigger does is left out.** The unit test says a second click keeps the panel open, but the test cannot observe the close that the code schedules (see Findings). The outside-click requirement is scoped to elements other than the trigger until that is settled.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/notification-center` updates `openspec/specs/notification-center/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [Some requirements rest on the source rather than on a test] → tasks.md checks each of them by hand in `yarn run dev:notification-center` before archiving. A mismatch is corrected in the delta, not in the code.
- [A defect gets recorded as intended behaviour] → Suspected defects stay out of the spec and are listed under Findings. Behaviour the spec does state can change later through `MODIFIED`.
- [Several requirements depend on layout that jsdom does not compute: placement, height, the hidden delete buttons, the read-state reflow] → They are backed by the Playwright suite where it covers them, and checked by hand otherwise.
- [The spec is long: 70 requirements, 95 scenarios] → It is grouped in the order of the docs page: trigger and panel, header, list and rows, read state and counter, empty, loading and error states, infinite scroll, deletion, popover mode and positioning, the service, accessibility, localization and packaging.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The JSDoc of `placement` ("Placement of popUp") and the `kbqNotificationCenterPlacement` input suggest the panel can be placed. The bound value is stored, but the panel keeps opening on the right (see the first suspected defect).
2. The JSDoc of `offset` ("Offset of popUp") and of `backdropClass` ("Class that will be used in the background") describe effects that never happen: the panel never gets the placement class the margin helper looks for, and the overlay is created with `hasBackdrop: false`.
3. The JSDoc of `popoverHeight` says the default is `calc(100vh - <navbar height>)`. That holds in popover mode only; the input also sets the height of the side panel, whose default is `100vh`.
4. The JSDoc of `onRead` says it "emits a notification the moment it flips from unread to read". It is a `BehaviorSubject`, so a new subscriber first receives `null` or the last notification read, long after the fact.
5. The JSDoc of `hasMore` and the docs ("page by page as the user scrolls to the bottom") describe `onNextPage` as a scroll event. It also fires without any scroll: when the panel opens with a list that does not fill it, and after every state change of the service, `setSilentMode()` and `push()` included, while the list is at its end. `hasMore()` is `true` by default, so a consumer that never pages still gets these emissions.
6. In `KbqNotificationCenterLocaleConfiguration`, `remove` is documented as the name of "a single notification's remove button", but it also names the group delete button and is its tooltip. `removeAll` is documented as the label of the delete-all action, but it is only its tooltip: the accessible name comes from `a11y.removeAll`, so overriding `notificationCenter.removeAll` leaves the name unchanged, and in `en-US` the two differ ("Remove all" and "Delete all").
7. The overview says the menu shows an unread counter that is hidden at 0 and reads "99+" above 99. The trigger renders no counter. It exposes `unreadItemsCounter`, and the badge is markup in the examples.
8. The overview says each item has a title and a timestamp. The time and the unread marker are rendered inside the title line, so a notification without a `title` shows neither.
9. The English error section names a "Repeat" button; the `en-US` string for it is "Try again".
10. `KbqNotificationCenterComponent` is `@docs-private`, yet the module exports it and the e2e fixtures render it in place. The docs page does not say whether that is supported. `KbqNotificationCenterTrigger` itself has no JSDoc.
11. The JSDoc of `KbqNotificationItem.style` says it selects the built-in icon. A style other than `contrast`, `success`, `warning` or `error` renders an empty icon container.

**Suspected defects (from reading the code, not reproduced)**

1. `kbqNotificationCenterPlacement` does not move the panel. The trigger's constructor sets a placement priority of `right`, `rightBottom`, `rightTop`, and the positions come from that priority whenever one is set; the input only changes `placement`. Only `popoverMode` replaces the priority.
2. `offset` (default 8) is never applied. The margin helper looks for a `kbq-notification-center_placement-*` class on the panel host, but the panel never binds the class map its trigger computes.
3. `backdropClass` has no effect, because the overlay never has a backdrop.
4. `kbqNotificationCenterPanelClass` is passed to the overlay as one token. A value with several space-separated classes reaches `classList.add()` whole, which throws `InvalidCharacterError`. A change after the first open is ignored, because the overlay is created once.
5. Every close moves focus to the trigger, including a close caused by an outside click or an outside scroll. A user who clicks into a text field elsewhere on the page while the panel is open loses that focus to the trigger.
6. The silent-mode switch is named after the current mode in the wording of an action: while pop-up notifications are on, it reads "Turn on notifications" in `en-US`. The two menu options show which mode is active only with a visual mark; they carry no checked state.
7. The delete buttons of every row and every day group share one accessible name ("Delete" in `en-US`), with nothing to tell the notification or the day apart.
8. `[disabled]` on a plain `<button>` trigger, without `kbq-button`, is taken by the directive's input, so the button itself stays enabled and focusable, and the trigger sets no `aria-disabled`.
9. `scrolledToBottomOffset` and `popoverMode` are handed to the panel only when it opens; a change while it is open is ignored, unlike `popoverHeight`.
10. A `<kbq-notification-center>` rendered in place moves focus to its silent-mode switch as soon as it renders, as it does when opened from a trigger.

**Tests whose name and body disagree, or that cannot fail**

- "opens on click, and a repeat click is not a toggle": the second click's outside-click handler calls `hide()` from inside a timer, so the panel's zero-delay hide timeout fires 1 ms later on the fake clock, and `runOnlyPendingTimersAsync()` never runs it. The assertion passes whether or not the second click closes the panel, and reading the code suggests that in a browser it does.
- "keeps the side placement when popoverMode is explicitly turned off" and "falls back to the default placement" read only the `placement` property, never where the panel is, which is where the first suspected defect hides.
- "traps focus inside the panel" checks only that the focus trap directive is enabled; the Playwright test "focus stays inside the open panel" is the one that tabs.
- "scrolls the list smoothly by default" checks only that `kbq-animations-disabled` is absent. The unit tests load no stylesheet, so the smooth scrolling itself is never observed.
- "shows the bottom "load more" spinner without replacing the list" opens an empty panel, so there is no list to replace. Its second assertion, that the full-size loader is absent, cannot fail, because `setLoadingMore()` never shows that loader.
- The Playwright test "the delete buttons are reachable with the keyboard" only expects a group delete button in the tab order, not a row delete button.

**Behaviour without a test.** The spec states these from the source:

- Space on the trigger opening the panel;
- disabling an open trigger closing it;
- the trigger classes `kbq-notification-center_open` and `kbq-active`;
- `kbqNotificationCenterPanelClass` on the overlay pane;
- the default side position and its fallbacks, and `kbqPlacementChange`;
- an outside click closing the panel, and a click in the silent-mode menu not closing it;
- the close button closing the panel;
- the label, tooltip and icon of the silent-mode switch, the "show pop-up notifications" option and the mark on the active option;
- the delete-all button staying visible in loading and error modes;
- `content`, `actions`, `iconClass` and an `icon` template in a row;
- the `HH:mm` time, which only the screenshots show, and a row without a title showing no time and no unread marker;
- the delete controls hidden until hover or focus, and the time hidden while they show;
- a pointer dwell marking a notification read;
- `onRead` replaying its latest value;
- error mode winning over loading mode, and staying on after the reload button;
- the bottom retry button moving focus to the list;
- the noop animations module and reduced motion turning smooth scrolling off;
- the position and the `kbq-notification-center_popover` class in popover mode;
- the default panel heights;
- `stickToWindow` with `top`, `bottom` or `left`;
- the service failing without a `DateAdapter` or `DateFormatter`;
- `kbqLocaleOverrides` on an ancestor of the trigger;
- the status text in error mode and with the bottom error row alone.
