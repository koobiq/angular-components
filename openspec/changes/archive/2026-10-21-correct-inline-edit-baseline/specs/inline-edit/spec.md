# inline-edit Specification Delta

## MODIFIED Requirements

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

### Requirement: Click outside the panel

A click outside the panel SHALL request a save, unless it lands in an overlay opened above the panel that listens for clicks outside itself, such as a select's options panel, a datepicker's calendar or a dropdown: such a click MUST NOT request a save. When the click lands on the inline edit's own host, its default action and propagation SHALL be stopped, so it saves without reopening the editor.

#### Scenario: Click on the field while editing

- **WHEN** the editor is open and the user clicks the inline edit's host
- **THEN** the value is saved and the inline edit stays in view mode

#### Scenario: Click in the options panel of a select

- **WHEN** the editor holds a `kbq-select` with its options panel open and the user clicks an option
- **THEN** that click requests no save of the inline edit

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
