# Select multiline options design

## Intent

DS-3000 asks for a Select documentation example where long option text wraps and options therefore have different heights.

## Goals

- Extend the existing `select-two-line-option` example with short and long option labels.
- Show how to enable wrapping without changing the Select API or library styles.
- Explain the example in both documentation locales.

## Non-goals

- Recreate the Figma example's distances and city-specific content.
- Add another example or change multiline trigger behavior.
- Add a component input for multiline options.

## Constraints

- Keep the existing option captions.
- Scope the wrapping override to this example through `panelClass`, and set `panelWidth="auto"` so the panel keeps the field width instead of auto-sizing to the longest label.
- Follow the repository documentation, formatting and verification rules.

## Approaches

- **Selected: extend the existing example minimally.** Keep `Option #N` labels, add long labels, and override `.kbq-option-text` wrapping in the example. This adds little code and preserves the existing caption demonstration.
- Rich Figma-like content with city descriptions and distances. Rejected because it adds content and layout unrelated to the wrapping mechanism.
- A separate example. Rejected by the user in favor of extending `select-two-line-option`.

## Implementation

Add `panelClass="example-select-multiline-options"` and `panelWidth="auto"` to the example's Select; `panelWidth="auto"` pins the panel to the field width, so long labels must wrap instead of growing the panel. Under that panel class, set `.kbq-option-text` to `white-space: normal` and `overflow-wrap: break-word`. Use labels of different lengths so short options remain one line and long options wrap.

Update the Select overview in Russian and English with a short explanation of the panel-scoped CSS override. Mark Select as updated until 2026-11-19.

## Verification

Build docs-examples and docs-content, run Prettier on changed files, and inspect the open panel in the docs app. Confirm long labels wrap, short labels stay on one line, captions remain visible, and the selected value in the trigger keeps its normal truncation behavior.
