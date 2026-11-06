# Tasks

## 1. Verification

- [ ] 1.1 Re-read the evidence for "Color given as a plain string": the `[class]` host binding of `badge.component.ts` line 115 and the class string built at line 136, and Angular's `classStringParser`, which splits a class string at whitespace; verify the delta states the split
- [ ] 1.2 Re-read the evidence for "Supported color and fill combinations": `badge.component.scss` line 62 includes the badge theme mixin of `_badge-theme.scss` lines 24-95, while `koobiq-theme()` in `core/styles/_koobiq-theme.scss` and `core/styles/theming/prebuilt/theme.scss` include no badge rules; verify the delta names the badge stylesheet, not the prebuilt theme
- [ ] 1.3 Re-read the evidence for "Leading icon is marked" and "Trailing icon is marked": the effect of `KbqBadgeCssStyler` in `badge.component.ts` lines 67-100 reads only the icon query, and `getNodesWithoutComments` in `core/utils/utils.ts` lines 31-33 drops comments only; verify the delta limits the marking to the moments the classes are computed and counts whitespace-only text nodes
- [ ] 1.4 Re-read the evidence for "Icons that are alone, in the middle or nested are not marked" and "Icon classes follow icons added or removed later": the icon classes are removed only inside the `filteredNodesWithoutComments.length > 1` branch (lines 80-98), and Angular marks a content query dirty only for an inserted or removed view that holds a match, then returns the cached result array when the matches did not change; verify the delta describes the kept classes and the missing recomputation
- [ ] 1.5 Run `openspec validate correct-badge-baseline --strict` and verify it reports the change as valid

## Workflow follow-up

- Archive the change with /opsx:archive.
