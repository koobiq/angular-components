# Tasks

## 1. Verification

- [ ] 1.1 Re-read the evidence for "Any of several text elements can trigger the tooltip": `isOverflown` in `title.directive.ts` lines 114-120 adds the sibling-clip check of lines 305-307 for every element, the unit test "should be overflown when a sibling clips a child whose text would fit the parent" reports truncation while both elements fit the container, and the e2e test "should show the tooltip when a sibling clips a text element that would fit on its own" opens the tooltip; verify the delta adds the sibling-clip condition
- [ ] 1.2 Re-read the evidence for "Container resizes are followed": `ngAfterViewInit` in `title.directive.ts` lines 217-220 observes `this.parent` once, while the `parent` getter in lines 131-137 resolves the `#kbqTitleContainer` query of lines 178-180 on every measurement; verify the delta names the container resolved at initialization and its new scenario
- [ ] 1.3 Re-read the evidence for "Blur and non-keyboard focus close the tooltip": the host listeners in `title.directive.ts` lines 42-45 and `tooltip.component.ts` lines 270-274 bind no click handler, the trigger fixed to `hover` makes `initListeners` in `pop-up-trigger.ts` lines 654-688 bind only `mouseenter` and `mouseleave`, the close comes from the focus monitor subscription in `title.directive.ts` lines 230-255, which a click on an already focused host does not trigger, and the unit test "should hide the tooltip when focus arrives from a non-keyboard origin" reports the `mouse` origin with `focusVia`; verify the delta and its new scenario
- [ ] 1.4 Re-read the evidence for "Tooltip ignores pointer events by default": `createOverlay` in `tooltip.component.ts` lines 1154-1161 computes the panel classes of lines 1227-1240 only while no overlay exists, and `createOverlay` and `detach` in `pop-up-trigger.ts` lines 548-551 and 521-544 reuse the detached overlay; verify the delta states that the value is read once
- [ ] 1.5 Re-read the evidence for "Default placement keeps the tooltip centred": `ngAfterViewInit` in `title.directive.ts` lines 208-215 sets the default priority once, `ngOnChanges` in `tooltip.component.ts` lines 645-651 and `updatePlacement` and `updatePlacementPriority` in `pop-up-trigger.ts` lines 327-352 never restore or drop it, and `getPrioritizedPositions` in lines 796-802 prefers the priority over the placement; verify the delta and its new scenario
- [ ] 1.6 Run `openspec validate correct-title-baseline --strict` and verify it reports the change as valid

## Workflow follow-up

- Archive the change with /opsx:archive.
