# DS-2467: popup arrow centering

<!-- cspell:ignore arrowless -->

## Intent

Let a popover or tooltip keep an edge-aligned panel while its arrow points at the center of the trigger. This covers the navbar case without special-casing navbar in shared popup code.

## Goals

- Add opt-in `kbqPopoverArrowCentered` and `kbqTooltipArrowCentered` boolean inputs, both defaulting to `false`.
- Keep the panel at its requested placement and move only the arrow along the panel's cross-axis.
- Preserve the existing arrowless and offset APIs and all default rendering.
- Recalculate after placement fallback, input changes, scrolling and viewport resize.

## Non-goals and anti-goals

- Do not change existing placements, default gaps or navbar-owned tooltip behavior.
- Do not add placement variants or shift the whole panel to center its arrow.
- Do not let the arrow leave its safe area near a rounded panel corner.

## Approaches

1. **Chosen: move only the arrow.** Resolve the active origin's center after CDK positions the panel, then apply a clamped CSS translation. This preserves the meaning of edge placements and works with fallback positions and pushed overlays.
2. **Rejected: move the whole panel.** CDK offsets could make the existing static arrow meet the trigger center, but the panel would no longer have the alignment named by its placement.

## Design

- Share origin-center and arrow-shift geometry through the existing `core/pop-up` mechanism. Popover's pointer-relative mode keeps its current click-point priority; element, custom-rectangle and caret origins use their current center.
- Centered placements need no additional shift. Edge placements translate the arrow toward the origin center and clamp it to the component's existing arrow inset.
- When centering is enabled, the dynamic arrow replaces the legacy narrow-trigger panel compensation, avoiding a double offset. Disabling centering restores the legacy positions.
- Remove the translation when the option is off, the arrow is hidden or the popup is stuck to a window edge.
- Use CSS custom properties for both components; tooltip's arrow transform gains the same translation mechanism popover already uses for pointer-relative positioning.
- Update public JSDoc and the English/Russian popover and tooltip documentation and examples. Demonstrate the navbar scenario through public inputs, without a navbar-specific shared-directive exception.

## Verification

- Unit-test shift geometry, clamping, narrow panels, default behavior and runtime input changes.
- Add browser geometry checks for edge-aligned popover and tooltip panels, including the navbar scenario and repositioning.
- Build the affected packages, refresh API snapshots, run the relevant unit and Playwright suites, and run type, lint and formatting checks.

Exact private helper structure and which existing docs examples carry the new toggle are left to the implementer.
