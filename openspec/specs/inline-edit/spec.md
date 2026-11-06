# inline-edit Specification

## Purpose

Describes what `kbq-inline-edit` from `@koobiq/components/inline-edit` guarantees to consumers: how a projected view turns into an editor and back, when the edited value is saved, rejected or restored, how a save to a server is reported, where focus goes, and what assistive technology is told along the way.

## Requirements

### Requirement: Content slots

The inline edit SHALL render the element marked `kbqInlineEditViewMode` as its view, and the element marked `kbqInlineEditEditMode` inside an edit panel that exists only in edit mode. A direct `kbq-label` child SHALL be rendered above the view, and a direct `kbqInlineEditMenu` child beside it.

#### Scenario: View mode

- **WHEN** an inline edit is rendered in view mode
- **THEN** its view element is shown
- **AND** no `.kbq-inline-edit__panel` exists

#### Scenario: Edit mode

- **WHEN** the inline edit switches to edit mode
- **THEN** its edit element is rendered inside a `.kbq-inline-edit__panel` in the overlay container

### Requirement: Mode and its host classes

`mode` SHALL hold `'view'` or `'edit'` and default to `'view'`. The host SHALL always carry `kbq-inline-edit` and SHALL carry `kbq-inline-edit_view` or `kbq-inline-edit_edit` for the current mode. Every transition made by setting the model, by the inline edit itself or by code calling `mode.set()`, SHALL be emitted through `modeChange`; a value the parent writes through the `mode` input, as `[(mode)]` does, MUST NOT be emitted back.

#### Scenario: Initial state

- **WHEN** an inline edit without a label or a menu is rendered
- **THEN** its host carries exactly `kbq-inline-edit` and `kbq-inline-edit_view`

#### Scenario: Opening

- **WHEN** the user opens the editor
- **THEN** `modeChange` emits `'edit'` and the host carries `kbq-inline-edit_edit`

#### Scenario: Mode written by the parent

- **WHEN** the parent of a `[(mode)]` binding sets the bound value to `'edit'`
- **THEN** the editor opens and `modeChange` does not emit

### Requirement: Label

When a `kbq-label` is projected, the host SHALL carry `kbq-inline-edit_with-label`, and the edit panel SHALL be anchored to the value area below the label, so the label stays visible while editing.

#### Scenario: Field with a label

- **WHEN** a `kbq-label` is projected
- **THEN** the host carries `kbq-inline-edit_with-label`

### Requirement: Opening with the pointer

A click on an enabled inline edit in view mode SHALL switch it to edit mode wherever on the host it lands, the label included, unless it targets interactive content or the menu. The inline edit SHALL prevent the click's default action and stop its propagation.

#### Scenario: Click on the value

- **WHEN** the user clicks the plain text of the view
- **THEN** the inline edit switches to edit mode

### Requirement: Opening with the keyboard

Enter or Space pressed while focus is within an enabled inline edit in view mode SHALL switch it to edit mode and prevent the key's default action, unless the key comes from interactive content or the menu.

#### Scenario: Enter on the view

- **WHEN** the view has focus and the user presses Enter
- **THEN** the inline edit switches to edit mode

#### Scenario: Space on the view

- **WHEN** the view has focus and the user presses Space
- **THEN** the inline edit switches to edit mode and the page does not scroll

### Requirement: Interactive content handles its own clicks

A click on or inside an element of the host that matches one of `interactiveSelectors` (default `['a', 'kbq-tag']`) SHALL be left to that element and MUST NOT open the editor. A bound list SHALL replace the default one rather than extend it, and an empty list SHALL turn the check off. A matching ancestor outside the host MUST NOT count.

#### Scenario: Click on a link

- **WHEN** the view holds a link and the user clicks it
- **THEN** the inline edit stays in view mode

#### Scenario: Custom selectors

- **WHEN** `interactiveSelectors` is `['a', 'kbq-tag', 'button']` and the user clicks a button in the view
- **THEN** the inline edit stays in view mode

#### Scenario: Inline edit inside a link

- **WHEN** the inline edit is rendered inside an `<a>` and the user clicks its plain text
- **THEN** the inline edit switches to edit mode

### Requirement: Separate tab stop for interactive view content

When the view holds an element matching `interactiveSelectors`, the inline edit SHALL render a visually hidden focus anchor (`.kbq-inline-edit__focus-anchor`) after the view with `role="button"`, `tabindex="0"`, `aria-expanded="false"` and the field's accessible name, and the view SHALL lose its role and get `tabindex="-1"`. The anchor MUST NOT be rendered in edit mode or while disabled.

