A toast is a non-modal message displayed on top of all elements on the screen. It differs from a popup in that it appears in the top right corner of the screen and is not tied to any specific interface element. It is used when no mandatory user response is required (i.e., a modal window is not needed).

<!-- example(toast-overview) -->

### How it works

#### Message length

The recommended message length is 144 characters, and the title length is 80 characters. Long text is not truncated — the toast grows in height.

#### Toast types

**Information.** Any system message that does not require an immediate response, or for which there was no suitable place to embed in the on-screen content. For example, it can inform the user that a background operation has been launched by their command.

**Success.** A message about a completed operation. May include a "Cancel" button. It is useful to offer the user the option to view the result of the operation, if possible.

**Warning.** Helps the user avoid an error. This type of toast is used rarely.

**Error.** Reports an unsuccessful operation when the situation does not require immediate user intervention and work can continue.

<!-- example(toast-types-overview) -->

#### Message appearance

Toasts appear in the top right corner. Multiple messages form a stack on the screen. New messages appear at the bottom of the list. If there are many toasts, new ones may extend beyond the bottom boundary of the visible area. Most often, a toast opens in response to a user command, but the system can also show notifications on its own.

#### Disappearance

By default, toasts are hidden automatically. A message must remain in the toast list for at least 5 seconds before being hidden. Toasts disappear with a 2-second interval after the last dismissal (automatic or manual), so the user has time to read the text and the disappearance does not feel sudden.

##### By timer (default behavior)

The toast is hidden automatically. The message must be shown for at least 5 seconds.

##### On command

Messages do not disappear over time. The user can hide a toast using the "Close" button.

At the designer's request, a toast may close via a button in the action panel, by following a link in the message text, or after any other event. For example, after a file upload or another process that the toast was reporting on is complete.

##### On hover or focus

When the mouse hovers over or focus is on a message, all toasts stop disappearing. After the mouse leaves or focus is lost, messages with auto-hide begin disappearing one after another with an interval of 2–5 seconds. The condition must be met that the message was shown for at least 5 seconds and 2 seconds have passed between toast closings.

#### Close button

The option to hide a toast using the icon button in the corner is available by default. This action is not duplicated by an element in the action panel.

Sometimes it is useful to make a toast without a close × icon button. For example, when you need to show the progress of a background operation. In this case, a "Cancel" button with text should be placed in the action panel to allow interrupting the operation.

#### Actions

Do not use toasts [to confirm commands](/en/components/modal/overview#simple-dialog-without-a-header).

The toast action panel can contain two elements. As a rule, triggering an action closes the toast.

If there are more actions, the primary one should be shown first, and the rest hidden in a "More" menu. The menu name may differ if another name is more appropriate.

<!-- example(toast-actions-overview) -->

A toast notification may contain a button to cancel an operation. The close × icon button cannot serve this purpose — it only hides the toast.

<!-- example(toast-report-overview) -->

#### Links in message text

A link can be inserted into the message text (recommendation: no more than one).

<!-- example(toast-link-overview) -->

#### Notification center and toast messages

Push messages from the Notification Center should be shown as toasts in a unified list with system messages.

At the designer's request, some toast messages may be recorded in the Notification Center. When a toast closes, it is useful to be able to review what happened and read error details. At the same time, there is no requirement to log every Notification Center message.

### Focus and keyboard navigation

| <div style="min-width: 130px;">Key</div>                                                        | Action                                         |
| ----------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| <span class="docs-hot-key-button">Tab</span> <span class="docs-hot-key-button">Shift+Tab</span> | Move to the next or previous focusable element |
| <span class="docs-hot-key-button">Esc</span>                                                    | Close the toast                                |

#### Tab sequence

1. Inline link inside the toast text
2. Close button
3. Action 1
4. Action 2
5. Inline link inside the next toast text
6. …
7. "Skip to content" link (optional)
8. First element in the [Main menu](/en/components/navbar)
9. …

### Design and animation

#### Position on screen

The toast appears in the top right corner of the screen. Multiple messages form a stack on the screen; new toasts are added at the bottom of the stack.

The position can be changed using `kbqToastConfigurationProvider`:

```ts
import { kbqToastConfigurationProvider, KbqToastPosition } from '@koobiq/components/toast';

@NgModule({
    providers: [
        kbqToastConfigurationProvider({ position: KbqToastPosition.BOTTOM_RIGHT })
    ]
})
```

#### Sizes

The width of the toast is fixed; the height depends on the content.

#### Animation

##### Appearance

The toast appears from the left horizontally. As it slides in, the new element becomes fully opaque. The height of the toast panel does not change.

##### Disappearance

The toast slides horizontally to the right beyond the screen edge. The toast window height does not change. As it slides, the element becomes transparent. Messages below it smoothly rise to fill the freed space in the stack.
