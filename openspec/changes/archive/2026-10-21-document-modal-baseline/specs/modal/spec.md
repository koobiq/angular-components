# Spec Delta

## Purpose

Describes what `kbq-modal`, `KbqModalService` and the composition directives from `@koobiq/components/modal` guarantee to consumers: how a dialog is opened and closed, which layouts and parts it renders, how its OK and Cancel flows decide the close, and how it handles focus, the keyboard, the pointer and the page behind it.

## ADDED Requirements

### Requirement: Opening a dialog through the service

`KbqModalService.create(options)` SHALL open a dialog at once in an overlay of its own and return its `KbqModalRef`. `confirm()`, `success()` and `delete()` SHALL open the confirm layout, and `open()` the custom layout; `create()` uses the layout in `kbqModalType`, `'default'` when it is not given. The service SHALL be injectable from the root injector without importing `KbqModalModule`.

#### Scenario: Creating a dialog

- **WHEN** a consumer calls `create({ kbqTitle: 'Title' })`
- **THEN** a dialog with the default layout is shown in a new overlay
- **AND** the call returns a ref whose `getInstance().kbqVisible()` is `true`

#### Scenario: Service without the module

- **WHEN** a standalone component that does not import `KbqModalModule` injects `KbqModalService` and calls `create()`
- **THEN** the dialog opens and is tracked in `openModals`

### Requirement: Confirm dialog variants

`confirm(options, confirmType)` SHALL add the classes `kbq-confirm` and `kbq-confirm-<confirmType>` in front of `kbqClassName` on the dialog element; `confirmType` defaults to `'confirm'`. `success()` SHALL use `'success'` and `delete()` SHALL use `'warn'`. Apart from these classes the three variants SHALL render the same.

#### Scenario: Delete dialog

- **WHEN** a consumer calls `delete({ kbqClassName: 'mine' })`
- **THEN** the dialog element has the classes `kbq-confirm`, `kbq-confirm-warn` and `mine`

### Requirement: Declarative dialog

A `<kbq-modal>` in a template SHALL be shown while `kbqVisible` is `true` and hidden otherwise, and SHALL support `[(kbqVisible)]`. By default it SHALL move its element into an overlay of its own. Setting `kbqVisible` to `false` through the binding SHALL close it without running the Cancel flow. When the dialog closes itself, it SHALL write `false` back through `kbqVisibleChange`.

#### Scenario: Opening through the binding

- **WHEN** the bound property of `[(kbqVisible)]` becomes `true`
- **THEN** the dialog is shown in an overlay

#### Scenario: Closing from inside

- **WHEN** the user closes a declarative dialog with its close button
- **THEN** the bound property becomes `false`

### Requirement: Initial visibility of a declarative dialog

A declarative dialog that starts hidden MUST NOT emit `kbqBeforeClose` or `kbqAfterClose` before it has been shown. A declarative dialog whose `kbqVisible` is `true` from the first render SHALL be shown without the opening animation and SHALL still emit `kbqAfterOpen`.

#### Scenario: Never opened

- **WHEN** a `<kbq-modal>` is rendered with `kbqVisible` `false` and later destroyed
- **THEN** neither `kbqBeforeClose` nor `kbqAfterClose` is emitted

### Requirement: Opening and closing from code

`open()` SHALL show a hidden dialog and `close(result)` SHALL start closing a shown one with `result` as its close result. Calling either on a dialog already in that state MUST do nothing, so `kbqAfterClose` emits once per actual close. `destroy(result)` SHALL act exactly as `close(result)`.

#### Scenario: Closing twice

- **WHEN** a consumer calls `close()` twice on a shown dialog
- **THEN** `afterClose` emits once

#### Scenario: Result passed to close

- **WHEN** a consumer calls `destroy({ data: 'Fake Error' })`
- **THEN** `afterClose` emits `{ data: 'Fake Error' }`

### Requirement: Calls from reactive contexts

`open()`, `close()`, `triggerOk()`, `triggerCancel()` and `KbqModalService.create()` MUST NOT make an Angular `effect()` that calls them depend on the dialog's state, so the effect does not run again when the dialog opens or closes.

