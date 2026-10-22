# Tasks

No source, test or docs file changes in this change. Each task re-reads the evidence behind one corrected requirement.

## 1. Verify the corrections

- [ ] 1.1 Scroll strategy: re-read `KbqRepositionScrollStrategy` in `packages/components/core/overlay/reposition-scroll-strategy.ts` and the CDK `ScrollDispatcher`, and verify the panel is repositioned only on scrolls of the document and of elements registered with that dispatcher, which a `kbqScrollbarViewport` is
- [ ] 1.2 Selected state of options: re-read `handleKeydown`, `resetActiveItem` and the active-option subscription in `ngAfterViewInit` of `autocomplete-trigger.directive.ts`, and verify that an Enter choice of a non-first option with `autoActiveFirstOption` on makes the first option active after the panel has closed, which selects it
- [ ] 1.3 Values written by the form: re-read `writeValue` and `setTriggerValue` in `autocomplete-trigger.directive.ts`, and verify `displayWith` is called for `null` and `undefined` and only a `null` or `undefined` result leaves the field empty
- [ ] 1.4 Active option stays in view: re-read `ngAfterViewInit` in `autocomplete-trigger.directive.ts`, and verify the active-option subscription that scrolls the list is made once, for the panel bound at that moment
- [ ] 1.5 Panel anchored to the caret: re-read `measureCaretOrigin` in `autocomplete-trigger.directive.ts` and `kbqGetCaretRect` in `packages/components/core/form-field/caret-rect.ts`, and verify the field's box is used where the caret cannot be measured and the field-anchored origin's box where the field has no text selection
- [ ] 1.6 Text mode query and trigger characters: re-read `kbqGetTextQuery` in `packages/components/core/form-field/text-query.ts`, and verify a minimum length of 0 yields an empty query after whitespace and that only the last occurrence of each trigger is considered
- [ ] 1.7 Run `openspec validate correct-autocomplete-baseline --strict` and verify it reports the change as valid

## Workflow follow-up

- Archive with `/opsx:archive correct-autocomplete-baseline` once the checks pass.