#### Scenario: Tags in the view

- **WHEN** the view holds `kbq-tag` elements
- **THEN** the focus anchor is rendered with `tabindex="0"`
- **AND** the view has no `role` and has `tabindex="-1"`

#### Scenario: Enter on the focus anchor

- **WHEN** the focus anchor has focus and the user presses Enter
- **THEN** the inline edit switches to edit mode

#### Scenario: Edit mode

- **WHEN** an inline edit with interactive view content is in edit mode
- **THEN** no focus anchor is rendered

### Requirement: Interactive content detection follows the view

The check for interactive content SHALL look only at the view, not at the label, and SHALL be repeated whenever the view's content changes.

#### Scenario: Control in the label

- **WHEN** only the label holds a focusable control
- **THEN** no focus anchor is rendered and the view keeps `tabindex="0"`

#### Scenario: Content rendered later

- **WHEN** the view first shows a placeholder and later renders a `kbq-tag`
- **THEN** the focus anchor appears

### Requirement: Edit panel placement

The edit panel SHALL open in an overlay over the view it replaces, starting at the view's top-left corner when there is room below, and, without `editModeWidth`, SHALL be repositioned when the layout of the field changes while it is open. It SHALL carry the classes of `overlayPanelClass`, have no backdrop, and be rendered inside the nearest `kbqOverlayLayer` that contains the inline edit, unless a `kbqOverlayLayerExclude` element between them keeps it in the global overlay container.

#### Scenario: Custom panel class

- **WHEN** `overlayPanelClass` is `'custom-panel'` and the editor opens
- **THEN** the overlay pane carries `custom-panel`

#### Scenario: Inline edit inside an overlay layer

- **WHEN** the inline edit sits inside a `kbqOverlayLayer` and the editor opens
- **THEN** the panel is rendered inside that layer

#### Scenario: Layout changes while editing

- **WHEN** a field without `editModeWidth` is resized while the editor is open
- **THEN** the panel is moved to cover the view at its new size

#### Scenario: Layout changes with a fixed width

- **WHEN** `editModeWidth` is set and the field is resized while the editor is open
- **THEN** the inline edit neither re-measures nor repositions the panel

### Requirement: Edit panel width

The edit panel SHALL be `editModeWidth` pixels wide when that input is set. Otherwise it SHALL match the width of the host, or, when a label is projected, the width of the area inside the host's padding, and SHALL follow changes of that width while open.

#### Scenario: Fixed width

- **WHEN** `editModeWidth` is `400` and the editor opens
- **THEN** the panel is 400 px wide whatever the width of the field

#### Scenario: Default width

- **WHEN** a field without a label and without `editModeWidth` opens
- **THEN** the panel is as wide as the host

### Requirement: Focus on entering edit mode

Entering edit mode SHALL move focus to the first tabbable element of the panel and then, one task later, to the control of the first `kbq-form-field` in the editor. With a form field present, the text of the first text input or textarea of the panel SHALL then be selected, unless `getValueHandler` is bound and returns a falsy value.

#### Scenario: Opening from the keyboard

- **WHEN** the view has focus and the user presses Enter
- **THEN** the input in the panel receives focus

#### Scenario: Existing text

- **WHEN** the editor opens over an input holding "value"
- **THEN** "value" is selected, so typing replaces it

### Requirement: Opening the overlay of the edited control

When the control of the first form field in the editor can open an overlay of its own, as `kbq-select` and `kbq-tree-select` can, entering edit mode SHALL open it.

#### Scenario: Select in the editor

- **WHEN** the editor holds a `kbq-select` and the user opens the inline edit
- **THEN** the select's options panel opens

### Requirement: Action buttons

With `showActions` set, the panel SHALL show a group of two icon buttons below the editor: a save button named by `a11y.save` that saves, and a cancel button named by `a11y.cancel` that cancels. Without `showActions` no buttons SHALL be rendered.

#### Scenario: Buttons shown

- **WHEN** `showActions` is set and the editor opens
- **THEN** the panel contains the save and cancel buttons

#### Scenario: Save button

- **WHEN** the value is valid and the user clicks the save button
- **THEN** `saved` is emitted

### Requirement: Placeholder directive

An element marked `kbqInlineEditPlaceholder` SHALL get the class `kbq-inline-edit__placeholder`, which renders it in the secondary text color. The inline edit MUST NOT render placeholder text of its own: an empty view shows only what the consumer projects.

#### Scenario: Empty value

- **WHEN** the view renders `<span kbqInlineEditPlaceholder>Not set</span>`
- **THEN** that span carries `kbq-inline-edit__placeholder`

