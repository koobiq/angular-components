# Tasks

## 1. Verification

- [ ] 1.1 Re-read the evidence for "Whitespace at the edges of the text": `edgeTextNode` in `link.ts` lines 389-397 returns no node when an element stands at an edge of the text, so `trimEdgeTextNodes` (lines 375-386) leaves the whitespace inside that element; verify the delta limits trimming to a text node at the edge
- [ ] 1.2 Re-read the evidence for the "Spaces inside the text" scenario: the unit test "should keep the spaces inside the text" in `link.spec.ts` lines 99-106 sets a text with three spaces between `Save` and `report`; verify the delta states the three spaces outside quoted plain text, which prettier collapses
- [ ] 1.3 Run `openspec validate correct-link-baseline --strict` and verify it reports the change as valid

## Workflow follow-up

- Archive the change with /opsx:archive.
