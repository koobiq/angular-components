A modal dialog opens as a window on top of the page, dims the underlying layer, and blocks all interaction with it. The modal dialog focuses the user's attention on its content.

<!-- example(modal-component) -->

### When to use

Use modal dialogs for short-term tasks and user-triggered operations (you can open a short form, settings). It can be convenient to show hidden content in a modal window. Modals help accomplish tasks efficiently without losing context of the main page. Despite their versatility, modal windows are [not suitable for all situations](/en/components/modal/overview#related-components).

### Component structure

- Header. Dialog title
- Close action
- Body. Contains message text, a question, controls, and input fields
- Footer. Action buttons, option to cancel the operation or close the dialog

Many of these parts may be absent. The body and the ability to close the dialog must remain. The required way to close the dialog is the × (cross) in the header or the "Cancel" ("Close") button in the footer.

#### Simple dialog without a header

Resembles a browser alert. Use when the system asks a single question or delivers a short message, to avoid redundant text duplication in the title and body of the modal window. Such dialogs do not have a close × icon in the top right corner.

<!-- example(modal-overview) -->

### How it works

The page is dimmed and cannot be interacted with: buttons cannot be clicked, there is no hover, scrolling, etc. On top of the dim, the modal dialog window opens.

A dialog may open from a user action. The system can also block the user with a modal dialog, but such abrupt interruption should be avoided whenever possible.

#### How to close the dialog

- Performing the primary or secondary dialog actions (buttons in the footer)
- The "Cancel" or "Close" button in the footer
- The × in the header — only when the dialog heading is unavoidable
- Clicking outside the modal window. By default, modal windows do not close this way. However, closing by clicking outside the window can be useful when there is no risk of data loss and the system is not awaiting user input (for example, when there are no terminal buttons in the window).
- The Esc key (equivalent to the "Cancel" button)

Do not close a modal window automatically by timeout, as the user may not have had time to read the information inside.

Sometimes the system cannot allow the user to return to interacting with the page. Even in this situation, the modal window should not be a dead end in the use case — action options must be provided. For example, if the system shows a window about an expired session, returning to the page in the background is not possible — but a link to the login page should be offered.

#### Remembering user data

If any data has been entered in the window, it must be remembered and shown again when the dialog is reopened. For example, when a create form was being filled out. If an edit form was opened in a modal, changes were started but not saved, and the modal was closed, then unsaved data should not be pre-filled when reopening.

#### Scrolling

The page background does not scroll. The height of the modal window is determined by its content. The window stretches in height and occupies the full available screen height, minus 48px padding on each side.

Only the central part (body) of the dialog scrolls. The header and footer remain visible. They cast a shadow. The scrollbar appears inside the modal content block. It should be flush with the right edge of the window, without any offset.

A long modal is a clear sign that a [different component or a separate page](/en/components/modal/overview#related-components) should be used.

<!-- example(modal-scroll) -->

#### Focus and keyboard navigation

When a modal dialog is open, focus moves only through elements inside the window, including the × button and the footer buttons. Focus does not leave the modal.

##### Focus when opening a modal dialog

When a dialog opens, focus moves to an element inside the dialog. The focus placement depends on the nature and size of the content.

- Focus is placed on the first available element inside the dialog body, unless otherwise specified
- If the dialog contains a form, focus should be placed in the first input field
- If the dialog window contains an important irreversible action, it is better to place focus on a different, less destructive element
- If the dialog contains only terminal buttons, it is useful to place focus on the button the user is most likely to press ("OK" or "Cancel", depending on the situation)
- If the modal window contains a lot of content with scrolling, placing focus on the first available element may automatically scroll the window content and hide the beginning. In this case, add `tabindex=-1` to a static element at the start of the content and focus on it. This element can be a heading, the first paragraph, etc.

##### Focus after closing the modal window

When the dialog is closed, focus returns by default to the element that triggered it.

If the trigger element no longer exists, focus returns to another element appropriate to the interaction logic.

In some situations, focus may intentionally return to a different element than the one that originally opened the dialog:

- It is unlikely that the user will want to immediately open the same dialog again
- The task performed in the dialog is directly related to the next step in the workflow. For example, a table has a toolbar with an "Add rows" button. The button opens a dialog asking for the number of new rows. After the dialog is closed, focus is placed in the first cell of the first new row.

##### Keyboard navigation

| <div style="min-width: 100px;">Key</div>                                                   | Action                                                                                                                        |
| ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| <span class="docs-hot-key-button">Ctrl</span> + <span class="docs-hot-key-button">↵</span> | Performs the primary dialog action                                                                                            |
| <span class="docs-hot-key-button">Esc</span>                                               | Close the dialog:<br>1. If no data was changed in the dialog<br>2. If the focused element has no its own handler for this key |
| <span class="docs-hot-key-button">↵</span>                                                 | Submit the form by pressing Enter in any text input                                                                           |

### Validation

A form may be placed in the window body. Terminal submit buttons must be located in the window footer. [Validation follows general rules](/en/other/validation).

### Design and animation

#### Position

The window opens centered on screen with a 48px offset from the top edge. If the page was scrolled, there should be no horizontal shift when the dialog opens (this often occurs when the scrollbar appears and disappears when opening or closing a modal).

#### Size

There is no horizontal scroll; content in the panel must fit within the width.

| Preset | Width         |
| ------ | ------------- |
| Small  | 400           |
| Medium | 640 (default) |
| Large  | 960           |

<!-- example(modal-sizes) -->

#### Button panel

Terminal buttons are located in the lower right corner of the footer. Order: primary action, secondary action, cancel. Additional action buttons are located in the lower left corner.

<!-- example(modal-template) -->

#### Overlapping modal windows

Opening one modal dialog from another is incorrect. But if it happens (as an economy measure or forced workaround), only one dim overlay should remain. The page background and the parent modal sit beneath it. Multiple dim overlays is a mistake.

<!-- example(modal-multiple) -->

### Related components

A modal dialog abruptly concentrates attention on itself, causes the user to lose focus, and prevents interaction with the page beneath it. Therefore, in most cases you should try to avoid modality. These approaches will help you treat the user considerately and avoid modal window stacking:

A [Popover](/en/components/popover) captures the user's attention less disruptively. It does not interfere with interacting with the rest of the page and does not limit freedom. A popover is easier to accidentally close. If the system is waiting for an important response, or it is unclear what will happen if the popover is closed, use the trusty modal dialog.

A [Side panel](/en/components/sidepanel) is something between a new page and a modal window. It stretches the full height of the browser window; long and narrow pages look better in it than in a modal window, while wide and low pages look worse. Side panels stack on each other well, while modal windows should not be used with such stacking.

**Inline messages and inline forms** help show new content on the same layer of the page and do so less intrusively. This technique is actively used to display errors for the entire form — or to warn the user in advance about something important. Inline forms help avoid modal modes, new screens, and nesting in complex forms. For example, when you need to add a new object consisting of several fields (first name, last name, middle name) to a collection.

**Accordion**, "Show more" pattern, [tooltip](/en/components/tooltip) will help when you simply need to show additional content. This option is suitable for less important things than inline messages.

A toast notification will briefly report the result of an operation or show a completely unimportant message. Toast notifications are used when it is acceptable for the person to miss the message, when the message can quickly become irrelevant, or when there is another way to read it (for example, in the notification center).

**A new page** replaces a modal window when a lot of content, a long form, or a list needs to be shown. This approach allows content to be presented fully, with focus and without loss of functionality (for example, navigation).

**The "Undo changes" pattern.** Instead of a "Are you sure?" modal dialog, it is often better to immediately perform the operation — and give the ability to undo it.
