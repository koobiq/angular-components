# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are `packages/components/tags/` (`tag.component.ts`, `tag-list.component.ts`, `tag-input.ts`, `tag.module.ts`, the three unit specs, `e2e.ts` and the Playwright spec), the `tag`, `tag-list`, `tag-input` and `tag-autocomplete` pages in English and Russian with their examples pages, the docs examples under `packages/docs-examples/components/tags/`, the API golden file `tools/public_api_guard/components/tags.api.md`, and the pieces the entry point relies on: the color directive, list key manager, `kbqLeaveTabOrderOnTabOut`, `isSelectAll`, `runClearPredicate`, `kbqAnimationsDisabled` and the `a11y` locale section in `packages/components/core`, and `kbq-cleaner`, `KbqTrim` and the container click of `kbq-form-field`. The remove control's keyboard activation and role are also exercised by the select spec (`removing a selected value from the trigger`). Every claim was checked against the source. The general approach follows the archived `document-select-baseline` change.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the entry point, and every scenario can be checked by an existing test or by hand in the dev app.
- One place to diff against when tag, tag list or tag input behaviour changes later.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Internals: the key manager, the range-selection state, the pending-change latch, change detection, CSS structure and design tokens.
- How `kbq-select`, `kbq-tree-select` and `kbq-autocomplete` use tags, beyond the autocomplete hooks the tag input reacts to; `kbq-cleaner` and `kbq-form-field` beyond what a tag list exposes to them.
- The deprecated method of `KbqTag` that adds positional icon classes, and those classes.
- Changes to tests, docs or examples.

## Decisions

The decisions of the select baseline apply unchanged: English, a flat capability path, quirks documented as they ship, only confirmed behaviour in the spec, and the same definition of what counts as contract. Specific to tags:

1. **One capability for the whole entry point.** `kbq-tag`, `kbq-tag-list` and `kbqTagInput` share the selection, the focus order and the form value, and most changes touch two of them. Separate `tag`, `tag-list` and `tag-input` capabilities, matching the docs pages, were considered and rejected for that reason. The tag autocomplete page has no code of its own in this entry point, so only the tag input's reactions to an attached autocomplete are covered.
2. **Order of the docs pages.** Requirements follow the tag page, then the tag list, the tag input and the tag autocomplete pages, and end with localization.
3. **Quirks kept as they ship.** Examples:
    - blur and paste request empty values;
    - `[selected]` selects a tag that is not selectable;
    - selection cleared by focus leaving the list emits no `selectionChange`;
    - selection that follows focus on a standalone tag reports `isUserInput: false`;
    - a bound `kbqTagInputSeparatorKeyCodes` replaces `[ENTER]` instead of adding to it;
    - the form value never creates or selects tags;
    - `remove()` asks to remove a disabled tag;
    - the edit start reason is the key name (`Enter`, `F2`), while submit and cancel reasons are lower case.
