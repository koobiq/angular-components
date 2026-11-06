# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/splitter/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/splitter`, and verify the splitter unit suite passes on the baseline commit
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/splitter` and verify the splitter e2e suite passes. It backs the drag, limit, collapse, snap, nesting, disabled, transparent appearance, focus frame and content area requirements
- [ ] 1.3 For each requirement in `specs/splitter/spec.md`, name at least one unit or e2e test that asserts it. Verify that every requirement without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour

Verify first that `package.json` has the `dev:splitter` script (`ng serve dev-splitter --port 3003`). Run the checks below in `yarn run dev:splitter` (http://localhost:3003), using the docs examples embedded there. The `layout` and `collapsed` models can be read and written from the browser console through `ng.getComponent(element)`, which Angular exposes in development mode.

- [ ] 2.1 Verify the drag state in the DOM:
    - while a separator of the overview example is held, the splitter has `kbq-splitter_dragging`, and dragging over panel text selects nothing;
    - the class is gone after the release;
    - in the collapsible example, the "Sidebar collapsed" toggle adds and removes `kbq-splitter-panel_collapsed` on the sidebar panel
- [ ] 2.2 Verify the keyboard on separators:
    - in the vertical orientation example, Up and Down Arrow move the separator by 8 px, and Left and Right Arrow do nothing;
    - Ctrl+Home and Alt+Down Arrow change nothing;
    - in the disabled example, a separator focused from the console with `.focus()` ignores Home, End and Enter;
    - in the collapsible example, End on the separator of the collapsed sidebar expands it and grows it to 200 px, while Enter on the separator between Editor and Terminal does nothing
- [ ] 2.3 Verify snapping in the snap example:
    - a drag released with Panel 2 at about 220 px moves it to 200 px, its `minSize`;
    - the arrow keys move the separator 8 px per press without pulling Panel 2 onto 300 px or 400 px
- [ ] 2.4 Verify the `layout` model on the constraints example from the console:
    - after a drag, `layout()` returns three percentages that add up to 100;
    - `layout.set([10, 30, 60])` shows Panel 1 at its 125 px minimum while `layout()` still returns `[10, 30, 60]`;
    - `layout.set([10, 90])` leaves the panels at their declared sizes
- [ ] 2.5 Verify by reading `splitter.ts` the behaviour the dev app cannot show:
    - the right-to-left drag direction and cursors in `resizerDirection` and `separatorCursor`;
    - a wrapped panel rendering no separator (`contentChildren` with `descendants: false`, and `last()` for an index of `-1`);
    - equal tracks on the server (`afterNextRender`);
    - `kbqSplitterOptionsProvider` spreading over the built-in defaults;
    - the warning only under `isDevMode()`;
    - a `maxSize` below the `minSize` raised to the minimum;
    - `separatorAriaLabel` with the locale fallback, and the host `id`;
    - only the two panels beside the dragged separator collapsing by drag;
    - snapping only in `handleResizeEnd` and the seeded sizes, never on the keyboard path;
    - `exportAs` and `KbqSplitterModule`

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-splitter-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed

## Workflow follow-up

- Archive with `/opsx:archive document-splitter-baseline` once the checks pass. This creates `openspec/specs/splitter/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The keyboard not reaching a collapsible trailing panel is the most user-visible one, followed by the nested options provider and the docs claim about a panel collapsed to nothing.