### Requirement: Ways to save

While the editor is open, a save SHALL be requested by a click outside the panel, by Enter as decided by `canSaveOnEnter`, by the save action button, by `commit()`, and by Tab off the first or last tabbable control of the panel. Every one of them SHALL run the same validation and the same save.

#### Scenario: Click outside

- **WHEN** the editor is open and the user clicks elsewhere on the page
- **THEN** the value is saved and `saved` is emitted

#### Scenario: Enter in an input

- **WHEN** an input in the panel has focus and the user presses Enter
- **THEN** the value is saved and `saved` is emitted

### Requirement: Default Enter rule

By default Enter SHALL save one task after the key, with its default action prevented, except when the key comes from a button, an `input` of type `button`, `submit` or `reset`, or an element with `role="button"`, which keep their own action. In a `textarea` Enter SHALL insert a line break, and Ctrl or Cmd with Enter SHALL save.

#### Scenario: Enter on the cancel button

- **WHEN** the cancel action button has focus and the user presses Enter
- **THEN** the key's default action is not prevented and nothing is saved

#### Scenario: Enter in a textarea

- **WHEN** a textarea in the panel has focus and the user presses Enter
- **THEN** nothing is saved

#### Scenario: Ctrl or Cmd with Enter in a textarea

- **WHEN** a textarea in the panel has focus and the user presses Ctrl+Enter or Cmd+Enter
- **THEN** the value is saved

### Requirement: Custom Enter rule

A bound `canSaveOnEnter(event)` SHALL replace the default rule: Enter in the panel SHALL save exactly when it returns `true`.

#### Scenario: Saving from a button

- **WHEN** `canSaveOnEnter` always returns `true` and the user presses Enter on the cancel button
- **THEN** the value is saved and `saved` is emitted

### Requirement: Click outside the panel

A click outside the panel SHALL request a save, unless it lands in an overlay opened above the panel that listens for clicks outside itself, such as a select's options panel, a datepicker's calendar or a dropdown: such a click MUST NOT request a save. When the click lands on the inline edit's own host, its default action and propagation SHALL be stopped, so it saves without reopening the editor.

#### Scenario: Click on the field while editing

- **WHEN** the editor is open and the user clicks the inline edit's host
- **THEN** the value is saved and the inline edit stays in view mode

#### Scenario: Click in the options panel of a select

- **WHEN** the editor holds a `kbq-select` with its options panel open and the user clicks an option
- **THEN** that click requests no save of the inline edit

### Requirement: Save outside edit mode is ignored

A save requested while the inline edit is not in edit mode SHALL do nothing, so two save requests for the same interaction, such as `commit()` from a control's change event followed by an outside click, save only once.

#### Scenario: Second save request

- **WHEN** `commit()` has saved the value and another save is requested before the editor is reopened
- **THEN** the inline edit stays in view mode

### Requirement: Local save

Without `saveHandler`, a valid save SHALL switch the inline edit to view mode, return focus and emit `saved`, whether or not the value changed.

#### Scenario: Committing a valid value

- **WHEN** the editor is open, the value is valid and `commit()` is called
- **THEN** the host carries `kbq-inline-edit_view` and `saved` is emitted

### Requirement: Saving marks the controls touched

Every save attempt SHALL mark the form control of each form field in the editor as touched, so their error styling appears from the first attempt on. Typing in the editor MUST NOT mark them touched.

#### Scenario: Typing before the first save

- **WHEN** the user types in a required, still invalid textarea
- **THEN** its control is not touched and the form field shows no error styling

#### Scenario: Rejected save of an untouched control

- **WHEN** the save button is clicked while a second, untouched form field is invalid
- **THEN** that form field's control is touched

### Requirement: Invalid values are rejected

A save SHALL be rejected while the form control of any form field in the editor is invalid, whether touched or not. A rejected save SHALL keep the editor open and MUST NOT emit `saved` or call `saveHandler`. An editor without form fields SHALL always be valid.

#### Scenario: Never-touched invalid control

- **WHEN** the editor holds a required, empty control the user never touched and `commit()` is called
- **THEN** the host still carries `kbq-inline-edit_edit` and `saved` is not emitted

#### Scenario: One of several fields is invalid

- **WHEN** the editor holds two form fields, the second one is invalid and the user clicks the save button
- **THEN** `saved` is not emitted

### Requirement: Validation tooltip

When a save is rejected, `validationTooltip` holds a non-empty string or a template, and `showTooltipOnError` is `true` (the default), the inline edit SHALL show that message in an error-colored tooltip without an arrow, placed at `tooltipPlacement` (default top left) against the editor. With an empty or missing message, or `showTooltipOnError` set to `false`, no tooltip SHALL appear.

