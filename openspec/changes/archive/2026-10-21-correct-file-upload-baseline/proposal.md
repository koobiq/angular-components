# Proposal

## Why

The baseline spec of `file-upload` states behaviour the code does not have. A static audit of `openspec/specs/file-upload/spec.md` against `packages/components/file-upload` at `c9c196a9b` found four requirements that the source contradicts, so the spec cannot yet serve as the contract later changes are diffed against.

## What Changes

- **Adding files through the system dialog**: only the file input of the multiple uploader is `multiple` (the folder input is not), and the "same file again" scenario moves to the footer input of a multiple uploader that lists files. A single uploader holding a file renders no browse link, so its dialog cannot be opened a second time.
- **Allowed item kinds**: the folder input does not receive the uploader's `accept`, instead of "has no `accept`". The folder loader binds no `accept`, and the `null` it passes on is written to the input's `accept` property.
- **Error state of the uploader**: without a form directive the matcher is not evaluated, yet the single uploader still shows the error state for an item with `hasError`. The old text said no uploader could enter it.
- **Dropped folders**: each folder is read with one `readEntries()` call, so only the entries of that first batch are included. The old text said the folder is replaced by all the files it contains.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `file-upload`: four requirements are corrected to match the shipped behaviour: "Adding files through the system dialog", "Allowed item kinds", "Error state of the uploader" and "Dropped folders".

## Impact

Only OpenSpec files: this change and, once archived, `openspec/specs/file-upload/spec.md`. No source, test, docs or API change.