4. **Contract specific to tags.** The input and output aliases (`kbqTagInputFor`, `kbqTagInputSeparatorKeyCodes`, `kbqTagInputAddOnBlur`, `kbqTagInputAddOnPaste`, `kbqTagInputTokenEnd`), the `editChange` reasons, the `KBQ_TAGS_DEFAULT_OPTIONS` defaults and the public `notifyPendingTagChange()` count. Members marked `@docs-private` that other entry points call (`handleSelectionInteraction`, `keyManager`, `setSelectedState`, `selectViaInteraction`) do not. Neither does `kbq-tag-with-icon`, which is bound on every tag (see Findings).

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/tags` updates `openspec/specs/tags/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [Some requirements rest on the source rather than on a test] → tasks.md checks each of them by hand in `yarn run dev:tag` before archiving. A mismatch is corrected in the delta, not in the code.
- [A defect gets recorded as intended behaviour] → Suspected defects stay out of the spec and are listed under Findings. Behaviour the spec does state can change later through `MODIFIED`.
- [Tags are rendered by select and tree-select too] → Those components bind their own `aria-label`, `tabIndex` and color on the tags. A change here is checked against their specs as well.
- [The spec is long: 70 requirements, about 150 scenarios] → It is grouped in the order of the docs pages.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The "Separators" section of `tag-input.{en,ru}.mdx` calls the keys set through `kbqTagInputSeparatorKeyCodes` "additional". A bound list replaces the default `[ENTER]`: with `[COMMA]`, Enter no longer ends a tag.
2. The same section says application-wide defaults are set with `kbqTagsDefaultOptionsProvider`. `KbqTagsModule` provides its own `{ separatorKeyCodes: [ENTER] }`, which a standalone component importing the module sees instead of an application-level provider. The comment in the test "emits (tagEnd) when the separator keys are configured globally" says the same. Only a provider on the component, or below the import, takes effect. Not reproduced at the application level.
3. The keyboard table of `tag.{en,ru}.mdx` lists Ctrl + A as "Select all tags". A tag outside a tag list ignores it.
4. The selection section of `tag.{en,ru}.mdx` says a tag is selected by a click "or by setting focus on it". Mouse focus alone does not select, and losing focus deselects a standalone tag, which the page does not mention.
5. The removal sections list "programmatic removal through the API". `remove()` only emits the `removed` request; the consumer deletes the tag.
6. The JSDoc of `KbqTagList.selectable` says that in a non-selectable list the selected states of all tags "are always ignored". A tag's own `selectable` still makes it selectable, and a `[selected]` binding still selects it, after which Delete treats it as a selected tag.
7. The JSDoc of `change` speaks of the "selected tag list value". The event carries the values of all rendered tags.
8. The JSDoc of `KbqTag.remove()` says the tag list calls it on Delete and Backspace. The tag handles those keys itself; the list calls `remove()` only for selected tags and for the cleaner.
9. The JSDoc of `KbqTagList.focus()` says it focuses the tag list. It focuses the tag input or the first enabled tag, and the list host only when nothing else can take focus.
10. The JSDoc of `kbqTagInputTokenEnd` says it is emitted "when a tag is to be added". It also emits an empty value on blur and for every empty part of a paste.
11. The JSDoc of `KbqTagInput` says it "may be placed inside or outside" a tag list. It works only with `kbqTagInputFor` bound (see suspected defect 5).
12. The JSDoc example of `kbqTagRemove` uses a `<kbq-icon>` element. `KbqIcon` matches only the `[kbq-icon]` attribute, so the example renders no icon.
13. The `tag-editable-with-validation` example submits a valid value on a cancel with the reason `focusout`. The tag emits `blur`, so that branch never runs.
14. The keyboard tables of the tag list, tag input and tag autocomplete pages omit Up and Down, which also move focus between tags.

**Suspected defects (from reading the code, not reproduced)**

1. `kbq-tag-with-icon` is bound to the array of projected icons, which is always truthy, so every tag carries the class. No style uses it.
2. In a `kbq-form-field`, a plain click on a tag of a list without a tag input reaches the field's container click, which calls the list's `focus()` and moves focus to the first enabled tag instead of the clicked one.
3. In an empty tag input of a list with no enabled tag, Shift+Tab has its default action prevented while nothing takes focus, so the user cannot tab backwards out of the field.
4. While a tag of a list is being edited, Left, Shift+Tab and Ctrl/Cmd + A pressed in an empty edit input bubble to the list, which takes the edit input for the tag input: focus jumps to the last tag, cancelling the edit, or every tag gets selected.
5. A tag input whose `kbqTagInputFor` is unbound or still undefined throws a `TypeError` on a key in its empty input, on focus, on blur and on a `distinct` check, because it calls into the missing list.
6. When the handler writes the new tag array to the list's form control, as the autocomplete validators example does, the list compares the re-rendered tags with that value, finds no difference and neither marks the control dirty nor emits `change` or `valueChange`. A `ShowOnControlDirtyErrorStateMatcher` then never shows an error. Tags added from an autocomplete option are not flagged as user changes at all, since nothing calls `notifyPendingTagChange()`. Conversely, the flag left by a rejected tag makes a later change of the consumer's data, made in code, count as a user change.
7. The tag list has no role, `aria-invalid`, `aria-required` or `aria-describedby`, and the tags have no role or `aria-selected`, so neither the error state nor the selection reaches assistive technology. `required` only feeds the form field and adds no validator. The skipped "error messages" suite records this; the axe test passes because there is no ARIA to check.
8. Most tag examples use `<i kbq-icon kbqTagRemove>`. `KbqIcon` sets `aria-hidden="true"` on its host by default, which hides the `role="button"` control and its name, as in the select baseline. With the default `tabindex="-1"` axe does not flag it.
9. `distinct` compares the typed text with the tags' `value`. With object values, which the tag input overview example binds, it would never detect a duplicate.

