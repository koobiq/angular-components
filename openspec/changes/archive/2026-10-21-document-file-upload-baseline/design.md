# Design

<!-- cspell:ignore dragover webkitdirectory -->

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are `packages/components/file-upload/`:

- the single and the multiple uploader components, their templates and the shared base;
- `dropzone.ts`, the primitives in `primitives/` and the locale tokens;
- the unit specs `file-upload.spec.ts`, `dropzone.spec.ts`, `primitives/file-drop.spec.ts` and `primitives/file-picker.spec.ts`;
- `e2e.ts` and `e2e.playwright-spec.ts`;
- the `file-upload.{en,ru}.mdx` and `examples.file-upload.{en,ru}.mdx` pages.

It also draws on the docs examples under `packages/docs-examples/components/file-upload/`, the API golden file `tools/public_api_guard/components/file-upload.api.md`, and the pieces of other entry points the uploader components rely on: the `fileUpload` and `a11y` locale data and `ErrorStateMatcher` in `packages/components/core`, `KbqIconButton`, `kbq-hint`, `kbq-list` and the CDK focus monitor. The component has no deprecated entry point. `openspec/specs/` holds only `select`, which this change does not touch.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the entry point, and every scenario can be checked by an existing test or by hand in the dev app.
- One place to diff against when file upload behaviour changes later.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Internals: private members, timers, change-detection details, CSS structure, and design tokens beyond `--kbq-file-upload-size-multiple-max-height`, which the docs tell consumers to set.
- `kbq-empty-state`, `kbqEllipsisCenter`, `kbq-progress-spinner`, `kbq-hint` and `FileValidators` beyond what an uploader exposes.
- Changes to tests, docs or examples.

## Decisions

The general decisions of the select baseline apply unchanged: English, the spec describes what ships with its quirks, only confirmed behaviour goes in, and suspected defects stay out of the spec and go under Findings. The decisions below are specific to this entry point.

1. **One capability, `file-upload`, for the whole entry point.** It covers the single and the multiple uploader, the full-screen and the local dropzone and the four primitives. Splitting off `file-upload/primitives` or `file-upload/dropzone` was considered and rejected:
    - the uploader components are built from the primitives;
    - the full-screen dropzone, the local dropzone and `kbqFileDrop` share one drop handler;
    - the full-screen dropzone is switched on through an uploader input.

    A change to drop handling would otherwise touch three specs.

2. **The primitives are contract.** `kbqFileUploadContext`, `kbqFileLoader`, `kbqFileList`, `kbqFileDrop` and `kbq-file-upload-empty-state` are exported and shown on the "Primitives" example. Their inputs, outputs and methods are specified like those of the uploader components.
3. **What counts as contract.** These count:
    - public input, output and method names;
    - selectors, including the `kbq-file-upload` / `kbq-file-upload[multiple]` split;
    - host and drop-area classes a consumer can style or test against: `kbq-single-file-upload_selected`, `kbq-disabled`, `kbq-error`, `kbq-selected`, `kbq-file-upload_compact` and `kbq-file-drop_dragover`;
    - the overlay classes `kbq-dropzone-overlay`, `kbq-fullscreen-dropzone`, `kbq-local-dropzone` and `kbq-dropzone-overlay__attached`;
    - ARIA attributes and the live region;
    - locale keys and exported constants.

    Members marked `@docs-private` do not count, with one exception: `deleteItem()` and `deleteFile()`. The unit tests call them from a consumer's `effect()` and pin that they do not make the effect re-run, so consumers are treated as relying on them (see Findings).

4. **Quirks are documented as they ship.** Examples:
    - the single uploader in `'file'` mode reads `single.captionTextWithFolder`, so `single.captionText` is never shown;
    - the single uploader ignores a `#kbqFileIcon` template;
    - under `concat`, a selection made only of duplicates still emits `filesAdded([])` and `filesChange` and dirties the control;
    - two equal files in one selection are both added;
    - `deleteItem()` without a file still emits `fileChange(null)`;
    - the files of a dropped folder come out in reverse order.

    Each fix belongs in its own change, with a `MODIFIED` delta.

