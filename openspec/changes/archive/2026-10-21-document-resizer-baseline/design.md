# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are `packages/components/resizer/` (`resizer.ts`, `module.ts`, the unit spec `resizer.spec.ts` and the `resizer.{en,ru}.mdx` and `examples.resizer.{en,ru}.mdx` pages), the overview example in `packages/docs-examples/components/resizer/`, the API golden file `tools/public_api_guard/components/resizer.api.md`, and `kbqInjectNativeElement` and `KBQ_WINDOW` from `packages/components/core`. The resizer has no `e2e.ts` and no Playwright spec of its own. `kbq-splitter`, `kbq-content-panel` and `kbq-dl` were read only to see how hosts use the directives. Every claim was checked against `resizer.ts`; the docs and test names were not taken on trust.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the directives, and every scenario can be checked by an existing test or by hand.
- One place to diff against when resizer behaviour changes later, including the details its hosts depend on (`disableSizeUpdate`, the drag-start baseline, the document cursor).

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Internals: private members, the order in which listeners are attached, change-detection and zone details. The `element` property of `KbqResizable` is `@docs-private`, so it is not part of the contract either.
- What the hosts add on top of the resizer: the keyboard resizing, double-click reset, clamping and ARIA of `kbq-splitter`, `kbq-content-panel` and `kbq-dl` belong in their own specs.
- Styling: the directives ship none, and the look of a handle is the consumer's.
- Changes to tests, docs or examples.

## Decisions

The general decisions follow the select baseline (`openspec/changes/archive/2026-10-21-document-select-baseline/design.md`): one capability at the flat path of the entry point, English, the spec describes what ships with its quirks, only confirmed behaviour goes in, and the same rule for what counts as contract. Only the resizer-specific ones are listed here.

1. **One capability for both directives and the module.** A `kbqResizer` cannot be created without a `kbqResizable` around it, and the container does nothing on its own, so splitting them would leave each spec describing half of one behaviour.
2. **The directives, not their hosts.** The splitter, the content panel and the description list each wrap the resizer in their own rules. The spec stops at what the directives do, so a host change does not touch it and a resizer change shows its effect on every host at once.
3. **Quirks stated as they ship.** Examples:
    - the size is not clamped and can be negative;
    - the direction is not mirrored in a right-to-left layout;
    - a handle has no keyboard, ARIA or `touch-action` of its own;
    - a handle with `[0, 0]` gets an inline `cursor: default`;
    - a computed size that is not a number counts as 0.

    A baseline that already "fixed" these would hide the change that fixes them.

4. **Global side effects count as contract.** The inline `cursor` with `!important` on `document.body` during a drag is visible to the whole page, and a consumer that sets its own body cursor relies on it being restored, so it is a requirement.
5. **Angular's own error is named by code only.** A handle without a container fails with Angular's missing-provider error. The library does not own its text, so the spec names `NG0201` and `KbqResizable` and nothing more.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/resizer` updates `openspec/specs/resizer/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [Some requirements rest on the source rather than on a test] → tasks.md checks each of them by hand before archiving. A mismatch is corrected in the delta, not in the code.
- [A defect gets recorded as intended behaviour] → Suspected defects stay out of the spec and are listed under Findings. The quirks the spec does state, such as the missing clamping or `touch-action`, can change later through `MODIFIED`.
- [Hosts rely on more than the spec says] → The details the splitter and the description list depend on (`disableSizeUpdate`, the drag-start baseline, mid-drag cursor changes) are requirements. Anything else a host needs belongs in that host's spec.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. `resizer.en.mdx` and `resizer.ru.mdx` say the element is resized "using the mouse pointer". The directive listens to pointer events, so a pen or the first finger on a touch screen drags too.
2. The overview page documents only the direction. `cursor`, `disableSizeUpdate`, `resizeStart`, `sizeChange`, the box-model rule for the starting size, the body cursor during a drag and the missing keyboard and ARIA support are not on it.
3. `examples.resizer.en.mdx` and `examples.resizer.ru.mdx` are "Documentation in progress" placeholders. `structure.ts` sets `hasExamples: false` for the resizer, so neither page is routed.
4. The JSDoc of `sizeChange` says it emits "the new size of the element after resizing". It emits on every pointer move of the drag, the size the drag asks for: not clamped, not written at all under `disableSizeUpdate`, and not necessarily the size the element renders at.
5. The JSDoc of `KbqResizerSizeChangeEvent` calls it the event "emitted when the size of the resizable element changes". It is also the payload of `resizeStart`, and `sizeChange` emits it when nothing has changed since the previous move.
6. The overview example gives five `[0, 0]` filler cells a `(sizeChange)` handler that can never fire, and the example offers no alternative to dragging, which WCAG 2.2 success criterion 2.5.7 (Dragging Movements, level AA) asks for.

