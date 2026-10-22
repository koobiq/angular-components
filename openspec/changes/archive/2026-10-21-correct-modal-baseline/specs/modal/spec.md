# modal Specification Delta

## MODIFIED Requirements

### Requirement: Motion

The dialog SHALL zoom and fade in and out, and its dim layer SHALL fade. When animations are disabled through `KBQ_ANIMATIONS_CONFIG`, `NoopAnimations` or `prefers-reduced-motion: reduce`, read from the dialog's own injector, the dialog MUST NOT animate, and `afterOpen` and `afterClose` SHALL emit without waiting for one: after the first render when the dialog is opened before its view exists, and otherwise on the next microtask, which can come before the new state is rendered.

#### Scenario: Animations disabled

- **WHEN** `KBQ_ANIMATIONS_CONFIG` disables animations and a dialog is opened through the service and then closed with `close()`
- **THEN** the dialog element never gets the `zoom-enter` class
- **AND** `afterOpen` emits right after the first render, and `afterClose` emits in a microtask after `close()`, without waiting for a render

#### Scenario: Reduced motion

- **WHEN** the user prefers reduced motion and a dialog is created before the first change detection
- **THEN** `afterOpen` emits only once the dialog body has been rendered

### Requirement: Teardown of a service dialog

A dialog created by the service SHALL be removed with its overlay once `afterClose` has emitted. It SHALL also be torn down at once when the injector given as `options.injector` (or, without one, the service's injector) is destroyed, and when the user goes back or forward in the browser history; a navigation through `routerLink` or `Router.navigate()` does not tear it down by itself. Teardown SHALL release the body scroll lock and the dialog's place among the open dialogs.

#### Scenario: Opener destroyed

- **WHEN** a component passes its own injector to `create()` and is destroyed while the dialog is shown
- **THEN** the dialog element is removed and `document.body` no longer has `overflow: hidden`

### Requirement: Tracking open dialogs

`KbqModalService.openModals` SHALL list the dialogs that have finished opening and have not finished closing, in the order they finished opening: every service dialog, and a declarative dialog only until it first finishes closing, since it registers once, on init. `afterAllClose` SHALL emit when the last of them finishes closing. `closeAll()` SHALL close every dialog in `openModals`, starting from the last one.

#### Scenario: Closing everything

- **WHEN** three service dialogs and a declarative dialog that has not been closed before are open and `closeAll()` is called
- **THEN** all four close, `openModals` becomes empty and `afterAllClose` emits once

#### Scenario: Dialog still opening

- **WHEN** a dialog has been created and its opening animation has not ended
- **THEN** it is not yet in `openModals`

### Requirement: Confirm layout

The confirm layout SHALL render no header and no close button of its own, whatever `kbqTitle`, `kbqCaption` and `kbqClosable` say. Its footer SHALL hold the OK button, colored by `kbqOkType` (contrast by default) and carrying `autofocus`, followed by the Cancel button, each only when its text is set. `kbqFooter` MUST NOT be rendered, though it still keeps `kbq-modal_no-footer` off the dialog element, and `confirm()` given `kbqFooter` SHALL warn about it in development mode.

#### Scenario: Title given to a confirm dialog

- **WHEN** `confirm()` is called with `kbqTitle` and `kbqOkText`
- **THEN** the dialog shows no title and no close button, and its footer shows the OK button

#### Scenario: Footer given to a confirm dialog

- **WHEN** `confirm()` is called with `kbqFooter` in development mode
- **THEN** a warning says that the confirm dialog does not support `kbqFooter`

### Requirement: One dim layer for stacked dialogs

When a dialog opened through the service appears while other dialogs are shown, the dim layers of those still registered (every service dialog, and a declarative dialog until it first finishes closing) SHALL fade out so that only one dim layer is painted, and SHALL come back when the new dialog starts closing. A declarative dialog shown again after its first close keeps its own layer. With animations disabled the hand-over SHALL happen at once, without a fade.

#### Scenario: Dialog over a dialog

- **WHEN** a declarative dialog that has not been closed before is shown and a service dialog opens over it
- **THEN** the document contains one `kbq-modal-mask`, also after the service dialog has closed

### Requirement: Page behind the dialog is inert

While any dialog is shown, every child of `document.body` that holds no shown dialog when a dialog is shown or hidden SHALL be marked `inert`, except elements that are or contain an `aria-live` region, until no dialog is shown any more. Overlays in the same container as a dialog SHALL stay reachable. Not so for a declarative dialog shown from its first render: checked while in its template, it leaves the page around it reachable and marks an existing overlay container holding no shown dialog.

#### Scenario: Opening a dialog

- **WHEN** a dialog opened through the service opens over a page
- **THEN** the page's element under `document.body` has the `inert` attribute and the overlay container does not
- **AND** the attribute is gone after the dialog has closed

### Requirement: Explicit width

`kbqWidth` SHALL set the width of the dialog element and override the width of the size preset. A number, or a string that `Number()` converts to a number, SHALL be read as pixels, so an empty or blank string gives `0px`; any other string SHALL be used as written.

#### Scenario: Width as a number

- **WHEN** `kbqWidth` is `480`
- **THEN** the dialog element has `width: 480px`

#### Scenario: Width with a unit

- **WHEN** `kbqWidth` is `'50%'`
- **THEN** the dialog element has `width: 50%`

### Requirement: CSS unit pipe

The `toCssUnit` pipe SHALL turn a number, or a string that `Number()` converts to a number, into that number followed by the unit argument (`px` by default), so an empty or blank string becomes `0px`. It SHALL return any other string unchanged, and SHALL return `null` for `null` and `undefined`.

#### Scenario: Numeric string

- **WHEN** `'400' | toCssUnit` is evaluated
- **THEN** the result is `'400px'`

#### Scenario: Empty string

- **WHEN** `'' | toCssUnit` is evaluated
- **THEN** the result is `'0px'`
