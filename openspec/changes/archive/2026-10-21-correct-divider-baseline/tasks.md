# Tasks

## 1. Verification

- [ ] 1.1 Re-read the evidence for "Default length follows the layout": `divider.scss` lines 4-5 make the divider `display: block` with no margin, lines 7-9 size a horizontal divider only in height, line 20 gives a vertical divider `height: 100%` and its rule (lines 18-27) sets no `min-height`, and the `[style.height.px]` / `[style.width.px]` host bindings of `divider.component.ts` lines 42-43 write nothing without `length`; with CSS 2.1 section 10.5 (a percentage height against a containing block of content height computes to `auto`) and the flex item sizing of an empty element, verify the delta limits the full width to a block container and the full height to a container of definite height
- [ ] 1.2 Run `openspec validate correct-divider-baseline --strict` and verify it reports the change as valid

## Workflow follow-up

- Archive the change with /opsx:archive.
