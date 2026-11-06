# Proposal

## Why

The baseline spec of `textarea` (`openspec/specs/textarea/spec.md`, written from the code on `c9c196a9b` and never checked) states behaviour the code does not have. A static audit of every requirement against `packages/components/textarea`, the parts of `core` and `form-field` it relies on and their tests found six requirements with at least one wrong statement; this change corrects them so the spec describes what ships.

## What Changes

- **Height grows with the content by default**: the height never drops below the element's `rows` (two by default) plus the free space, so below two lines adding or removing a line does not change it.
- **Free space below the last line**: content shorter than `rows` is measured as that many rows, so a single line is followed by an empty line and then `freeRowsHeight`, not by `freeRowsHeight` alone.
- **Height is measured after each change renders**: measurements run only while `canGrow` is `true`; switching `canGrow` off does not trigger one.
- **Resizable mode**: user resizing with a handle holds for a textarea rendered with `canGrow` off; switching it off later keeps the last minimum height and the row limit state, and a reached limit hides the handle.
- **Form control disabled state wins**: `formControlName` connects its control in its own `ngOnChanges`, so the first change detection can still apply the textarea's `disabled` input.
- **Focusing does not scroll**: only focusing a textarea already in view leaves the scroll positions alone; the browser scrolls one out of view into view, and the `preventScroll` that `KbqFormField.focus()` passes on is dropped.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `textarea`: six requirements corrected to match the code: Height grows with the content by default, Free space below the last line, Height is measured after each change renders, Resizable mode, Form control disabled state wins and Focusing does not scroll.

## Impact

Only OpenSpec files: this change and, once archived, `openspec/specs/textarea/spec.md`. No source, test or documentation file changes.