5. **Scenarios quote `en-US` labels** for readability, although `ru-RU` is the default locale. The announcement scenario quotes `ru-RU` because its test does.
6. **Screenshot baselines back only what they show.** `01`–`06` cover visual states:
    - the captions per `allowed`;
    - the compact variant;
    - the disabled and error states;
    - the file size shown or hidden;
    - the progress modes.

    They do not assert DOM details such as classes, attributes or ids. Those are listed under "Behaviour without a test" even when a screenshot shows their effect.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/file-upload` updates `openspec/specs/file-upload/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [Some requirements rest on the source rather than on a test] → tasks.md checks each of them by hand in `yarn run dev:file-upload` before archiving. A mismatch is corrected in the delta, not in the code.
- [A defect gets recorded as intended behaviour] → Suspected defects stay out of the spec and are listed under Findings. Behaviour the spec does state can change later through `MODIFIED`.
- [Drag and drop cannot be exercised fully in jsdom] → The browser-specific paths are read from the source and checked by hand in Chromium:
    - reading folder entries;
    - the Safari variant of "the drag left the page", which compares coordinates with the viewport;
    - the browser's default action on a drop that is not prevented.

    The Safari path is not checked by hand.

- [The spec is long: 62 requirements, 99 scenarios] → It is grouped in the order of the docs page: flavours, adding files, display, `allowed` and captions, disabled and error states, list height, dropzone overlays, add strategy, `accept`, removal and keyboard, accessibility, localization, progress, forms, primitives.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The "Accessibility and keyboard" section (`en` and `ru`) says the tab order is the browse link, then the remove controls. In the multiple uploader the footer with the browse link comes after the list, so the remove controls come first. A single uploader holding a file renders no browse link at all.
2. The `file-upload-custom-text-via-input` example overrides `single.captionText`, which the single uploader never renders: in `'file'` mode it reads `single.captionTextWithFolder`. Only its `browseLink` override shows. The same example gives the single uploader a `#kbqFileIcon` template, which only the multiple uploader reads, so no icon is shown.
3. More generally, the `single.captionText` key ("Drag file here or {{ browseLink }}" in `en-US`) is unused by the component. Its localization test still asserts it.
4. The "Disabled state" section says drag and drop does not work. Files are not added, but with `fullScreenDropZone` set, the full-screen overlay still opens over the page for a disabled uploader, judging by the code: the service's `disabled` is not tied to the uploader's.
5. The JSDoc of `KBQ_DROPZONE_DATA` says it holds "the data that was passed in to a modal".
6. The JSDoc of `KbqDrop.disabled` opens with "Controls whether drag-and-drop functionality is enabled" for a flag that disables it. It says all drag events are ignored, but `kbqLocalDropzone` still opens its overlay on a drag entering while disabled (see Suspected defects).
7. The JSDoc of `fullScreenDropZone` says "Provide configuration object to enable, or undefined to disable". `true` also enables it, with an empty configuration, and `false` disables it.
8. The examples page ends with a "Dropzone" section that repeats the `file-upload-dropzone` example already shown under "Full-screen file uploader". That example drives the root `KbqFullScreenDropzoneService` directly; no example shows the `fullScreenDropZone` input.
9. The `file-upload-primitive` example puts `multiple` on the context, so the dialog allows several files, but its `onFileClicked` adds only `files.item(0)`.
10. `deleteItem()` and `deleteFile()` are `@docs-private`, yet the tests pin calling them from a consumer's `effect()`. `kbqLocalDropzone` also calls the `@docs-private` `onFileDropped()` of the connected uploader.

**Suspected defects (from reading the code, not reproduced)**

1. A file input given no id gets the string `"null"`: `[id]` is a property binding, and `input.id = null` stores `"null"`. This happens to:
    - the folder input of every uploader in `'folder'` and `'mixed'` mode without `id`;
    - any bare `kbqFileLoader` without `for`.

    Two such uploader components on a page share the id `null`. The same holds for `accept`, so the folder input has `accept="null"`.

2. A static `id` attribute on the uploader host (`<kbq-file-upload id="avatar">`) stays on the host element and is also forwarded to the hidden file input, so two elements share it. In `'mixed'` mode the folder input gets it as well, so even a bound `[id]` ends up on two inputs.
3. Reading a dropped folder calls `readEntries()` once per directory. Chromium returns entries in batches of about 100, so the files of a larger folder past the first batch are silently lost.
4. `kbqLocalDropzone` does not filter the drag-enter event by `disabled`. While disabled, it opens its overlay, but the overlay's handlers of the drag-over, drag-leave and drop events are filtered. The overlay then never closes on leave, and a drop is not prevented, so the browser may open the file.
5. In a browser without `DataTransferItem.webkitGetAsEntry`, a drop logs the "not supported" warning and then calls that missing method, so the drop throws instead of falling back to plain files.
6. The single uploader sets `hasError` on its item only when the control status changes, through `distinctUntilChanged`. If an invalid file replaces another invalid one, the status stays `INVALID` and the new item keeps `hasError` unset. The uploader still shows the error state through `errorState` once touched. The flag is also written onto the consumer's item object.

