# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are:

- `packages/components/list/`: `list-selection.component.ts`, `list.component.ts`, the two templates, `list.scss` where it defines behaviour (cursors, hover during a drag, the action reveal), both unit specs, `e2e.ts` and `e2e.playwright-spec.ts`;
- `list.en.mdx` and `examples.list.en.mdx`, and the examples under `packages/docs-examples/components/list/`;
- the API golden file `tools/public_api_guard/components/list.api.md`;
- the pieces of `packages/components/core` the list relies on: the key manager, `resolveMultipleMode`, the select-all helpers, `runCompareWith`, `kbqLeaveTabOrderOnTabOut`, `kbq-option-action`, `kbq-optgroup`, the pseudo-checkbox and the `select` locale section.

Every claim was checked against the source before going into the spec. The list has no deprecated nested entry point.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the component, and every scenario can be checked by an existing test or by hand in the dev app.
- One place to diff against when list behaviour changes later.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Internals: the key manager, the selection model and the other public members the docs mark private (`keyManager`, `selectionModel`, `navigableOptions`, `setSelectedOptionsByClick`, `onKeyDown`, …), timers below what a user notices, CSS structure and design tokens.
- `kbq-tree-selection`, `kbq-select`, `kbq-file-upload` and the behaviour of the shared core pieces beyond what a list exposes.
- Changes to tests, docs or examples.

## Decisions

The general decisions follow the select baseline (`openspec/changes/archive/2026-10-21-document-select-baseline/design.md`): English, the spec describes what ships with its quirks, only confirmed behaviour goes in, and suspected defects stay in the Findings. Component-specific decisions:

1. **One capability, `list`, at a flat path, covering every component of the entry point.** `kbq-list`, `kbq-list-item`, `kbq-list-selection`, `kbq-list-option` and `kbq-list-option-caption` ship and change together in `@koobiq/components/list`. The plain container takes one requirement. A separate `list-drag-drop` capability was considered and rejected: dragging shares the active option, the disabled state and the select-all row with selection, so a change to one usually touches the other.
2. **Drag and drop is in scope.** It is a third of the docs page and of the e2e suite, and consumers depend on the `dropped` contract (indices, `currentIndex` falling back to `previousIndex`) to apply moves themselves.
3. **Shared core pieces are described only as the list shows them.** `kbq-optgroup`, `kbq-option-action`, the pseudo-checkbox and the multiple-mode parser are specified by what a list option or list does with them — the action reveal, `Tab` into the action, a disabled group disabling options — not by their own contracts.
4. **What counts as contract.** These count:
    - the inputs, outputs and methods the docs present (`multiple`, `autoSelect`, `noUnselectLast`, `compareWith`, `selectAll`, `selectAllToggle`, `selectAllHandler`, `draggable`, `connectedTo`, `dragPreview`, `dragCursor`, `selectAll()`, `deselectAll()`, the option's `value`, `selected`, `disabled`, `draggable`, `toggle()` and `setSelected()`);
    - classes a consumer styles or tests against (`kbq-selected`, `kbq-focused`, `kbq-disabled`, `kbq-list-option_multiple`, `kbq-action-button-focused`, the horizontal and drag classes);
    - ARIA attributes, thrown error messages and development-mode warnings.

    Public members the docs do not present are left out even where the golden file lists them, because they expose the implementation.

5. **Quirks that ship go in as they are.** Examples:
    - every click emits `selectionChange`, also when nothing changed;
    - the value is an array in single selection too;
    - a removed selected option keeps its value in the form model;
    - `Shift`+click has no anchor after mouse-only interaction.

    Each fix belongs in its own change with a `MODIFIED` delta.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/list` updates `openspec/specs/list/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [Some requirements rest on the source rather than on a test] → tasks.md checks each of them by hand in `yarn run dev:list` before archiving. A mismatch is corrected in the delta, not in the code.
- [A defect gets recorded as intended behaviour] → Suspected defects stay out of the spec and are listed under Findings. Behaviour the spec does state can change later through `MODIFIED`.
- [The spec is long: 64 requirements, 113 scenarios] → It is grouped in the order of the docs page: selection, modes, value and forms, select all, groups and layout, action button, keyboard, copying, drag and drop, accessibility, the plain container.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The JSDoc of `noUnselectLast` says "Whether the last selected option can be deselected". It means the opposite: when it is `true`, the last selected option cannot be deselected.
2. The Keyboard section of `list.en.mdx` and `list.ru.mdx` says the arrows "move the active option". With `autoSelect` on, which is the default in single selection and keyboard mode, they also select it, and so do `Home`, `End`, `PageUp` and `PageDown`. The JSDoc of `autoSelect` mentions clicks only.
3. The docs say that in `multiple="keyboard"` the user extends the selection with `Shift` + click. `Shift`+click extends only from an anchor that keyboard navigation or an earlier range selection set. After mouse-only interaction it selects nothing.
4. The JSDoc of `selectAllHandler` says the default handler "toggles" the selection. It only selects, unless `selectAllToggle` is set or the select-all row is rendered.
5. The JSDoc of `multiple` lists `single` among the spellings of single selection. `single` is an unsupported value: it falls back to single selection with a development-mode warning, as the docs page says.
6. `checkboxPosition` on `kbq-list-option` carries a comment that it places the label before or after the checkbox, defaulting to `after`. The template never reads it, so it has no effect. The unit fixtures still set it.
7. The accessibility section names `externalPseudoCheckbox` as if it were an API. It is a protected getter; what the consumer does is project a `kbq-pseudo-checkbox`.
8. The drag-and-drop section says an option with `draggable="false"` cannot be picked up "by either the pointer or the keyboard". The same page says reordering is pointer-only.

**Suspected defects (from reading the code, not reproduced)**

1. `Ctrl`/`Cmd` with an arrow key moves the active option without changing the selection, but still emits `selectionChange` for the new active option and reports the value to the form control.
2. With `autoSelect` off and `noUnselectLast` on, a plain click still deselects the only selected option, while `Space`, `Enter` and `Ctrl`+click refuse to. The `list-action-button` docs example uses this combination: it is a single selection with `[autoSelect]="false"`.
3. In single selection, `Ctrl`/`Cmd` + `A` goes to typeahead as the letter "A": the active option jumps to one starting with "A", and the browser's default is not prevented. In multiple modes, `Ctrl` with any other letter except `C` also feeds typeahead.
4. Under virtual scrolling, the value reported after a user change holds only the selected options that are currently rendered. A selection scrolled out of view seems to drop out of the form value on the next change and then to be cleared when its option comes back.
5. Lists connected by `id` instead of by instance seem to get the `kbq-list-option_drop-forbidden` class and the `no-drop` cursor while the pointer is over them, although they accept the drop. A drop there reports the source list's `previousIndex` as `currentIndex`.
6. The page size for `PageUp` and `PageDown` is the list's own height divided by the first option's height. In a list scrolled by an outer container, such as the `kbq-scrollbar` of the `list-select-all` example, one page seems to be every option.
7. In a horizontal list with `autoSelect` on, `Up` and `Down` do not move the active option. They still re-select it and emit `selectionChange`.
8. Focus entering a list whose first selected option is disabled, or not rendered under virtual scrolling, stays on the list host and reaches no option.

**Tests whose name and body disagree, or that cannot fail**

- "should copy selected option - default handler" copies the active option, which is not selected.
- "should update the list value when an item is selected programmatically" asserts the selection model. Selection made in code does not update the value.
- "should focus and toggle the next item when pressing SHIFT + $direction" does not toggle: the range takes the anchor's selected state.
- "should update the options if a model value is set" asserts only the length of the array the test itself assigned, so it cannot fail.
- "should add preselected options to the model value" and "should handle preselected option both through the model and the view" use fixtures with no `[selected]` option. They only assert that the initial model value survives.
- "should set tabindex to "-1" in disabled state" renders a list without options. Such a list gets `tabindex="-1"` anyway, so the test cannot fail on the disabled rule; "should disable the list itself when the control is disabled" covers it.
- "should survive a comparator that throws and report it once per comparison" asserts only that a warning was logged, not how many.
- "should render the text preview by default" asserts the default input value and that no preview is rendered.
- "should reorder without changing the selection" starts with nothing selected, so its selection assertion cannot fail.
- "should refocus the option through the panel close output" asserts only that emitting does not throw.

**Behaviour without a test.** The spec states these from the source:

- with `autoSelect` on, a plain click deselects the other options in a multiple mode; any click emits `selectionChange` even when nothing changed;
- `Ctrl`/`Cmd` + click: toggling, and the refusal under `noUnselectLast`;
- the option's `showCheckbox` input and a projected `kbq-pseudo-checkbox` replacing the built-in one;
- the value listing option values in option order whatever the order of selection;
- an option deselected when its new value no longer matches the value the list holds;
- `selectAll()` and `deselectAll()` emitting neither `selectionChange` nor `onSelectAll`;
- the `kbq-disabled` class on the list host and the `kbq-list-option_multiple` class;
- in the list: the group named by its label, and keyboard navigation skipping the options of a disabled group;
- the option content slots: icon before the text, action after it;
- `Shift`+`Tab` from the action back to its option;
- arrow navigation not wrapping;
- the `noUnselectLast` guard on `Space`, `Enter` and `Shift` ranges;
- typeahead: it does not select, the text it matches includes the caption, and it wraps around;
- the default action of `Ctrl`/`Cmd` + `A` and `Ctrl`/`Cmd` + `C`: prevented by the default handlers, left alone with an `onCopy` subscriber;
- the select-all row keeping the built-in toggle under a custom `selectAllHandler`, and staying out of typeahead;
- `aria-hidden` on the drop indicator;
- an option moved into a connected list arriving unselected; no indicator in a list connected by `id`;
- the listbox having no accessible name of its own.
