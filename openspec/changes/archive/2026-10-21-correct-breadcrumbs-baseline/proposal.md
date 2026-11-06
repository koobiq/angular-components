# Proposal

## Why

The baseline spec of `breadcrumbs` states behaviour the code does not have. A static audit of `openspec/specs/breadcrumbs/spec.md` against `packages/components/breadcrumbs` and the `core`, `button` and `overflow-items` code it relies on, on `c9c196a9b`, found five requirements whose wording the source contradicts; this change corrects them so the spec describes what ships.

## What Changes

- **Routing through the item**: the entry and the dropdown row receive only the URL tree the item's `RouterLink` builds (commands, `queryParams`, `fragment`, `queryParamsHandling`, `preserveFragment`, `relativeTo`); the item's `target`, `state`, `info`, `replaceUrl` and `skipLocationChange` are not carried over.
- **Single tab stop**: the hidden expand button of an enabled `auto` trail stays registered, so the host keeps `tabindex="0"` when no entry can take focus; an entry or expand button enabled again after the first render keeps the `tabindex` `kbq-button` writes and stays a tab stop; only `kbqBreadcrumb` elements take part.
- **Arrow keys move between entries**: only elements that take part in keyboard navigation are reached; a disabled custom `<a kbq-button kbqBreadcrumb>` left `focusable` is reached, and `kbq-button` then halts Left and Right on it.
- **Home and End**: End lands on the last participating entry before the last item, which is not the one right before it when that one is disabled.
- **Pointer focus**: the trail handles the pointer press only on `kbqBreadcrumb` elements; an element of a custom template without it is left to the browser.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `breadcrumbs`: corrects the requirements "Routing through the item", "Single tab stop", "Arrow keys move between entries", "Home and End" and "Pointer focus".

## Impact

Only OpenSpec files: the delta under `openspec/changes/correct-breadcrumbs-baseline/` and, once archived, `openspec/specs/breadcrumbs/spec.md`. No source, test, documentation or public API changes.