#### Scenario: Message bound

- **WHEN** `validationTooltip` is "Required field" and a save is rejected
- **THEN** a tooltip with "Required field" opens

#### Scenario: Empty message

- **WHEN** `validationTooltip` is an empty string and a save is rejected
- **THEN** no tooltip opens

### Requirement: Validation tooltip waits for the field to be in view

When the field is not fully visible in the viewport and in its `cdkScrollable` containers, a rejected save SHALL first scroll it smoothly into view, centred vertically, and show the tooltip once the page reports a scroll end, or 800 ms later when it reports none. Until a scroll end is reported or the panel closes, the 800 ms fallback included, further rejected saves MUST NOT scroll or show the tooltip. Outside that wait, a fully visible field SHALL get the tooltip at once.

#### Scenario: Field scrolled out of view

- **WHEN** the field is above the viewport and a save is rejected
- **THEN** the field is scrolled into view and the tooltip is shown once the browser reports the scroll end

#### Scenario: No scroll end reported

- **WHEN** the field is out of view, a save is rejected and the browser reports no scroll end
- **THEN** the tooltip is shown once, 800 ms later, and a scroll end reported later does not show it again

#### Scenario: Rejected again after the fallback

- **WHEN** the tooltip was shown by the 800 ms fallback, the user made the value valid and then invalid again, and a save is rejected before any scroll end is reported
- **THEN** no tooltip opens

### Requirement: Validation tooltip lifetime

The validation tooltip SHALL hide as soon as every control in the editor is valid again, and SHALL stay open and follow the field when a container scrolls. Tooltips the consumer projects into the editor SHALL keep their own default scroll behaviour.

#### Scenario: Value corrected

- **WHEN** the tooltip is open and the user enters a valid value
- **THEN** the tooltip hides

### Requirement: Cancelling

Escape or the cancel action button SHALL restore the value the editor opened with, switch to view mode, emit `canceled` and return focus. Cancelling MUST NOT run validation.

#### Scenario: Cancel after typing

- **WHEN** the value was "TEST", the user types " UPDATED" and clicks the cancel button
- **THEN** the bound value is "TEST" again and `canceled` is emitted

#### Scenario: Escape

- **WHEN** the editor is open and the user presses Escape
- **THEN** the inline edit returns to view mode and `canceled` is emitted

### Requirement: Restoring the value of the form fields

Without `setValueHandler`, cancelling and `rollback()` SHALL write the restored value back into the form fields of the editor only when it is an array, as the default snapshot is: its items in document order, each into the field's form control when it has one, otherwise into the control's own writable value, otherwise through the control's value accessor. Any other value, such as one `getValueHandler` returns, MUST NOT be written back.

#### Scenario: Two form fields

- **WHEN** an editor with "John" and "Doe" is changed to "Jane" and "Smith" and then cancelled
- **THEN** the form holds "John" and "Doe" again

#### Scenario: Pickers bound with value

- **WHEN** a datepicker and a timepicker bound with `[value]` are changed and the editor is cancelled
- **THEN** both pickers show their original values again

#### Scenario: Getter without a setter

- **WHEN** `getValueHandler` returns a string, no `setValueHandler` is bound, and the editor is cancelled after the user changed its input
- **THEN** the input keeps the changed value

### Requirement: Escape ownership

Escape SHALL cancel only when no control in the panel has already handled it by preventing its default action. When it cancels, the inline edit SHALL prevent the key's default action, so an enclosing modal stays open.

#### Scenario: Inline edit inside a modal

- **WHEN** the editor is open inside a modal and the user presses Escape
- **THEN** only the editor closes
- **AND** a second Escape, pressed in view mode, closes the modal

### Requirement: Background save

With `saveHandler` bound, a valid save that is not skipped as unchanged SHALL call the handler synchronously, then switch to view mode and return focus without waiting for the response, and SHALL subscribe to the returned observable exactly once. The value stays in the bound control, so the view can show it before the server confirms it.

#### Scenario: Request in flight

- **WHEN** the user types "Changed" and clicks the save button while the request has not settled
- **THEN** the inline edit is in view mode and shows "Changed"
- **AND** `saved` has not been emitted yet

### Requirement: Errors thrown by the save handler

An exception thrown by `saveHandler` itself SHALL propagate to the caller, leave the editor open and `saveStatus` at `idle`, and MUST NOT be reported as a failed save.

#### Scenario: Handler bound without its receiver