**Tests whose name and body disagree, or that cannot fail**

- "should NOT toggle label focus state on input focus if disabled" (both flavours) dispatches `focusin`. The CDK focus monitor listens to `focus`, so the class is never set whatever `disabled` is.
- "should disable fileDrop directive" (both flavours) asserts at once after the drop, but the drop handler emits only after a promise chain. It would pass with the drop area enabled.
- `FileDropDirective: drop without files` asserts synchronously, but any emission would be asynchronous, so it cannot fail.
- `KbqFullScreenDropzoneService`:
    - "should create overlay if not already attached" and "should create overlay with correct configuration" have the same body;
    - neither covers the "already attached" branch the first name names;
    - the test that sets up the drag-enter listener and "should pass config to open method" overlap;
    - so do "should unsubscribe from all event listeners" and "should prevent future events after stop is called".
- "should use element dimensions for overlay size" sets a width and height that jsdom never lays out. `offsetWidth` and `offsetHeight` stay 0 on both sides of the comparison.
- `KbqFileUploadContext`:
    - "disabled input — should have false as default value" asserts the `false` the fixture binds; the real default is `null`;
    - "multiple input — should have null as default value" asserts `toBeFalsy()` on the `false` that `booleanAttribute(null)` returns;
    - both "should transform string to boolean" tests bind a boolean, not a string, and `onlyDirectory` has no transform.
- "should listen to filesDropped via dropzoneService" (both flavours) builds its files with `{ ...createMockFile() }`. That copies none of the `File` getters, so the items have no name or size.
- "should report the files a drop discarded through rejected" sits under "with accessibility".
- The test hosts `BasicMultipleFileUpload` and `ControlValueAccessorMultipleFileUpload` share the selector `control-value-accessor-multiple-file-upload`.

**Behaviour without a test.** The spec states these from the source, or from a screenshot that does not assert them:

- the module exports;
- clearing the native input after a selection;
- a drop replacing the file of the single uploader;
- a folder chosen in a single uploader emitting the extra files through `rejected`;
- the classes `kbq-single-file-upload_selected` (only its absence is asserted), `kbq-selected`, `kbq-file-upload_default` and `kbq-file-upload_compact`, and `kbq-disabled` on the drop area and the rows;
- the empty multiple layout, the title, the captions per mode and per size, and `showFileSize` (screenshots only);
- the projected icon of the single uploader, the `#kbqFileIcon` context of the multiple one, and the single uploader ignoring that template;
- `webkitdirectory` on the folder input and no `accept` on it;
- removal ignored while disabled, and the remove controls' `aria-disabled` and tab order;
- no error state without a form directive;
- the single uploader setting `hasError` from the control status;
- the row `kbq-error` class and the error color of its remove control;
- the list height cap (the flash fixture only relies on it), and no scrollbar flash after a removal;
- the service's `disabled`, the overlay content (title, caption, size), focus capture and its return, `autoCapture`;
- the local overlay closing when the directive is destroyed;
- equal files in one selection both being added, and the form write after a selection of duplicates only;
- an empty drop marking the control touched;
- Enter, Space (and its prevented scroll) and Backspace on the remove controls;
- `fileRemoved` with the index, and `itemRemoved` re-emitted by the multiple uploader;
- `deleteItem()` without a file, and `deleteFile()` with an index outside the list;
- the keyboard or program focus origin after a removal;
- the role and name of the single remove control;
- the tab order;
- the `a11y.filesNotAdded`-only announcement;
- the subjects of items the uploader creates;
- unbound `[file]` / `[files]` keeping a value written by code;
- server rendering;
- the default ids and the `id` input of the uploader components;
- `kbqFileDrop` ignoring a leave into a child, preventing the default, and `disabled`;
- dropped items that are not files being ignored;
- the multiple uploader rendering the empty state at the `'normal'` size.