**Suspected defects (from reading the code, not reproduced)**

1. The directive sets no `touch-action` on the handle. On a touch screen the browser may take the gesture for panning and send a pointer cancel event, which ends the drag. `kbq-splitter` and `kbq-dl` set `touch-action: none` on their handles; `kbq-content-panel` and the docs example do not.
2. When a drag asks for a negative size, the browser rejects the negative pixel value, so the element keeps the last size written while `sizeChange` keeps reporting negative numbers.
3. Under `border-box` the starting size comes from `getBoundingClientRect()`, which includes CSS transforms. Inside a scaled ancestor the element jumps on the first move. In both box models the pointer travel is in screen pixels while `width` is in local CSS pixels, so under a scale the edge does not follow the pointer.
4. Two drags at once with primary pointers of different types (a mouse on one handle, a pen on another) each save the body cursor they find. If the first drag ends first, the second one later restores the first handle's resize cursor and leaves it on the body.
5. A direction change during a drag applies the new direction to the starting size and the whole travel, so the size jumps. Changing it to `[0, 0]` does not end the drag; unless `cursor` is set, the body cursor turns to `default`, and `sizeChange` keeps reporting the starting size.
6. Preventing the default action of the pointer-down event that starts a drag suppresses the compatibility mouse-down and mouse-up events, so a consumer's mouse-down listener on a handle does not run. Click and double-click events still fire, which the content panel and the description list rely on.

**Tests whose name and body disagree, or that cannot fail**

- "should fall back to the direction-derived cursor when the `cursor` input is empty" sets the input to `null`; the empty-string branch is not tested.
- "should ignore secondary buttons and non-primary pointers" moves pointer 1 after the non-primary press of pointer 2, so its `sizeChange` assertion cannot catch a broken non-primary guard. Only the body-cursor assertion would.
- The `resizeStart` test for presses "that do not start a drag" (`resizer.spec.ts:278`) covers secondary buttons and non-primary pointers only, not a `[0, 0]` handle or a second press during a drag.
- Four tests are declared `async` but await nothing: "should emit sizeChange event when resizing", "should NOT emit sizeChange event when mouse button is released (buttons = 0)", and the tests at `resizer.spec.ts:300` (no `sizeChange` without a press) and `resizer.spec.ts:436` (resizing stops on release).

**Behaviour without a test.** The spec states these from the source:

- the `kbq-resizable` and `kbq-resizer` classes and the `exportAs` names;
- nested containers, and the missing-provider error without a container;
- the sizes for `-1` directions (only their cursors are tested);
- no mirroring in a right-to-left layout;
- an empty-string `cursor` falling back to the derived one;
- `preventDefault()` on the pointer-down event that starts a drag;
- a computed size that is not a number counting as 0;
- no clamping;
- the element keeping its last written size after the drag;
- no keyboard, ARIA, stylesheet or `touch-action` of its own;
- server rendering;
- `KbqResizerModule`.