- **WHEN** `saveHandler` is a method bound without `this` and `commit()` is called
- **THEN** `commit()` throws a `TypeError`
- **AND** the editor stays open without `kbq-inline-edit_save-error`

### Requirement: Unchanged values are not sent

With `saveHandler` bound and `compareWith` not `null`, a save whose value still equals the one the editor opened with SHALL close the editor without calling the handler and without emitting `saved`. `compareWith` defaults to `===`, SHALL be applied item by item when both values are arrays, and a comparator that throws SHALL count as a change. With `null`, every save SHALL be sent.

#### Scenario: Nothing changed

- **WHEN** the editor is opened and saved without changes
- **THEN** `saveHandler` is not called and the inline edit is in view mode

#### Scenario: Value changed

- **WHEN** the user changes the value and saves
- **THEN** `saveHandler` is called once

### Requirement: Save status

`saveStatus` SHALL be `idle` without a request, `pending` once a request starts, `progress` while the progress state is shown, and `error` after a failure. The first value the request emits, or its completion without a value, SHALL count as success: the status SHALL return to `idle` and `saved` SHALL be emitted. Later emissions SHALL be ignored.

#### Scenario: Request completes without a value

- **WHEN** the observable returned by `saveHandler` completes without emitting
- **THEN** `saved` is emitted and the status is `idle`

### Requirement: Progress state timing

The host SHALL get the `kbq-progress` class only when a request is still pending `kbqInlineEditSaveProgressDelay` (100 ms) after it started, and SHALL keep it for at least `kbqInlineEditSaveProgressMinimumDuration` (300 ms); a result arriving earlier SHALL be applied, and `saved` emitted, when that time is over.

#### Scenario: Fast response

- **WHEN** the server answers within 99 ms
- **THEN** the host never carries `kbq-progress`

#### Scenario: Slow response

- **WHEN** the server answers 10 ms after the progress state appeared
- **THEN** the host keeps `kbq-progress` for 300 ms in total
- **AND** `saved` is emitted only then

### Requirement: Editing is locked while a request is in flight

While `saveStatus` is `pending` or `progress`, click, Enter and Space MUST NOT open the editor and `toggleMode()` SHALL do nothing, while the view keeps its tab stop.

#### Scenario: Reopening during the request

- **WHEN** a request is in progress and the user clicks the field or presses Enter on it
- **THEN** the inline edit stays in view mode and its view keeps `tabindex="0"`

### Requirement: Failed save

When the request errors, the status SHALL become `error`, the host SHALL get `kbq-inline-edit_save-error`, the value SHALL stay in the bound control, and `saveError` SHALL emit a context with the error and the inline edit, after which the save error handler SHALL be called with the same context. `saved` MUST NOT be emitted.

#### Scenario: Server rejects the value

- **WHEN** the user saves "Changed" and the request errors
- **THEN** the host carries `kbq-inline-edit_save-error` and the view shows "Changed"
- **AND** `saveError` and the provided handler receive `{ error, inlineEdit }`

### Requirement: Save error handler

The `saveErrorHandler` input SHALL default to the `KBQ_INLINE_EDIT_SAVE_ERROR_HANDLER` resolved from the inline edit's injector. A bound handler SHALL replace it, and `null` SHALL leave the inline edit without one.

#### Scenario: Handler bound on the field

- **WHEN** a handler is provided through the token and another one is bound to `saveErrorHandler`
- **THEN** only the bound handler is called when the save fails

### Requirement: Failed state persists

The failed state SHALL last until a new request starts, from a save or from `retrySave()`, or `rollback()` is called, and SHALL come back when that request fails. Reopening the editor or cancelling MUST NOT clear it, and while it lasts a save SHALL be sent even when the value equals the one the editor opened with.

#### Scenario: Editing the rejected value again

- **WHEN** a save has failed and the user reopens the editor and types
- **THEN** `saveStatus` is still `error`

#### Scenario: Saving the same value again

- **WHEN** a save has failed and the user reopens the editor and saves without changes
- **THEN** `saveHandler` is called again

#### Scenario: New request after a failure

- **WHEN** a save has failed and the user reopens the editor and saves again
- **THEN** `saveStatus` is `pending` and the host no longer carries `kbq-inline-edit_save-error` while that request runs

### Requirement: Retrying a failed save

`retrySave()` SHALL start a new request with `saveHandler` for the current value only when the last save failed; otherwise it SHALL do nothing.

#### Scenario: Retry after a failure

- **WHEN** a save has failed and `retrySave()` is called
- **THEN** `saveHandler` is called again and the status is `pending`

#### Scenario: Retry without a failure

- **WHEN** the last save succeeded and `retrySave()` is called
- **THEN** `saveHandler` is not called