#### Scenario: Effect that creates a dialog

- **WHEN** an effect calls `create()` and the user later closes that dialog
- **THEN** the effect has run once and no second dialog is created

#### Scenario: Effect that opens a dialog

- **WHEN** an effect calls `open()` on a declarative dialog and the user presses Escape
- **THEN** the dialog closes and the effect does not run again

### Requirement: Open and close events

`afterOpen` (output `kbqAfterOpen`) SHALL emit once the opening animation has ended. `beforeClose` (output `kbqBeforeClose`) SHALL emit synchronously when closing starts, and `afterClose` (output `kbqAfterClose`) once the closing animation has ended, both with the close result. Emitters passed as the `kbqAfterOpen`, `kbqAfterClose`, `kbqOnOk` and `kbqOnCancel` options SHALL mirror the dialog's events without replacing them.

#### Scenario: Waiting for the animation

- **WHEN** a dialog is created and its opening animation has not ended
- **THEN** `afterOpen` has not emitted, and it emits once the animation ends

#### Scenario: Mirrored emitter

- **WHEN** an `EventEmitter` is passed as `kbqAfterClose` and the dialog closes
- **THEN** both that emitter and `afterClose` of the ref emit

### Requirement: Motion

The dialog SHALL zoom and fade in and out, and its dim layer SHALL fade. When animations are disabled through `KBQ_ANIMATIONS_CONFIG`, `NoopAnimations` or `prefers-reduced-motion: reduce`, read from the dialog's own injector, the dialog MUST NOT animate, and `afterOpen` and `afterClose` SHALL emit as soon as the new state has been rendered.

#### Scenario: Animations disabled

- **WHEN** `KBQ_ANIMATIONS_CONFIG` disables animations and a dialog is opened and closed
- **THEN** the dialog element never gets the `zoom-enter` class
- **AND** `afterOpen` and `afterClose` emit right after the next render

#### Scenario: Reduced motion

- **WHEN** the user prefers reduced motion and a dialog is created before the first change detection
- **THEN** `afterOpen` emits only once the dialog body has been rendered

### Requirement: Teardown of a service dialog

