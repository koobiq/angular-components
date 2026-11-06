# Tasks

<!-- cspell:ignore dragover webkitdirectory -->

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/file-upload/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/file-upload`, and verify the four file upload spec files pass on the baseline commit
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/file-upload` and verify the file upload e2e suite passes. It backs the long-name truncation, the scrollbar flash, the dropzone overlays and the screenshots of the captions, the compact variant, the disabled and error states and the progress modes
- [ ] 1.3 For each requirement in `specs/file-upload/spec.md`, name at least one unit or e2e test that asserts it. Verify that every requirement without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour in the dev app

`yarn run dev:file-upload` exists in `package.json`. Run each check there (http://localhost:3003), using the e2e scenarios and the docs examples embedded in it and its locale selector, unless the task names another way.

- [ ] 2.1 Verify in the DOM:
    - a single uploader holding a file has `kbq-single-file-upload_selected`;
    - a filled multiple uploader's drop area has `kbq-selected`;
    - an empty one has `kbq-file-upload_default` or, when compact, `kbq-file-upload_compact`;
    - a disabled uploader has `kbq-disabled` on its drop area and on every row
- [ ] 2.2 Verify the file inputs:
    - with `allowed="mixed"`, the folder input has `webkitdirectory` and the file input does not;
    - the folder input carries no real `accept` value;
    - without `id`, the file input's id starts with `kbq-single-file-upload-` or `kbq-multiple-file-upload-`
- [ ] 2.3 Switch to `en-US` and verify the captions match the scenarios of "Caption of the single uploader" and "Caption of the multiple uploader" for `'file'`, `'folder'` and `'mixed'`, empty, compact and with files. In the `file-upload-custom-text-via-input` example, verify:
    - the single uploader does not show its overridden `captionText`;
    - it shows no icon from its `#kbqFileIcon` template
- [ ] 2.4 Verify these display details:
    - `[showFileSize]="false"` hides the size of a single file;
    - the multiple uploader shows the item-dependent icon of the `file-upload-allowed` example;
    - the empty multiple uploader shows the title and the caption
- [ ] 2.5 Verify adding files:
    - choosing the same file twice in a single uploader is reported both times;
    - dropping a file on a single uploader that holds one replaces it;
    - choosing a folder of several files in a single uploader with `allowed="folder"` (a cell of the e2e state table) keeps the first, and a `rejected` subscription made through `ng.getComponent()` in the console receives the rest;
    - dropping selected text, not a file, adds nothing
- [ ] 2.6 Verify the concat strategy in the `file-upload-multiple-required-reactive-validation` example, reading its `fileUpload` control through `ng.getComponent()` in the console:
    - choosing only duplicates leaves the list unchanged but marks the control dirty;
    - in that case the live region reads only the `filesNotAdded` text;
    - two equal files (same name, size, type and `cp -p` time) dropped together from two folders are both added
- [ ] 2.7 Verify removal with the keyboard:
    - Enter, Space and Backspace on a remove control remove the file;
    - Space does not scroll the page;
    - after Backspace the new focus target, or the label of a focused file input, has `cdk-keyboard-focused`, and after Enter `cdk-program-focused`;
    - a disabled remove control has `aria-disabled="true"` and no `tabindex`;
    - removal is ignored while disabled
- [ ] 2.8 Verify the tab order through a multiple uploader with two files: the two remove controls, then the file input of the footer's browse link. Verify that a single uploader holding a file offers only its remove control
- [ ] 2.9 Verify the error states:
    - in the `file-upload-single-async-validation` example, a file the validator rejects gets `hasError` and the uploader shows the error state;
    - in the `file-upload-multiple-error-filled` example, a row with an error has the `kbq-error` class on its content and an error-colored remove control, while the drop area has no `kbq-error`;
    - by reading `ngDoCheck` of both uploader components, `updateErrorState()` runs only when an `NgControl` is present
- [ ] 2.10 Verify the list height: in the `file-upload-multiple-with-max-height` example, the list stops at 201 px and scrolls. Removing a file from an overflowing list does not reveal the scrollbar again
- [ ] 2.11 Verify the dropzone overlays in the `E2eFileUploadDropzone` scenario and the `file-upload-dropzone` example:
    - the overlay shows the configured title and caption, and the locale's `multiple.title` without a configuration;
    - focus moves into the overlay when it opens and returns when it closes;
    - with the example's toggle off, which sets the service's `disabled`, a drag does not open the overlay
- [ ] 2.12 Verify by reading the source on the baseline commit:
    - `KbqFileUploadModule` exports only the two uploader components and `KbqFileDropDirective`;
    - `kbqLocalDropzone` closes its overlay when destroyed;
    - `writeValue` of both uploader components keeps only plain items on the server;
    - `kbqFileDrop` ignores a drag leaving into a child element and prevents the browser default of the drag-enter, drag-over and drop events

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-file-upload-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed

## Workflow follow-up

- Archive with `/opsx:archive document-file-upload-baseline` once the checks pass. This creates `openspec/specs/file-upload/spec.md`. Archive does not copy the `cspell:ignore` comment above `## Purpose`, so add it to the new main spec, or the two words to the cspell dictionary, before `yarn run cspell` runs on it.
- Decide which Findings in `design.md` become changes of their own. The wrong tab order in the accessibility docs, the unused `single.captionText` key and the lost files of large dropped folders are the most user-visible ones.