**Tests whose name and body disagree, or that cannot fail**

- `tag.component.spec.ts`:
    - "emits focus only once for multiple clicks" calls `focus()` twice and clicks nothing;
    - "should NOT select tag when it is disabled" uses a tag that is not selectable, so `select()` would do nothing even if `disabled` were ignored;
    - "should NOT select tag on Shift/Cmd/Ctrl + click" passes only because the tag is not selectable; a selectable standalone tag toggles on a modifier click;
    - "should be focused by focus() method" calls the native `HTMLElement.focus()`, not `KbqTag.focus()`.
- `tag-list.component.spec.ts`:
    - "should be able to become focused when disabled" asserts that the list does not become focused;
    - "should not have role when empty" cannot fail, because the list never has a role;
    - both "should clear the selection when the control is reset" tests reset a selection that was never made, since writing a value selects nothing;
    - "should not focus the active tag when the value is set programmatically" cannot fail, because writing a value never touches the tags;
    - "should not set the control to dirty when the value changes programmatically" carries a `// todo need rethink this selection logic` comment;
    - "should maintain focus if the active tag is deleted" and "should move focus to the last tag when the focused tag was deleted with a leave animation" assert before the removal is rendered, so the tag is still there;
    - the `StandardTagList` fixture listens to `(select)` and `(deselect)`, which `kbq-tag` does not emit;
    - three `it.skip` tests under "single selection" and the skipped "error messages" suite, whose only `kbq-error` is commented out, document behaviour that does not exist.
- `tag-input.spec.ts`:
    - "should kbqTagInputAddOnPaste by default" sets `addOnPaste: true` through a provider, so it does not test the default;
    - "emits the (tagEnd) on enter …" names a key release but dispatches a keydown;
    - "emits accepts the custom separator keys in a Set" passes an array;
    - "emits (tagEnd) when the separator keys are configured globally" sets the input binding, as its own comment admits.

**Behaviour without a test.** The spec states these from the source:

- the `kbq-standard-tag`, `kbq-tag_removable`, `kbq-tag_editable` and `kbq-tag-input` classes, the content classes (`kbq-tag-with-avatar`, `kbq-tag-with-trailing-icon`, `kbq-tag-avatar`, `kbq-tag-trailing-icon`, `kbq-tag-remove`), the tag list classes `kbq-tag-list_selectable`, `kbq-tag-list_editable`, `kbq-tag-list_removable` and `kbq-invalid`, and the list's id prefix;
- the text fallback of a tag's `value`, and the long text cut with an ellipsis;
- the default name and tab index of the remove control and its `[localeOverrides]`, which the select spec covers only with its own bound name;
- the prevented default action of Space, Delete and Backspace on a tag, the return value of `toggleSelected()`, `isUserInput: false` for selection that follows focus, and a modifier click toggling a selectable standalone tag;
- the edit start reason taken from the key, the `destroy` cancellation, the selected text of the edit input, Escape not leaving the edit input, and the missing edit input error;
- Up and Down between tags, no wrapping, the `-1` tab index of an empty list, and Ctrl + A from an empty tag input;
- no `selectionChange` on deselection when focus leaves the list;
- the `dropped` payload, the value reported on an edit submit, and `notifyPendingTagChange()`;
- the cleaner not clearing on Escape, and focus moving to the first remaining enabled tag after a clear;
- the `disabled` attribute of the tag input, the empty value requested on blur, key codes without a separator definition, trimming on a `kbqInput`, the native paste when adding on paste is off, Tab as a separator keeping focus, the input never cleared by the directive, and keys not propagating past an empty tag input.
