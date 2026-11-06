# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are:

- `packages/components/sidebar/`: the component and its two content directives (`sidebar.component.ts`), the template, the styles, the module, the unit spec and the `sidebar.{en,ru}.mdx` and `examples.sidebar.{en,ru}.mdx` pages. The entry point has no `e2e.ts`, no Playwright spec and no nested deprecated entry point.
- The three docs examples under `packages/docs-examples/components/sidebar/` and the dev app in `packages/components-dev/sidebar/`, which embeds them.
- The API golden file `tools/public_api_guard/components/sidebar.api.md`.
- The parts of `packages/components/core` the sidebar relies on: the `KbqStateSaving` directive, the key resolver and the state stores in `state-saving/`, `kbqAnimationsDisabled()` and `kbqAfterAnimations()` in `animation/animations-state.ts`, the key helpers in `keycodes/keycodes.ts`, the `kbq-animations-off()` mixin, and the "Saving component state" section of `core.en.mdx`.

Every claim in the spec was checked against the source. The select baseline (`openspec/specs/select/spec.md`) is the only spec so far and sets the pattern this change follows.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the component, and every scenario can be checked by an existing test or by hand in the dev app.
- One place to diff against when sidebar behaviour changes later, including the persisted payload, which lives on in users' storage across releases.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Internals: private members, the docs-private `params`, `internalState`, `openedContent` and `closedContent` members, timers and change-detection details, layout CSS and the transition durations.
- The shared state-saving machinery beyond what a sidebar exposes: the storage envelope, expiry, the key resolver's algorithm and `KbqStateSavingService` itself belong to `core`.
- The splitter the docs pair the sidebar with, and changes to tests, docs or examples.

## Decisions

1. **The general decisions follow the select baseline.** One capability at a flat path named after the entry point (`sidebar`), written in English; the spec describes what ships, quirks included; only behaviour confirmed by a test or read directly in the source goes in; suspected defects and unbacked docs claims go to Findings. Only the sidebar-specific decisions follow.
2. **The content directives belong to the `sidebar` capability.** `kbq-sidebar-opened` and `kbq-sidebar-closed` have no behaviour of their own outside a sidebar: they only carry widths and mark content. A separate capability for them was considered and rejected.
3. **State saving is specified from the sidebar's side only.** The spec states when the sidebar reads and writes, what it writes (`KbqSidebarState`), and when it does neither (controlled, detached, turned off). How the store keeps the entry, how long and under which derived key is `core`'s and is referenced only by token name. A `state-saving` capability for `core` was considered and left for its own change: it would cover every persisting component, not just this one.
4. **What counts as contract for the sidebar.** In addition to the select list (public inputs, outputs, methods, selectors, export names, host classes, ARIA, thrown errors, exported constants):
    - the inline `min-width`, `width` and `max-width` of each state and the `32px` closed default;
    - the persisted payload shape, because changing it strands what users already have stored;
    - the timing of `stateChanged` and of the content switch relative to the width transition, because consumers react to them;
    - the bracket shortcut, its key matching and where it is ignored.

    The transition durations (100 ms closing, 200 ms opening) are styling and stay out.

