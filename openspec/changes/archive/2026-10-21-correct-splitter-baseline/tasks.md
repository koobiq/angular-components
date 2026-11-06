# Tasks

No source, test or docs file changes in this change. Each task re-reads the evidence behind one corrected requirement in `specs/splitter/spec.md`; all paths are under `packages/components/splitter/`.

## 1. Verify the corrections

- [ ] 1.1 "Layout before the first measurement": in `splitter.ts`, verify that `handleSeparatorKeydown()` checks neither `containerSize` nor the measurement before the Enter, Home and End branches, that `defaultSizes` returns zeros while `containerSize` is `0` so Home finds a collapsible panel "at its minimum", and that `gridTemplate` keeps one equal `1fr` track per panel until the splitter is measured
- [ ] 1.2 "Layout two-way binding": in `splitter.ts`, verify that the Home branch returns after `panel.collapsed.set(true)` without calling `resizeBy()`, and that the Enter branch only updates `collapsed`, so neither reaches `applySizes()`, the only place a key press writes `layout`
- [ ] 1.3 "Collapsed size": in `splitter.ts`, verify that `defaultSizes` replaces a collapsed panel's `size` with its collapsed size and gives what is left to the panels without a `size` only, that `collapseSplitterSizes()` hands the freed space to every open panel in equal parts when `layout` is set, and that the unit test "should leave more than two panels where the drag put them and still give the collapsed one its size back" holds the sizes on release
- [ ] 1.4 "Expanding restores the previous size": in `splitter.ts`, verify that `applySizes()` keeps a collapsed panel's entry only from the previous `layout`, which is `null` for a panel collapsed by Enter, Home or the host while the layout is derived, that `settleCollapse()` records the size a drag started from, and that the unit test "should keep the size a collapsed panel returns to while another boundary moves" sets `layout` first
- [ ] 1.5 "Separator beside a panel collapsed to nothing": in `splitter.scss`, verify that the separator sits at the inline end of its own panel and that only the splitter's `overflow: clip` clips it, so a separator lands on the splitter's edge only next to the first or the last panel
- [ ] 1.6 "Separator value": in `splitter.ts`, verify that `panelRoom()` bounds the range by `trailingGive` and `trailingTake` from `sideRoom()`, which sum every panel after the separator, and never reads the panels before it
- [ ] 1.7 Run `openspec validate correct-splitter-baseline --strict` and verify it passes

## Workflow follow-up

- Archive the change with `/opsx:archive`, which merges the corrected requirements into `openspec/specs/splitter/spec.md`.
