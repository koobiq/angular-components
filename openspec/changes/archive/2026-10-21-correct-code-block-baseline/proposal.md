# Proposal

## Why

The baseline spec of `code-block` states behaviour the code does not have. A static audit of `openspec/specs/code-block/spec.md` against `packages/components/code-block` at `c9c196a9b` found eight requirements that hold only in some modes or describe a condition other than the one the code checks; the corrections describe what ships.

## What Changes

- **Fallback language**: highlight.js 11 core knows no language until one is registered, so under a configuration whose core does not register the fallback language, a file without a `language` or with an unknown one is not highlighted: highlight.js throws `Unknown language: "<fallback>"`. The requirement now says the fallback has to be known, and its scenarios name the full package.
- **Content warnings in development mode**: the mismatch warning fires when highlight.js scores the content with zero relevance, which also happens to content it has highlighted, such as a lone number in TypeScript; it is not "finding nothing to highlight". The requirement also notes that stock highlight.js 11 never reports illegal content for the call the block makes, since that call ignores illegal matches.
- **Collapsed code does not scroll**: a negative `maxHeight` sets no limit but still shows the button, and then nothing is clipped at `maxHeight`. The requirement and its scenario are now limited to a positive `maxHeight`.
- **Expanding and collapsing**: only the button and `toggleViewAll()` scroll the code area back to the top and emit `viewAllChange`; turning `viewAll` off through its input or its signal does neither. The requirement now says so.
- **Show all from the keyboard**: Enter moves focus to the code area when no height limit is in effect after the toggle and the code area overflowed before the new state rendered. With a negative `maxHeight` no limit clips the collapsed block, so expanding one whose code area does not overflow leaves focus on the button. The stated focus moves hold only for a positive `maxHeight`, and the requirement and its scenario now say so.
- **Active file**: the bound value goes through `numberAttribute`, so a numeric string such as `"1"` selects that index instead of reading as `0`. The requirement now says so and gains a scenario.
- **Copying the code**: the tooltip goes back to `copyTooltip` only for a copy button that existed when the block's view was first initialized; one that appears later, once `canCopy` is turned on, keeps `copiedTooltip`. The requirement now says so and gains a scenario.
- **Keyboard access to the code area**: the tab order follows whether the content overflows the code area, not whether the code area can scroll; the two differ when a negative `maxHeight` leaves the button shown and the code area clipped by `overflow: hidden`. The requirement now names overflow.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `code-block`: corrects the requirements "Fallback language", "Content warnings in development mode", "Collapsed code does not scroll", "Expanding and collapsing", "Show all from the keyboard", "Active file", "Copying the code" and "Keyboard access to the code area" to match the code.

## Impact

Only OpenSpec files: `openspec/changes/correct-code-block-baseline/` now, and `openspec/specs/code-block/spec.md` once the change is archived. No source, test, example or documentation file changes.