### Requirement: Rolling back a failed save

Only after a failed save, `rollback()` SHALL restore the value recorded last, either the value of the last successful request or the value the editor opened with when it was last opened outside the failed state, clear the failed state and close the editor when it is open. Reopening the editor over a rejected value MUST NOT change what `rollback()` restores.

#### Scenario: Rollback after a successful save

- **WHEN** "Saved" was saved, then "Rejected" failed, and `rollback()` is called
- **THEN** the control holds "Saved" and the status is `idle`

#### Scenario: Rollback with the editor open

- **WHEN** a save failed, the user reopened the editor and `rollback()` is called
- **THEN** the inline edit is in view mode with the value it had before the failed save

#### Scenario: Value left by closing in code

- **WHEN** the user typed "Draft", the editor was closed with `toggleMode()` and reopened, a save of "Rejected" failed, and `rollback()` is called
- **THEN** the control holds "Draft"

### Requirement: Requests outlive the inline edit

A request MUST NOT be cancelled when the inline edit is destroyed. Once it is destroyed, `saved` and `saveError` SHALL stay silent, while the save error handler SHALL still be called on failure.

#### Scenario: Row removed during a failing request

- **WHEN** the inline edit is destroyed and its request then errors
- **THEN** the provided save error handler is called once and `saveError` is not emitted

### Requirement: Action menu

An element marked `kbqInlineEditMenu` SHALL get `role="button"` and the class `kbq-inline-edit__menu`, and SHALL stop the propagation of its clicks and of Enter and Space, so using it never opens the editor. While a dropdown it triggers is open, it SHALL carry `kbq-active`. The library MUST NOT give it an accessible name.

#### Scenario: Click on the menu

- **WHEN** the user clicks the menu button
- **THEN** the inline edit stays in view mode

#### Scenario: Open dropdown

- **WHEN** the menu's dropdown is open
- **THEN** the menu button carries `kbq-active`

### Requirement: Action menu visibility

The menu SHALL be rendered only in view mode, also while the inline edit is disabled, and the host SHALL carry `kbq-inline-edit_with-menu` while a menu is projected.

#### Scenario: Disabled field with a menu

- **WHEN** a disabled inline edit has a menu
- **THEN** the menu button is rendered and can open its dropdown

### Requirement: Mode binding

Writing `'edit'` or `'view'` to `mode`, for example through `[(mode)]`, SHALL open or close the editor, with the panel measured and placed as when a user opens it.

#### Scenario: Two-way bound mode

- **WHEN** the bound mode is set to `'edit'` and then to `'view'`
- **THEN** the panel appears and then disappears

### Requirement: Switching modes in code

`toggleMode()` SHALL switch between the modes unless a request is in flight. Closing the editor through `toggleMode()` or `mode` MUST NOT validate, save, restore the value or emit `saved` or `canceled`: what the user typed stays in the bound control.

#### Scenario: Closing in code after typing

- **WHEN** the user types in the editor and `toggleMode()` is called
- **THEN** the inline edit is in view mode, the typed value stays in the control, and neither `saved` nor `canceled` is emitted

### Requirement: Committing in code

`commit()` SHALL save exactly as the save button does, validation included, and SHALL be safe to call from an `effect()`: the effect MUST NOT run again because of the inline edit's own state changing.

#### Scenario: Commit from an effect

- **WHEN** an effect calls `commit()` and the user opens the editor again
- **THEN** the inline edit is in edit mode and the effect has run once

### Requirement: Select-style editor

When the editor holds a single-value `kbq-select` (neither `multiple` nor `multiline`), the host SHALL carry `kbq-inline-edit_select`, the panel SHALL carry `kbq-inline-edit__panel_select` and hide the select's own field, and the select's options panel SHALL be anchored to the inline edit's host. A multiple or multiline select SHALL get the regular editor.

#### Scenario: Single select

- **WHEN** the editor holds a single select and the user opens it
- **THEN** the host carries `kbq-inline-edit_select` and the options panel is anchored to the host

#### Scenario: Multiple select

- **WHEN** the editor holds a `multiple` select
- **THEN** the host does not carry `kbq-inline-edit_select` and the panel has no `kbq-inline-edit__panel_select`

### Requirement: Tab off the panel

Tab on the last tabbable control of the panel, or Shift+Tab on the first, SHALL prevent the key's default action, save, and move focus to the next or previous tab stop outside the field and its panel. Tab on any other control SHALL move within the panel. When a control has prevented the key's default action and moved focus itself, the key SHALL be left to it.

#### Scenario: Tab from the last control