5. **Timing claims rest on the source.** jsdom has no Web Animations API, so every transition in the unit suite ends right after the render it starts in, and only the `kbq-sidebar_toggling` test holds one open. The order of content switch, `stateChanged` and transition end is therefore checked by hand in tasks.md.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/sidebar` updates `openspec/specs/sidebar/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [A change to `KbqStateSaving` in `core` changes the sidebar's persistence without touching its directory] → The state-saving requirements name the directive's inputs and tokens, so a search for them finds this spec; a `core` change that alters them updates it too.
- [Many requirements rest on the source rather than on a test: timing, the shortcut, motion] → tasks.md checks them by hand in `yarn run dev:sidebar` before archiving. A mismatch is corrected in the delta, not in the code.
- [A defect gets recorded as intended behaviour] → Behaviour that looks unintended (the shortcut firing with Shift or inside a `contenteditable`, the width pinned by assigning `true`) stays out of the spec and is listed under Findings. Quirks the spec does state — no two-way binding, widths read once, every matching sidebar toggling — can change later through `MODIFIED`.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The JSDoc of `KbqSidebarState.width` says it is absent "while the sidebar has never been resized away from the width its content declares". The code leaves it out only while the opened width is `inherit`; a declared width such as `200px` is always written (unit test "persists the width the content declares").
2. The JSDoc of `saveState()` says it is called "whenever `opened` changes" and that the width "is only captured as the sidebar closes". It runs on every assignment of `opened`, including one that keeps the state, and the width is captured on any assignment while the sidebar is open and not transitioning.
3. The keyboard table on both docs pages says `[` and `]` open and close the left and right sidebar. It does not say that:
    - this needs `position`, which the pages never mention;
    - the physical key counts, so on a Russian layout it is the keys of "х" and "ъ";
    - only `input` and `textarea` are excluded;
    - every sidebar of that side toggles, a sidebar with a bound `opened` included.
4. `position` has no JSDoc. Its type, `SidebarPositions`, claims a value is always there, but the default is `undefined`. Its only effect is the choice of the shortcut key, while its name suggests it places the sidebar.
5. `stateChanged` has no JSDoc. Nothing says that it fires once after the first render with the initial state, or that it waits for the width transition.
6. The overview example binds `[opened]` and also calls `toggle()` on the same sidebars. With no two-way binding, after "Toggle left" the "Toggle left model" button first does nothing visible. The docs page says a bound `opened` means the application decides, which the example contradicts.
7. The "With splitter" example uses `KbqSplitterModule` from `@koobiq/components/splitter/deprecated`, although `@koobiq/components/splitter` exists.
8. The inputs of `kbq-sidebar-opened` and `kbq-sidebar-closed` have no JSDoc. Nothing says the widths are read once, or that unset values become `inherit` and `32px`.
9. `params` and `internalState` are public, writable and only marked `@docs-private`; writing either changes what the sidebar renders. The golden file also warns that the type of `params`, `KbqSidebarParams`, is not exported.

**Suspected defects (from reading the code, not reproduced)**

1. The shortcut ignores only the Meta key. Its modifier check looks for a `keyCode` of Shift, Control or Alt, which a `keypress` of a bracket never has, so Shift + `[` (typing `{`) and, on macOS, Option + `[` still toggle the left sidebar.
2. Only `input` and `textarea` targets are excluded. Typing `[` in a `contenteditable` editor, or on any other focused widget, toggles the sidebar.
3. The shortcut is a single character, always on for the whole document, and cannot be turned off or remapped except by leaving `position` unset. This conflicts with WCAG 2.1.4 (Character Key Shortcuts). It also relies on the deprecated `keypress` event.
4. The sidebar exposes its state to nothing but its content: no `aria-expanded` relation to a toggle control and no region. When it closes while focus is inside the opened content, the focused element leaves the DOM after the transition and focus falls back to `<body>`.
5. Assigning `true` to `opened` on an open sidebar captures its current pixel width as the opened width and persists it. A declared `inherit` or percentage width is then fixed in pixels. The first close does the same by design, so a `width="50%"` sidebar stops following its container after it has been closed once.
6. Widths are read once. A bound `[width]` on the content has no effect after initialization, and content added later, under an `@if` for example, gets the default widths.
7. Toggling twice before the first change is reported emits `stateChanged` once, with the state the sidebar already had: an event without a net change.

**Tests whose name and body disagree, or that cannot fail**

- "should render with default parameters" binds both `position` and `opened`, so it checks bound values, not defaults. `position` has no default at all.
- "persists nothing when the sidebar is not in the document as it initializes" checks only that nothing is restored and no warning is logged. It never changes the state, so it cannot catch a write.
- "persists nothing while the application drives the opened state" seeds `{ opened: false }` and then toggles the sidebar to `false`. The assertion fails on a write only because the captured width adds `width: '0px'`; a write without the width would pass.
- "should change position" only reads back the input. It does not check that the shortcut follows the new position.
- "restores the width alongside the opened state" asserts the docs-private `params.openedStateWidth`, not the host's inline width.

**Behaviour without a test.** The spec states these from the source:

- the `kbq-sidebar-opened` and `kbq-sidebar-closed` classes and the `kbqSidebarOpened` and `kbqSidebarClosed` export names;
- no two-way binding of `opened`;
- the content switch timing: the opened content at once on opening, the closed content after the transition on closing;
- the declared `min-width` and `max-width`, the `inherit` default and a declared closed width;
- widths read once;
- the `kbq-animations-disabled` class and the instant change under reduced motion;
- `stateChanged` for the initial state, its absence for an unchanged assignment, and a single event for rapid changes;
- a write on an assignment of the current state, and through the property and the shortcut;
- a non-string `width` dropped while `opened` is restored;
- writes going to the new key after a key change;
- no write from a detached sidebar;
- `saveState()` doing nothing on a sidebar that does not persist;
- `hasSavedState` being `false` while `useStateSaving` is `false`;
- `opened`, `toggle()` and `saveState()` being untracked inside an effect;
- the `]` key on a right sidebar, the `input`, `textarea` and Meta exclusions, the missing `position`, every matching sidebar toggling, and the shortcut's lifetime;
- no ARIA on the host or the content.
