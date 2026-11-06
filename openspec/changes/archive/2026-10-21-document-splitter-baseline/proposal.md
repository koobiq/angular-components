# Proposal

## Why

`openspec/specs/` holds only the `select` capability, so a change to `kbq-splitter` has no contract to diff against. The splitter is new (about 1,200 lines of source, 1,200 lines of unit tests and 640 lines of Playwright tests), and what it promises consumers — how sizes resolve, how a drag, the keyboard and snapping move a boundary, how panels collapse and how the `layout` binding behaves — is spread across the source, the tests, the JSDoc and the MDX page. A baseline spec of its current behaviour lets later splitter changes be written as `MODIFIED` deltas against a known contract.

## What Changes

- Add the `splitter` capability: the observable behaviour of `kbq-splitter` and `kbq-splitter-panel` as they ship on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover the panel structure and grid layout, pointer dragging and the cursor, appearance and the app-wide options, orientation, the disabled state, sizes and constraints, the `layout` two-way binding, snapping, collapsing, nested splitters, keyboard interaction, double-click, accessibility and the localized separator name.
- Record behaviour that the docs and the code disagree on, suspected defects and gaps in the tests as findings in `design.md` instead of fixing them here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `splitter`: the behaviour contract of `kbq-splitter` and `kbq-splitter-panel` from `@koobiq/components/splitter` — what a consumer can rely on when they lay panels out in a splitter, bind its layout and collapsed state, and a user resizes the panels with a pointer, the keyboard or assistive technology.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-splitter-baseline/` now, and `openspec/specs/splitter/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components, including `kbqResizer` and `kbqResizable` from `@koobiq/components/resizer` beyond what the splitter exposes through them; the deprecated `@koobiq/components/splitter/deprecated` entry point; visual styling and design tokens; and internals such as the sizing helpers and the `KbqSplitterGroup` handler methods.
- From then on, a change that alters splitter behaviour updates this spec through a `MODIFIED` delta.