- **WHEN** the last control of the panel has focus and the user presses Tab
- **THEN** the value is saved and the tab stop after the field has focus

#### Scenario: Tab from a control in the middle

- **WHEN** the first of two inputs has focus and the user presses Tab
- **THEN** nothing is saved

#### Scenario: Control that handles Tab itself

- **WHEN** the focused control prevents Tab's default action and moves focus elsewhere
- **THEN** the editor stays open and focus stays where the control put it

### Requirement: Choosing the next tab stop

Tab-out SHALL skip tab stops that refuse focus, such as hidden controls, and MUST NOT choose one inside an overlay that does not contain the field. When no tab stop takes focus, the field's own tab stop SHALL take it with a keyboard focus origin.

#### Scenario: Hidden control after the field

- **WHEN** the next tab stop refuses focus and the user tabs out of the panel
- **THEN** the tab stop after it receives focus

#### Scenario: Nothing follows the field

- **WHEN** no tab stop follows the field and the user tabs out of the panel
- **THEN** the field's view receives focus

### Requirement: Chaining into the next inline edit

When the tab stop that receives focus on Tab-out belongs to another enabled inline edit in view mode, that inline edit SHALL open its editor as if opened from the keyboard, forwards with Tab and backwards with Shift+Tab, while the field left behind stays in view mode.

#### Scenario: Column of fields

- **WHEN** the editor of the second field is open and the user presses Tab twice
- **THEN** the third and then the fourth field open their editors

#### Scenario: Focus ring of the chained field

- **WHEN** a field opened by chaining is cancelled with Escape
- **THEN** its host carries `cdk-keyboard-focused`

### Requirement: Tab out of a select editor

For an editor holding a `kbq-select`, Tab or Shift+Tab pressed outside the edit panel, such as in the options panel, SHALL save and move focus as for Tab-out once the select's options panel has closed; while the select keeps it open, the key SHALL be left to the select. Tab with Ctrl, Cmd or Alt SHALL be ignored.

#### Scenario: Tab in the options panel

- **WHEN** the options panel of a select editor is open and the user presses Tab
- **THEN** the field returns to view mode and the next inline edit opens its editor

### Requirement: Rejected value on Tab-out

When the save requested by Tab-out is rejected, the editor SHALL stay open and focus SHALL stay in the panel, moved back to its first tabbable control when it had left the panel.

#### Scenario: Invalid value

- **WHEN** a required textarea is empty and the user presses Tab on it
- **THEN** the key's default action is prevented, the editor stays open and the textarea keeps focus

### Requirement: Focus return after editing

After a save or a cancel, when focus is on the page body or still inside the panel, focus SHALL move one task later to the field's tab stop — the view or a newly rendered focus anchor — with the focus origin the editor was opened with, or `program` when it was opened in code. Focus already on another element MUST NOT be moved there, but closing the panel SHALL focus the element that held focus when the editor opened. Tab-out follows its own rule.

#### Scenario: Cancel

- **WHEN** the editor is cancelled with Escape
- **THEN** the view receives focus

#### Scenario: Interactive view

- **WHEN** an inline edit whose view holds tags is saved
- **THEN** the newly rendered focus anchor receives focus

#### Scenario: Opened in code

- **WHEN** the editor was opened by writing `mode` and is then committed
- **THEN** the host carries `cdk-program-focused` and not `cdk-mouse-focused`

#### Scenario: Click on another control

- **WHEN** the editor was opened from the focused view and the user clicks a button elsewhere on the page
- **THEN** the value is saved and the view takes focus back from that button

### Requirement: Widget semantics of the view

Without interactive content, the view (`.kbq-inline-edit__view-content`) SHALL have `role="button"`, `aria-expanded` reflecting the mode, `tabindex="0"` in view mode and `tabindex="-1"` in edit mode, and an `aria-label` taken from the `aria-label` input, or from the localized `a11y.edit` when that input is missing or empty.

#### Scenario: Default name

- **WHEN** an inline edit without `aria-label` is rendered in view mode
- **THEN** the view has `role="button"`, `tabindex="0"`, `aria-expanded="false"` and the `a11y.edit` text as `aria-label`

#### Scenario: Editor open

- **WHEN** the editor opens
- **THEN** the view has `aria-expanded="true"`

#### Scenario: Custom name

- **WHEN** `aria-label="Assignee"` is set on the inline edit
- **THEN** the view's `aria-label` is "Assignee"

### Requirement: Host carries no accessible name

An `aria-label` set on `kbq-inline-edit` MUST NOT remain on the host element, which has no role.

#### Scenario: Named field

