# Tasks

## 1. Verification

- [ ] 1.1 Re-read the evidence for "Alignment needs a height": `empty-state.scss` lines 9-14 give the host `display: flex`, `flex-direction: column` and `flex: 1` with no `height` or `align-self`, and lines 16-101 give it padding at every size, so a grid item stretches to its row like a flex item and a block-level host is as tall as its content plus its padding; verify the delta names the grid parent and the padding
- [ ] 1.2 Re-read the evidence for "Error tint reaches an icon item in the illustration slot": `KbqEmptyStateIcon` injects `KBQ_EMPTY_STATE_CONTEXT` without `host` or `self` (`empty-state.component.ts` line 31) and `KbqEmptyState` provides it in `providers` (line 128), so a slot directive in the template of a component nested in the content finds the empty state; verify the delta exempts only an icon item with no `kbq-empty-state-icon` on it or around it in that template
- [ ] 1.3 Re-read the evidence for "Content outside the slots is not rendered": the four `ng-content` selectors in `empty-state.component.html` match an `ngProjectAs` as well as an attribute, and `TcbControlFlowContentProjectionOp` in `@angular/compiler-cli` reports `NG8011` (`controlFlowPreventingContentProjection`, a warning by default) for a node matching a non-wildcard selector inside a block with more than one root node; verify the delta limits the silence to runtime
- [ ] 1.4 Run `openspec validate correct-empty-state-baseline --strict` and verify it reports the change as valid

## Workflow follow-up

- Archive the change with /opsx:archive.
