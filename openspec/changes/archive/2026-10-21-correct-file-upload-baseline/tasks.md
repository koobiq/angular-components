# Tasks

## 1. Verification

- [ ] 1.1 Re-read the evidence for "Adding files through the system dialog" and verify it matches the delta: the browse link of `single-file-upload.component.html` renders only inside `@if (!file)`, and the folder loader of `multiple-file-upload.component.html` binds no `[multiple]`
- [ ] 1.2 Re-read the evidence for "Allowed item kinds" and verify it matches the delta: the folder loaders of both uploader templates bind no `[accept]`, and `primitives/file-picker.ts` writes `innerAccept()` to the input's `accept` property
- [ ] 1.3 Re-read the evidence for "Error state of the uploader" and verify it matches the delta: `ngDoCheck` of the single and the multiple uploader calls `updateErrorState()` only with an `NgControl`, and the single uploader's `invalid` getter adds the item's `hasError`
- [ ] 1.4 Re-read the evidence for "Dropped folders" and verify it matches the delta: `unwrapDirectory` in `primitives/file-drop.ts` calls `readEntries()` once per folder and pops the queue, which reverses each folder's entries
- [ ] 1.5 Run `openspec validate correct-file-upload-baseline --strict` and verify it reports the change as valid

## Workflow follow-up

- Archive the change with `/opsx:archive` once the review is done, which merges the four corrected requirements into `openspec/specs/file-upload/spec.md`.
