# Proposal

## Why

`openspec/specs/` has no contract for the file upload yet. `@koobiq/components/file-upload` ships a single and a multiple uploader, a full-screen and a local dropzone and a set of primitives (about 2,300 lines of source and 3,900 lines of unit tests), and what they promise consumers is spread across the source, the unit and e2e tests and the MDX docs. A baseline spec of the current behaviour lets later file upload changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it each time.

## What Changes

- Add the `file-upload` capability: the observable behaviour of `kbq-single-file-upload`, `kbq-multiple-file-upload` (both also reachable as `kbq-file-upload`), the full-screen dropzone, `kbqLocalDropzone` and the primitives `kbqFileUploadContext`, `kbqFileLoader`, `kbqFileList` and `kbqFileDrop`, as they ship on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover adding files by the system dialog and by drag and drop, the `allowed`, `accept` and `addStrategy` inputs, rejected files, removing files with pointer and keyboard and where focus goes next, upload progress, captions and the compact variant, the disabled and error states, forms integration, the live-region announcements, accessibility and localization.
- Record behaviour that the docs and the code disagree on, suspected defects and tests that cannot fail as findings in `design.md` instead of fixing them here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `file-upload`: the behaviour contract of the single and the multiple uploader, the full-screen and the local dropzone and the primitives in `@koobiq/components/file-upload` — what a consumer can rely on when they render an uploader, bind it to a form, and a user adds or removes files with the mouse, the keyboard, drag and drop or assistive technology.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-file-upload-baseline/` now, and `openspec/specs/file-upload/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components (`kbq-empty-state`, `kbqEllipsisCenter`, `kbq-progress-spinner`, `kbq-hint` and `FileValidators` beyond what an uploader exposes), deprecated APIs, visual styling and design tokens beyond the ones a consumer sets, and internals such as private members and timers.
- From then on, a change that alters file upload behaviour updates this spec through a `MODIFIED` delta.