- **WHEN** `aria-label="Assignee"` is set on the inline edit
- **THEN** the host has no `aria-label` attribute

### Requirement: Disabled inline edit

With `disabled` set, the host SHALL carry `kbq-inline-edit_disabled`, the view SHALL have `tabindex="-1"` and, unless it holds interactive content, `aria-disabled="true"`, and click, Enter and Space MUST NOT open the editor.

#### Scenario: Disabled field

- **WHEN** a disabled inline edit is rendered
- **THEN** its view has `aria-disabled="true"` and `tabindex="-1"`

#### Scenario: Click on a disabled field

- **WHEN** the user clicks a disabled inline edit
- **THEN** it stays in view mode

### Requirement: Focus classes of the host

The host SHALL carry the CDK focus-origin classes (`cdk-focused`, `cdk-keyboard-focused`, `cdk-mouse-focused`, `cdk-program-focused`) while focus is anywhere inside it, and `kbq-inline-edit_anchor-focused` while the focus anchor holds focus. The host SHALL draw its focus ring while the view holds keyboard focus or the focus anchor holds focus of any origin, and not while another element inside it holds focus.

#### Scenario: Keyboard focus on the view

- **WHEN** the user tabs onto the view
- **THEN** the host carries `cdk-keyboard-focused` and draws its focus ring

#### Scenario: Focus on another control inside the host

- **WHEN** the user tabs onto a link in the view or a control in the label
- **THEN** the host carries `cdk-keyboard-focused` but draws no focus ring of its own

#### Scenario: Focus anchor

- **WHEN** the focus anchor receives focus and then loses it
- **THEN** the host carries `kbq-inline-edit_anchor-focused` and then no longer does

#### Scenario: Focus anchor after a pointer edit

- **WHEN** an inline edit whose view holds tags is opened with a click and saved with Enter
- **THEN** the focus anchor receives focus with the `mouse` origin and the host draws its focus ring

### Requirement: Edit panel adds no tab stops

Apart from the save and cancel buttons that `showActions` adds, the edit panel MUST NOT add tab stops of its own, such as focus-trap anchors, and MUST NOT trap focus.

#### Scenario: Open editor

- **WHEN** the editor of a field with a single input is open
- **THEN** no element in the overlay pane has `tabindex="0"`

#### Scenario: Action buttons

- **WHEN** `showActions` is set and the user presses Tab twice from the editor's input
- **THEN** focus moves to the save button and then to the cancel button, both inside the panel

### Requirement: Save status announcement

The host SHALL contain a visually hidden `role="status"` live region that reads the localized `a11y.saving` while the progress state is shown, `a11y.saveFailed` after a failed save, and nothing otherwise.

#### Scenario: Progress

- **WHEN** the progress state appears under the `ru-RU` locale
- **THEN** the live region reads "Сохранение"

#### Scenario: Failure

- **WHEN** a save fails under the `ru-RU` locale
- **THEN** the live region reads "Не удалось сохранить"

### Requirement: Accessibility checks

The inline edit SHALL pass the axe checks that run in the unit suite, both in view mode and with the editor open.

#### Scenario: Both modes

- **WHEN** axe runs on an inline edit in view mode and on the overlay container with its editor open
- **THEN** it reports no violations

### Requirement: Value snapshot

Each time the editor opens, one task after the panel appears, the inline edit SHALL take the value that cancelling restores and that `compareWith` compares against: the result of `getValueHandler` when bound, otherwise a list of the values of every form field's control in the editor, in document order.

#### Scenario: Custom getter

- **WHEN** `getValueHandler` returns the value of a file upload and the editor opens
- **THEN** cancelling restores that value through `setValueHandler`

### Requirement: Custom value setter

When `setValueHandler` is bound, cancelling and `rollback()` SHALL pass it the value to restore instead of writing to the form fields.

#### Scenario: Rollback without form fields

- **WHEN** the editor holds no form field, the handlers read and write a control, and a failed save is rolled back
- **THEN** `setValueHandler` restores the control to its value before the failed save

### Requirement: Localized strings

The view's default name and the names and announcements of the inline edit SHALL come from the `a11y` locale section (`edit`, `save`, `cancel`, `saving`, `saveFailed`) and follow the active locale. The `localeOverrides` input SHALL override these strings for one inline edit and its subtree.

#### Scenario: Default locale

- **WHEN** no locale is configured
- **THEN** the view is named with the `ru-RU` `a11y.edit` text

#### Scenario: Override on one field

- **WHEN** `localeOverrides` sets `a11y.edit` to "Change" on one inline edit
- **THEN** only that inline edit's view is named "Change"
