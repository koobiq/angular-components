# Proposal

## Why

The baseline spec of `toast` states behaviour the code does not have. A static audit of `openspec/specs/toast/spec.md` against `packages/components/toast` at `c9c196a9b` found six requirements whose descriptions contradict the source in some case; their scenarios hold and stay as they are.

## What Changes

- **Line breaks in string slots**: a string `caption` shown without a title gets none of the `white-space: pre-wrap` rules (it carries `kbq-toast__title` without `kbq-toast__title_only-text`, and `kbq-toast__text_only-text` without `kbq-toast__text`), so its line breaks collapse. The requirement now keeps line breaks only in the slots that have the rule.
- **Closing a toast**: `close()` hides the toast through `KbqToastService.hide()`, which ignores a toast created by a `kbq-toast-container` placed in a consumer's template: that toast is reported as read and stays on screen. The requirement is now scoped to toasts shown by `show()`.
- **Hiding a toast by id**: `hide()` does not report a toast as read itself, but its focus hand-off moves the focus out of the toast, and focus held there for more than 500 ms then makes `read` emit. The requirement now says so instead of "MUST NOT report it as read".
- **Read notification**: the same case contradicts "Removal by … `hide()` MUST NOT emit". The requirement now names the focus hand-off as the exception.
- **Stack position**: the container's styles add the stack margin (`--kbq-size-m` by default) on the anchored sides of every position but `center`, so the stack sits at `indent` plus that margin from the edge, not at `indent`. The requirement now includes the margin.
- **One overlay for the stack**: a stack emptied by `hideTemplate()` while a hidden toast still plays its exit stays attached until that exit ends. The requirement now states that condition instead of "detach at once".

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `toast`: corrects the requirements "Line breaks in string slots", "Closing a toast", "Hiding a toast by id", "Read notification", "Stack position" and "One overlay for the stack" to match the code.

## Impact

Only OpenSpec files: `openspec/changes/correct-toast-baseline/` now, and `openspec/specs/toast/spec.md` once the change is archived. No source, test, example or documentation file changes.
