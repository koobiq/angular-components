# Proposal

## Why

The baseline spec of `resizer` states behaviour the code does not have. A static audit of `openspec/specs/resizer/spec.md` against `packages/components/resizer` at `c9c196a9b` found four requirements that the code, or the platform behaviour it relies on, contradicts in some case.

## What Changes

- **Handle needs a resizable container**: the handle finds `KbqResizable` through the element injector, which goes past its own template to the host of the component that declares it and on to that host's ancestors. `KbqSplitterPanel` relies on this: it applies `KbqResizable` as a host directive and keeps the `[kbqResizer]` separator in its own template. The requirement now states that scope and the host-directive form, with a new scenario.
- **Starting size in the element's box model**: under `border-box` the starting size is read with `getBoundingClientRect()`, which includes CSS transforms, so inside a transformed element the first move makes it jump. The requirement no longer promises the border box in every case, and a new scenario covers a scaled ancestor.
- **Size is not clamped**: a negative `width` or `height` is not a valid CSS value, so the browser drops that write and the element keeps the last size written; only the reported size goes negative. The requirement says so, with a new scenario.
- **No keyboard or assistive-technology support**: the directives add no `tabindex`, so a handle on a natively focusable element such as a `button` is in the tab order. The "Keyboard user" scenario is limited to a handle on a `div`, and a new scenario covers a `button`.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `resizer`: corrects the requirements "Handle needs a resizable container", "Starting size in the element's box model", "Size is not clamped" and "No keyboard or assistive-technology support" to match the code.

## Impact

Only OpenSpec files: `openspec/changes/correct-resizer-baseline/` now, and `openspec/specs/resizer/spec.md` once the change is archived. No source, test, example or documentation file changes.