A dialog created by the service SHALL be removed with its overlay once `afterClose` has emitted. It SHALL also be torn down at once when the injector given as `options.injector` (or, without one, the service's injector) is destroyed, and when the router navigates. Teardown SHALL release the body scroll lock and the dialog's place among the open dialogs.

#### Scenario: Opener destroyed

- **WHEN** a component passes its own injector to `create()` and is destroyed while the dialog is shown
- **THEN** the dialog element is removed and `document.body` no longer has `overflow: hidden`

### Requirement: Tracking open dialogs

`KbqModalService.openModals` SHALL list the dialogs, declarative ones included, that have finished opening and have not finished closing, in the order they finished opening. `afterAllClose` SHALL emit when the last of them finishes closing. `closeAll()` SHALL close every dialog in `openModals`, starting from the last one.

#### Scenario: Closing everything

- **WHEN** three service dialogs and a declarative dialog are open and `closeAll()` is called
- **THEN** all four close, `openModals` becomes empty and `afterAllClose` emits once

#### Scenario: Dialog still opening

- **WHEN** a dialog has been created and its opening animation has not ended
- **THEN** it is not yet in `openModals`

### Requirement: Header of the default layout

In the default layout the dialog SHALL render a header only when `kbqTitle` or `kbqCaption` is set, with the title above the caption. A string SHALL be rendered as HTML sanitized by Angular, and a `TemplateRef` SHALL be rendered in place. The title and the caption SHALL each be clamped to two lines.

#### Scenario: Title and caption

- **WHEN** a dialog is created with `kbqTitle: 'Dialog title'` and `kbqCaption: 'Dialog caption'`
- **THEN** its header shows the title with the caption below it

#### Scenario: Neither title nor caption

- **WHEN** a default dialog has no `kbqTitle` and no `kbqCaption`
- **THEN** no header and no close button are rendered

### Requirement: Close button

Every rendered header SHALL contain a close button while `kbqClosable` is `true`, which is the default; `kbqClosable` set to `false` SHALL remove it. Activating the button on a shown dialog SHALL run the Cancel flow.

#### Scenario: Closing with the close button

- **WHEN** the user clicks the close button of a shown declarative dialog
- **THEN** `kbqOnCancel` emits once and the dialog closes

#### Scenario: Not closable

- **WHEN** a dialog composed with `kbq-modal-title` is opened with `kbqClosable: false`
- **THEN** its header has no close button

### Requirement: Body content

The body SHALL render `kbqContent`: a string as HTML sanitized by Angular, a `TemplateRef` in place, or a component class as a new instance. Without `kbqContent`, a declarative dialog SHALL render its projected content. A component given as `kbqComponent` SHALL be rendered in the body as well, and SHALL win when both inputs hold a component.

#### Scenario: Component as content

- **WHEN** a default dialog is created with `kbqContent` set to a component class
- **THEN** an instance of that component is rendered in the dialog body

#### Scenario: Projected content

- **WHEN** a `<kbq-modal>` has text between its tags and no `kbqContent`
- **THEN** the body shows that text

### Requirement: Content component access

A content component SHALL be able to inject `KbqModalRef`, which is the dialog itself, and, on the service path, `KBQ_MODAL_DATA`, which holds `options.data`. `getContentComponent()` SHALL return the content component instance once the dialog has initialized, and `undefined` when the body is not a component.

#### Scenario: Closing from the content

- **WHEN** a content component injects `KbqModalRef` and calls `destroy('save')`
- **THEN** the dialog closes and `afterClose` emits `'save'`

#### Scenario: Data for the content

- **WHEN** a dialog is opened with `data: 'Full custom modal caption'`
- **THEN** the content component reads that string from `KBQ_MODAL_DATA`

### Requirement: Injector of the content

A content component SHALL resolve its dependencies from the injector passed as `options.injector`, below the dialog itself. Without that option it SHALL resolve them from the injector of the service that opened it, the root injector by default, so a provider that only the opener declares is not found and the injection error SHALL be reported to the application's `ErrorHandler`.

#### Scenario: Component-level service

- **WHEN** a component that provides a service opens a dialog with `injector` set to its own injector
- **THEN** the content component receives the same service instance

#### Scenario: Missing injector

- **WHEN** the same dialog is opened without `injector`
- **THEN** the `ErrorHandler` receives an error naming the missing service

### Requirement: Footer presence

The default layout SHALL render a footer when `kbqFooter`, `kbqOkText` or `kbqCancelText` is set. A dialog with neither such a footer nor a composed `kbq-modal-footer` SHALL carry the `kbq-modal_no-footer` class on its dialog element.

#### Scenario: Only an OK caption

- **WHEN** a dialog is created with `kbqOkText: 'OK'` and no `kbqFooter`
- **THEN** a footer is rendered

#### Scenario: No footer

- **WHEN** a dialog is created without `kbqFooter`, `kbqOkText` and `kbqCancelText`
- **THEN** no footer is rendered and the dialog element has `kbq-modal_no-footer`

### Requirement: Predefined OK and Cancel buttons

In the default layout without `kbqFooter`, the footer SHALL render an OK button labelled `kbqOkText` in the contrast color, followed by a Cancel button labelled `kbqCancelText`; each is rendered only when its text is set. The OK button SHALL carry the `autofocus` attribute. `kbqOkLoading` and `kbqCancelLoading` SHALL show the progress state of their button.

#### Scenario: Both buttons

- **WHEN** a dialog is created with `kbqOkText: 'Ok'` and `kbqCancelText: 'Cancel'`
- **THEN** the footer shows "Ok" and then "Cancel"

#### Scenario: Progress state

- **WHEN** `kbqOkLoading` is `true`
- **THEN** the OK button has the `kbq-progress` class

### Requirement: Custom footer

In the default layout, `kbqFooter` SHALL replace the predefined buttons: a string SHALL be rendered as sanitized HTML and a `TemplateRef` in place, even when `kbqOkText` or `kbqCancelText` is set.

#### Scenario: Footer template

- **WHEN** a dialog is created with a footer template and with `kbqOkText`
- **THEN** the footer shows the template and no predefined OK button

### Requirement: Footer buttons given as options

An array `kbqFooter` SHALL render one button per entry with its `label`, using `type` as the button color. `show`, `disabled` and `loading` SHALL accept a boolean or a function called with the content component instance. `onClick` SHALL be called with that instance and MUST NOT close the dialog by itself; while a promise it returns is pending, the button SHALL show its progress state.

#### Scenario: Hidden button

- **WHEN** an entry has `show: () => false`
- **THEN** the footer renders no button for it

#### Scenario: Disabled and loading

- **WHEN** one entry has `disabled: () => true` and another `loading: () => true`
- **THEN** the first button is disabled and the second has the `kbq-progress` class

#### Scenario: Click handler

- **WHEN** the user clicks a footer button whose entry has `onClick`
- **THEN** `onClick` is called and the dialog stays open

### Requirement: Footer button markers

A footer entry with `autoFocus: true` SHALL render its button with the `autofocus` attribute, and an entry with `kbqModalMainAction: true` SHALL render it with the `kbq-modal-main-action` attribute. Entries without these flags, or with them set to `false`, MUST NOT get the attributes.

#### Scenario: Marked main action

- **WHEN** of two entries only the second has `kbqModalMainAction: true`
- **THEN** only the second button has the `kbq-modal-main-action` attribute

### Requirement: Confirm layout

The confirm layout SHALL render no header and no close button, whatever `kbqTitle`, `kbqCaption` and `kbqClosable` say. Its footer SHALL hold the OK button, colored by `kbqOkType` (contrast by default) and carrying `autofocus`, followed by the Cancel button, each only when its text is set. `kbqFooter` MUST be ignored, and `confirm()` given `kbqFooter` SHALL warn about it in development mode.

#### Scenario: Title given to a confirm dialog

- **WHEN** `confirm()` is called with `kbqTitle` and `kbqOkText`
- **THEN** the dialog shows no title and no close button, and its footer shows the OK button

#### Scenario: Footer given to a confirm dialog

- **WHEN** `confirm()` is called with `kbqFooter` in development mode
- **THEN** a warning says that the confirm dialog does not support `kbqFooter`

### Requirement: Custom layout

The custom layout SHALL render only the component given as `kbqComponent` (or as `kbqContent`) inside the dialog, with no header, body or footer of its own; the component composes them with the composition directives. String and template content and projected content MUST NOT be rendered in this layout.

#### Scenario: Opening a composed dialog

- **WHEN** `open({ kbqComponent: Custom })` is called and `Custom` renders `kbq-modal-title`, `kbq-modal-body` and `kbq-modal-footer`
- **THEN** the dialog shows that header, body and footer and nothing else

### Requirement: Composed header

`kbq-modal-title` (also `[kbq-modal-title]` and `[kbqModalTitle]`) inside a content component SHALL render its content as the dialog title, project a `kbq-modal-caption` below it, project elements marked `kbqModalTitleActions` beside it outside the two-line clamp, and render the close button while `kbqClosable` is `true`. It SHALL carry the `kbq-modal-header` class.

#### Scenario: Title with a caption

- **WHEN** a content component renders `<kbq-modal-title>Title<kbq-modal-caption>Caption</kbq-modal-caption></kbq-modal-title>`
- **THEN** the header shows "Title" with "Caption" directly below it

### Requirement: Composed body and footer

`kbq-modal-body` (also `[kbq-modal-body]` and `[kbqModalBody]`) SHALL be the scrolling body of a composed dialog, with the class `kbq-modal-body`. `kbq-modal-footer` (also `[kbq-modal-footer]` and `[kbqModalFooter]`) SHALL be its footer, with the class `kbq-modal-footer`, and SHALL keep the dialog from getting `kbq-modal_no-footer`.

#### Scenario: Composed footer

- **WHEN** a content component renders `<div kbq-modal-footer>` with two buttons
- **THEN** the buttons are shown in the dialog footer and the dialog element has no `kbq-modal_no-footer` class

### Requirement: OK flow

The predefined OK button and `triggerOk()` SHALL run the OK flow. Without `kbqOkClick`, it SHALL emit `kbqOnOk` with the content component instance and close the dialog with an `undefined` result. With `kbqOkClick`, it SHALL call the handler with that instance, keep the dialog open when it returns `false`, close it with the returned value as the result otherwise, and MUST NOT emit `kbqOnOk`.

#### Scenario: No handler

- **WHEN** no `kbqOkClick` is bound and `triggerOk()` is called
- **THEN** `kbqOnOk` emits once and the dialog closes

#### Scenario: Handler keeps the dialog open

- **WHEN** `kbqOkClick` returns `false` and the user clicks OK
- **THEN** the dialog stays open and `kbqOnOk` is not emitted

### Requirement: Cancel flow

The predefined Cancel button, the close button, Escape, a press on the dim layer and `triggerCancel()` SHALL run the Cancel flow, which behaves as the OK flow with `kbqCancelClick` and `kbqOnCancel` in place of `kbqOkClick` and `kbqOnOk`.

#### Scenario: Handler vetoes Escape

- **WHEN** `kbqCancelClick` returns `false` and the user presses Escape
- **THEN** the dialog stays open

#### Scenario: Handler allows the close

- **WHEN** `kbqCancelClick` returns nothing and the user presses Escape
- **THEN** the handler is called and the dialog closes

### Requirement: Handler and event bound together

When both a handler (`kbqOkClick`, `kbqCancelClick`) and the matching event (`kbqOnOk`, `kbqOnCancel`) have subscribers, the handler SHALL decide the close, the event MUST NOT be emitted, and in development mode the flow SHALL warn that both are bound.

#### Scenario: Both bound

- **WHEN** `kbqOkClick` returns `false`, `kbqOnOk` has a subscriber and `triggerOk()` is called
- **THEN** `kbqOnOk` is not emitted, the dialog stays open and `console.warn` names `[kbqOkClick]`

### Requirement: Asynchronous handler

When `kbqOkClick` or `kbqCancelClick` returns a promise, the predefined button of that flow SHALL show its progress state until the promise settles. A promise that resolves to `false` SHALL keep the dialog open; one that resolves to any other value SHALL close it with that value as the result.

#### Scenario: Saving before closing

- **WHEN** `kbqOkClick` returns a promise and the user clicks OK
- **THEN** the OK button shows its progress state until the promise resolves
- **AND** the dialog then closes with the resolved value as its result

### Requirement: Escape key

Escape pressed inside a shown dialog SHALL run the Cancel flow and prevent the key's default action while `kbqCloseByESC` is `true`, which is the default. It SHALL also work while the dialog is still opening. Escape MUST be ignored when `kbqCloseByESC` is `false` or when a control inside the dialog has already prevented the event's default action.

#### Scenario: Escape during the opening animation

- **WHEN** the user presses Escape before the opening animation has ended
- **THEN** the dialog closes

#### Scenario: Escape consumed by a control

- **WHEN** a control inside the dialog handles Escape and prevents its default action
- **THEN** the dialog stays open

#### Scenario: Escape turned off

- **WHEN** `kbqCloseByESC` is `false` and the user presses Escape
- **THEN** the dialog stays open

### Requirement: Closing from the dim layer

With both `kbqMask` and `kbqMaskClosable` set, pressing the primary mouse button on the area around a shown dialog SHALL run the Cancel flow. `kbqMaskClosable` SHALL default to `false`. Other mouse buttons, presses inside the dialog, and any press while `kbqMask` is `false` MUST NOT close the dialog.

#### Scenario: Primary button

- **WHEN** `kbqMaskClosable` is `true` and the user presses the left mouse button outside the dialog
- **THEN** the dialog closes

#### Scenario: Right button

- **WHEN** `kbqMaskClosable` is `true` and the user presses the right mouse button outside the dialog
- **THEN** the dialog stays open

### Requirement: Ctrl and Enter

Ctrl+Enter pressed inside a dialog (the Control key on every platform) SHALL run the OK flow in the confirm layout, then, in any layout, click the first element with the `kbq-modal-main-action` attribute, and SHALL prevent the key's default action. The predefined OK button of the default layout MUST NOT carry that attribute, so it is not activated by this shortcut.

#### Scenario: Footer button marked as the main action

- **WHEN** a footer entry has `kbqModalMainAction: true` and the user presses Ctrl+Enter in the dialog
- **THEN** that entry's `onClick` is called

#### Scenario: Confirm dialog

- **WHEN** a confirm dialog has `kbqOkClick` and the user presses Ctrl+Enter
- **THEN** `kbqOkClick` is called

#### Scenario: Default dialog with only predefined buttons

- **WHEN** a default dialog has `kbqOkText` and no element marked `kbq-modal-main-action`, and the user presses Ctrl+Enter
- **THEN** neither the OK flow nor the Cancel flow runs

### Requirement: Dim layer

While `kbqMask` is `true`, which is the default, a shown dialog SHALL render a full-viewport dim layer with the class `kbq-modal-mask` behind it, styled by `kbqMaskStyle`. With `kbqMask` `false` no dim layer SHALL be rendered.

#### Scenario: Dialog without a dim layer

- **WHEN** a dialog is created with `kbqMask: false`
- **THEN** the dialog renders no `kbq-modal-mask` element

### Requirement: One dim layer for stacked dialogs

When a dialog opened through the service appears while other dialogs are shown, the dim layers of those dialogs SHALL fade out so that only one dim layer is painted, and SHALL come back when the new dialog closes. With animations disabled the hand-over SHALL happen at once, without a fade.

#### Scenario: Dialog over a dialog

- **WHEN** a declarative dialog is shown and a service dialog opens over it
- **THEN** the document contains one `kbq-modal-mask`, also after the service dialog has closed

### Requirement: Only the topmost dialog is reachable

While dialogs are stacked, every shown dialog except the last one opened SHALL be marked `inert`, so neither assistive technology, the pointer nor the tab order reaches it. When the topmost dialog closes, the one below SHALL become reachable again.

#### Scenario: Two stacked dialogs

- **WHEN** a second dialog opens over a first one
- **THEN** the first dialog contains an `inert` element and the second does not
- **AND** after the second closes, the first no longer contains one

### Requirement: Page behind the dialog is inert

While any dialog is shown, every child of `document.body` that contains no shown dialog SHALL be marked `inert`, except elements that are or contain an `aria-live` region. The attribute SHALL be removed when no dialog is shown any more. Overlays rendered in the same container as a dialog SHALL stay reachable.

#### Scenario: Opening a dialog

- **WHEN** a dialog opens over a page
- **THEN** the page's element under `document.body` has the `inert` attribute and the overlay container does not
- **AND** the attribute is gone after the dialog has closed

### Requirement: Body scroll lock

While any dialog is shown, `document.body` SHALL have `overflow: hidden`. Once no dialog is shown any more, after the closing animation or teardown, the inline `overflow` style SHALL be removed from the body.

#### Scenario: Shown dialog

- **WHEN** a dialog is shown
- **THEN** `document.body.style.overflow` is `hidden`

### Requirement: Size presets

`kbqSize` SHALL set the width of the dialog from three presets — `ModalSize.Small` (400 px), `ModalSize.Medium` (640 px, the default) and `ModalSize.Large` (960 px) — and SHALL be reflected as the class `kbq-modal_small`, `kbq-modal_medium` or `kbq-modal_large` on the dialog element.

#### Scenario: Small dialog

- **WHEN** a dialog is created with `kbqSize: ModalSize.Small`
- **THEN** the dialog element has the class `kbq-modal_small`

### Requirement: Explicit width

`kbqWidth` SHALL set the width of the dialog element and override the width of the size preset. A number, or a string holding only a number, SHALL be read as pixels; any other string SHALL be used as written.

#### Scenario: Width as a number

- **WHEN** `kbqWidth` is `480`
- **THEN** the dialog element has `width: 480px`

#### Scenario: Width with a unit

- **WHEN** `kbqWidth` is `'50%'`
- **THEN** the dialog element has `width: 50%`

### Requirement: CSS unit pipe

The `toCssUnit` pipe SHALL turn a number, or a string holding only a number, into that number followed by the unit argument (`px` by default), SHALL return any other string unchanged, and SHALL return `null` for `null` and `undefined`.

#### Scenario: Numeric string

- **WHEN** `'400' | toCssUnit` is evaluated
- **THEN** the result is `'400px'`

### Requirement: Classes and styles

`kbqClassName` SHALL add classes to the dialog element and `kbqWrapClassName` to the full-screen wrapper around it. `kbqStyle` SHALL style the dialog element and `kbqBodyStyle` the body of the default and confirm layouts. The `kbq-modal` element itself SHALL carry the `kbq-modal` class.

#### Scenario: Class names

- **WHEN** a dialog is created with `kbqClassName: 'custom-modal'` and `kbqWrapClassName: 'wrap'`
- **THEN** the dialog element has `custom-modal` and its wrapper has `wrap`

### Requirement: Placement and height

The dialog SHALL be centered horizontally and placed one viewport inset (48 px) from the top of the viewport. Its height SHALL follow its content up to the viewport height minus that inset on each side. Past that height only the body SHALL scroll, while the header and the footer stay in place.

#### Scenario: Long content

- **WHEN** the content is taller than the room the viewport leaves
- **THEN** the dialog ends inside the viewport and only its body scrolls
- **AND** the header and the footer do not move when the body is scrolled to its end

#### Scenario: No footer

- **WHEN** a dialog without a footer has a body that overflows
- **THEN** the body reaches the bottom of the dialog and keeps a bottom padding

### Requirement: Scrollbars

The body and the full-screen wrapper SHALL scroll with the library's custom scrollbar instead of the native one, so the content MUST NOT shift sideways when they start or stop scrolling. Once the dialog has opened, each of them that can scroll SHALL briefly reveal its scrollbar.

#### Scenario: Body starts scrolling

- **WHEN** the content of a shown dialog grows until its body scrolls
- **THEN** the content keeps its position and width

#### Scenario: Reveal after opening

- **WHEN** a dialog whose body overflows has opened and the pointer is outside it
- **THEN** the body's scrollbar is revealed

### Requirement: Overflow shadows

While the body is scrolled away from its top, the header SHALL cast a shadow onto it, and while more content lies below the visible part, the footer SHALL cast one. This SHALL hold for the default layout and for a dialog composed with `kbq-modal-title`, `kbq-modal-body` and `kbq-modal-footer`.

#### Scenario: Scrolled to the middle

- **WHEN** the body of an overflowing dialog is scrolled to its middle
- **THEN** both the header and the footer show a shadow

### Requirement: Initial focus

When a dialog is shown, focus SHALL move into it once it has been rendered: to an element marked `cdkFocusInitial`, else to an element with `autofocus`, else as `kbqAutoFocus` says. `'first-tabbable'`, the default, SHALL focus the first tabbable control and fall back to the dialog element when there is none.

#### Scenario: Marked element wins

- **WHEN** the content has a button before another button marked `cdkFocusInitial`
- **THEN** the marked button receives focus

#### Scenario: Nothing to focus

- **WHEN** a dialog with text content and no button is shown
- **THEN** the dialog element receives focus

#### Scenario: Predefined OK button

- **WHEN** a dialog with `kbqTitle` and `kbqOkText` is shown
- **THEN** the OK button receives focus, not the close button

### Requirement: Focus modes

`kbqAutoFocus: 'dialog'` SHALL focus the dialog element. `'first-heading'` SHALL focus the title, making it focusable from code only, and fall back to the dialog element when there is no title. `false` MUST leave focus where it was. A `cdkFocusInitial` or `autofocus` element inside the dialog SHALL override every value except `false`.

#### Scenario: Focus on the dialog

- **WHEN** a titled dialog is created with `kbqAutoFocus: 'dialog'` and no marked element
- **THEN** the dialog element receives focus

#### Scenario: Focus left alone

- **WHEN** a button has focus and a dialog is created with `kbqAutoFocus: false`
- **THEN** the button keeps focus

### Requirement: Focus stays in the dialog

While a dialog is shown, Tab and Shift+Tab SHALL move focus only through the focusable elements inside the dialog, including the close button and the footer buttons, and wrap around at either end.

#### Scenario: Tabbing past the last control

- **WHEN** a dialog is open and the user presses Tab repeatedly
- **THEN** focus never leaves the dialog

### Requirement: Focus restoration

When a dialog finishes closing, focus SHALL return to the element that had it when the dialog opened, with the same focus origin, while `kbqRestoreFocus` is `true`, which is the default. With `kbqRestoreFocus` `false` focus MUST NOT be moved back.

#### Scenario: Keyboard origin

- **WHEN** the user focuses a button with the keyboard, a dialog opens and then closes
- **THEN** the button has focus again and carries the `cdk-keyboard-focused` class

#### Scenario: Restoration turned off

- **WHEN** a dialog created with `kbqRestoreFocus: false` closes
- **THEN** focus does not return to the button that had it

### Requirement: Dialog semantics

The dialog element (the element with the class `kbq-modal-container`) SHALL have `role="dialog"`, `aria-modal="true"` and `tabindex="-1"`.

#### Scenario: Shown dialog

- **WHEN** a dialog is shown
- **THEN** its dialog element has `role="dialog"`, `aria-modal="true"` and `tabindex="-1"`

### Requirement: Accessible name and description

A dialog with a rendered title, from `kbqTitle` in the default layout or from `kbq-modal-title`, SHALL point `aria-labelledby` at it and MUST NOT have `aria-label`. Without a title it SHALL take `kbqAriaLabel` as its `aria-label`. A rendered caption, from `kbqCaption` or `kbq-modal-caption`, SHALL be referenced by `aria-describedby`, which is absent otherwise.

#### Scenario: Titled dialog

- **WHEN** a dialog is created with `kbqTitle` and `kbqCaption`
- **THEN** `aria-labelledby` points at the title and `aria-describedby` at the caption

#### Scenario: Untitled dialog

- **WHEN** a dialog is created with `kbqContent` and `kbqAriaLabel: 'Named by option'`
- **THEN** it has `aria-label="Named by option"` and no `aria-labelledby`

#### Scenario: Composed dialog without caption

- **WHEN** a composed dialog renders `kbq-modal-title` but no `kbq-modal-caption`
- **THEN** it has `aria-labelledby` and no `aria-describedby`

### Requirement: Localized close button label

The close button, whether rendered by the default layout or by `kbq-modal-title`, SHALL be named by `a11y.close` of the active locale ("Закрыть" in the default `ru-RU`, "Close" in `en-US`). `[localeOverrides]` on `kbq-modal` or on `kbq-modal-title` SHALL override that string for that element and its subtree.

#### Scenario: Default locale

- **WHEN** a titled dialog is shown under the default locale
- **THEN** its close button has `aria-label="Закрыть"`

### Requirement: Overlay marker class

The overlay that holds a dialog, created by the service or by a declarative dialog, SHALL have the class `kbq-modal-overlay` on its host element, which other overlays use to tell a press inside a dialog from an outside click.

#### Scenario: Service dialog overlay

- **WHEN** a dialog is created through the service
- **THEN** the host element of its overlay has the class `kbq-modal-overlay`

### Requirement: Container of a declarative dialog

`kbqGetContainer` SHALL be read once, when the dialog initializes: an `HTMLElement` SHALL receive the dialog's element, an `OverlayRef` SHALL receive it in its pane, a function SHALL be called and its result used, and `null` SHALL leave the element where the template put it. Without the input a declarative dialog SHALL create an overlay of its own.

#### Scenario: Rendering in place

- **WHEN** a `<kbq-modal>` binds `[kbqGetContainer]="null"`
- **THEN** its element stays at its place in the template
