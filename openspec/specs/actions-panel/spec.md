# actions-panel Specification

## Purpose

Describes what `KbqActionsPanel` from `@koobiq/components/actions-panel` guarantees to consumers: how a panel of bulk actions is opened from a component or a template, how its reference reports opening and closing, how users close it, where it is rendered, and which configuration, accessibility and localization behaviour it ships with.

## Requirements

### Requirement: Opening a panel

`open(componentOrTemplate, config?)` SHALL render the given component or template inside a new panel and return the panel's `KbqActionsPanelRef` synchronously. The panel element SHALL carry the `kbq-actions-panel-container` class and the content SHALL be rendered inside it.

#### Scenario: Opening a component

- **WHEN** `open()` is called with a component class
- **THEN** a `kbq-actions-panel-container` element holding that component is in the DOM
- **AND** the call returns a `KbqActionsPanelRef`

#### Scenario: Opening a template

- **WHEN** `open()` is called with a `TemplateRef`
- **THEN** a `kbq-actions-panel-container` element holding the rendered template is in the DOM

### Requirement: Template context

Template content SHALL receive the `data` option both as the implicit context value (`let-data`) and as `data`, and the panel's reference as `actionsPanelRef`.

#### Scenario: Reading data in a template

- **WHEN** a template declared with `let-data` is opened with `data: 'customData'`
- **THEN** `data` in the template is `'customData'`

#### Scenario: Closing from a template

- **WHEN** a button in the template calls `actionsPanelRef.close()` and the user clicks it
- **THEN** the panel closes

### Requirement: Data for component content

A component opened in the panel SHALL get the `data` option by injecting `KBQ_ACTIONS_PANEL_DATA`. With the built-in default configuration and no `data` given, the token SHALL resolve to `null`.

#### Scenario: Injecting data

- **WHEN** a component that injects `KBQ_ACTIONS_PANEL_DATA` is opened with `data: 'customData'`
- **THEN** the injected value is `'customData'`

### Requirement: Panel reference for component content

A component opened in the panel SHALL be able to inject the `KbqActionsPanelRef` of the panel that hosts it.

#### Scenario: Closing from the content component

- **WHEN** the opened component calls `close()` on its injected `KbqActionsPanelRef`
- **THEN** the panel closes

### Requirement: Dependency resolution of component content

A component opened in the panel SHALL resolve its dependencies from the `injector` option when one is given, and otherwise from the injector of the `KbqActionsPanel` instance that opened it, so that a service provided next to `KbqActionsPanel` in a component is injectable in the content.

#### Scenario: Service of the opening component

- **WHEN** a component provides `KbqActionsPanel` and another service, and opens a panel without `injector`
- **THEN** the content component can inject that other service

### Requirement: Content follows the state it renders

Template content SHALL re-render when the state of the component that declares the template changes, including under `OnPush` and without zone.js. Component content on the eager change-detection strategy SHALL be refreshed by an application tick that checks every view.

#### Scenario: Signal read by template content

- **WHEN** the template shows a signal of its declaring component and the signal changes while the panel is open
- **THEN** the panel shows the new value

#### Scenario: Mutated data in an application on zone.js

- **WHEN** an eager content component shows a field of a `data` object, the object is mutated and the application ticks
- **THEN** the panel shows the new value

### Requirement: One panel per service instance

A `KbqActionsPanel` instance SHALL hold at most one panel. Opening a panel while another one from the same instance is open SHALL close the open one first and return the new reference at once; the new panel SHALL start opening, and emit `beforeOpened`, only after the previous one has finished closing.

#### Scenario: Opening a second panel

- **WHEN** a panel is open and `open()` is called again on the same instance
- **THEN** the first panel's `afterClosed` emits `undefined`
- **AND** the new panel is open afterwards

### Requirement: Separate service instances

Each provided `KbqActionsPanel` instance SHALL track only its own panel, so panels of different instances SHALL be able to stay open at the same time. `KbqActionsPanelModule` SHALL provide an instance of its own; without one, the service is a root singleton.

#### Scenario: Two components each providing the service

- **WHEN** two components each provide `KbqActionsPanel` and each opens a panel
- **THEN** both panels are open at once

### Requirement: Panel closes with its service

When a `KbqActionsPanel` instance is destroyed, for example with the component that provides it, its open panel SHALL be closed.

#### Scenario: Destroying the providing component

- **WHEN** the component that provides `KbqActionsPanel` is destroyed while its panel is open
- **THEN** the panel is removed from the DOM

### Requirement: Opening events

`beforeOpened` SHALL emit once when the panel starts opening, before its entrance animation, then complete, and SHALL replay that emission to later subscribers. `afterOpened` SHALL emit once when the entrance has finished, then complete. For a panel opened while no other panel of its instance is open, `beforeOpened` has emitted by the time `open()` returns.

#### Scenario: Subscribing after open returns

- **WHEN** a consumer subscribes to `beforeOpened` after `open()` has returned
- **THEN** the subscriber receives one emission and the stream completes

#### Scenario: Order of opening events

- **WHEN** the panel finishes its entrance
- **THEN** `afterOpened` emits once, after `beforeOpened`, and completes

### Requirement: Closing events

Closing through `close()` of the reference or the service, the close button, Escape or the destruction of the service SHALL emit `beforeClosed` with the close result during the close call and complete it. `afterClosed` SHALL emit the same result once the exit animation has finished and the panel has been removed from the DOM, then complete.

#### Scenario: Order of closing events

- **WHEN** an open panel is closed
- **THEN** `beforeClosed` has emitted by the time the close call returns
- **AND** `afterClosed` emits afterwards, once, after the panel is gone

#### Scenario: Close result

- **WHEN** the panel is closed with the result `'customResult'`
- **THEN** both `beforeClosed` and `afterClosed` emit `'customResult'`

### Requirement: Closing during the entrance

Closing a panel whose entrance has not finished SHALL end the entrance: `afterOpened` SHALL emit and complete before `beforeClosed`, and `afterClosed` SHALL follow once the exit has finished.

#### Scenario: Close before the entrance ends

- **WHEN** a panel is closed while its entrance animation is still running
- **THEN** the events arrive in the order `beforeOpened`, `afterOpened`, `beforeClosed`, `afterClosed`

### Requirement: Closing only once

Once `close()` of a panel's reference has run, directly or through `KbqActionsPanel.close()`, further close calls on its reference or its service MUST be ignored for that panel: `beforeClosed` MUST NOT emit again and the result of the first close SHALL be kept. A panel closed without that call, by history navigation or `Dialog.closeAll()`, does not count: a later `close()` on its reference still emits `beforeClosed`, after `afterClosed`.

#### Scenario: Closing twice

- **WHEN** the panel is closed through the service and then through its reference
- **THEN** `beforeClosed` has emitted exactly once

#### Scenario: Closing after history navigation

- **WHEN** a panel has been removed because the user went back in the browser history, and `close()` is then called on its reference
- **THEN** `beforeClosed` emits once, after `afterClosed` has emitted

### Requirement: Visible state class

The panel element SHALL carry the `kbq-actions-panel-container_visible` class from the moment the panel starts opening until it starts closing.

#### Scenario: Open and close

- **WHEN** a panel has opened
- **THEN** its element has `kbq-actions-panel-container_visible`
- **AND** after it starts closing the class is gone

### Requirement: Keydown stream

`keydownEvents` of the reference SHALL emit the keydown events of the document while the panel's overlay is the most recently attached overlay that listens for keys, whether or not the event target is inside the panel.

#### Scenario: Key pressed on the page

- **WHEN** a panel is the only open overlay and the user presses a key with focus on the page outside it
- **THEN** `keydownEvents` emits that event

### Requirement: Panel follows the width of its element

A panel rendered into an `overlayContainer` element SHALL resize with that element, so that content which adapts to the panel's width, such as `KbqOverflowItems`, reacts when the element is resized.

#### Scenario: Resizing the element

- **WHEN** the element holding an open panel with overflowing actions is widened and then narrowed
- **THEN** fewer actions are hidden after widening and more after narrowing

### Requirement: Closing from code

`KbqActionsPanelRef.close(result?)` SHALL close its panel with the given result. `KbqActionsPanel.close(result?)` SHALL close the panel currently open in that instance with the given result, and SHALL do nothing when none is open. The panel MUST NOT close on its own when an action inside it is used.

#### Scenario: Closing through the service

- **WHEN** `close('customResult')` is called on the service while its panel is open
- **THEN** the panel closes and `afterClosed` emits `'customResult'`

#### Scenario: Closing through the reference

- **WHEN** `close()` is called on the reference returned by `open()`
- **THEN** the panel is removed from the DOM

### Requirement: Close button

Unless `disableClose` is set, the panel SHALL render a close button with the `kbq-actions-panel-container__close-button` class after its content, separated from it by a vertical divider. Clicking it SHALL call `close()` without a result on the `KbqActionsPanel` that the `injector` option resolves, or else on the opening instance, closing the panel with an `undefined` result. When the `injector` option resolves another instance, that instance's open panel, if any, closes instead.

#### Scenario: Clicking the close button

- **WHEN** the user clicks the close button of a panel opened without the `injector` option
- **THEN** the panel closes and `afterClosed` emits `undefined`

#### Scenario: Injector that resolves another instance

- **WHEN** a component that provides its own `KbqActionsPanel` opens a panel with an `injector` that resolves the root instance, which has no open panel, and the user clicks the close button
- **THEN** the panel stays open

### Requirement: Escape closes the panel

Unless `disableClose` is set or a control inside the panel has already prevented it, an Escape keydown without modifier keys inside the panel SHALL have its default action prevented and SHALL call `close()` on the `KbqActionsPanel` the close button uses: the panel closes with an `undefined` result, or another instance's panel does when the `injector` option resolves another instance. Escape pressed while focus is outside the panel MUST NOT close it.

#### Scenario: Escape inside the panel

- **WHEN** focus is inside a panel opened without the `injector` option and the user presses Escape
- **THEN** the panel closes

#### Scenario: Escape elsewhere on the page

- **WHEN** a panel is open, focus is outside it and the user presses Escape
- **THEN** the panel stays open

#### Scenario: Escape with a modifier key

- **WHEN** focus is inside the panel and the user presses Shift+Escape
- **THEN** the panel stays open

### Requirement: Escape already handled inside the panel

An Escape keydown whose default action a control inside the panel has already prevented MUST NOT close the panel.

#### Scenario: Tooltip open inside the panel

- **WHEN** a tooltip of a control inside the panel is open and the user presses Escape on that control
- **THEN** only the tooltip closes
- **AND** a second Escape closes the panel

### Requirement: Disabling user close

With `disableClose` set, the panel MUST NOT render the close button or its divider, and Escape MUST NOT close it or have its default action prevented. Closing from code SHALL still work.

#### Scenario: Escape with disableClose

- **WHEN** focus is inside a panel opened with `disableClose: true` and the user presses Escape
- **THEN** the panel stays open and no close button is rendered

#### Scenario: Closing from code with disableClose

- **WHEN** `close()` is called on the reference of a panel opened with `disableClose: true`
- **THEN** the panel closes

### Requirement: Default placement

Without `overlayContainer`, the panel SHALL be rendered in the application-wide overlay container and pinned to the bottom center of the viewport.

#### Scenario: Opening without overlayContainer

- **WHEN** a panel is opened without `overlayContainer`
- **THEN** its overlay is inside the overlay container that is a child of `body`
- **AND** it is horizontally centred in the viewport with its bottom edge near the bottom of the viewport

### Requirement: Custom application-wide overlay container

A panel opened without `overlayContainer` SHALL be rendered into the `OverlayContainer` the application provides, such as `FullscreenOverlayContainer`.

#### Scenario: Replaced OverlayContainer

- **WHEN** the application provides its own `OverlayContainer` and a panel is opened without `overlayContainer`
- **THEN** the panel's overlay is inside that container's element

### Requirement: No backdrop

The panel MUST NOT render a backdrop, and a click outside it MUST NOT close it; the rest of the page stays interactive while it is open.

#### Scenario: Open panel

- **WHEN** a panel is open
- **THEN** there is no `cdk-overlay-backdrop` element in the overlay container

### Requirement: Rendering into an element

With `overlayContainer` set to an element, the panel's overlay SHALL be rendered inside that element instead of the application-wide container, pinned to the bottom center of the element. Data and the panel reference SHALL reach the content as without it.

#### Scenario: Opening into an element

- **WHEN** a panel is opened with `overlayContainer` set to an element
- **THEN** the overlay is inside that element and not in the application-wide container
- **AND** it lies within the element's horizontal bounds with its bottom edge near the element's bottom

### Requirement: Element gains a single wrapper

While a panel rendered into an element is open, it SHALL add one child node with the `kbq-actions-panel-scoped-overlay-container` class to the element, holding the overlay, and the element's other children MUST NOT be marked `aria-hidden`. The wrapper SHALL be removed once that panel has closed.

#### Scenario: Wrapper while open

- **WHEN** a panel is open inside an element
- **THEN** the element has one `kbq-actions-panel-scoped-overlay-container` child holding a single child of its own

#### Scenario: Wrapper after close

- **WHEN** the panel has closed
- **THEN** the element no longer has that child

### Requirement: Static element becomes a containing block

When the element given as `overlayContainer` is statically positioned, it SHALL get the inline style `position: relative` while a panel is open in it and SHALL get its previous inline `position` back once no panel in it is open. An element that is already positioned SHALL be left untouched. A panel replacing another in the same element MUST NOT end the promotion early.

#### Scenario: Static element

- **WHEN** a panel opens in an element with `position: static` and then closes
- **THEN** the element's `position` is `relative` while the panel is open and `static` again after it closes

#### Scenario: Positioned element

- **WHEN** the element has `position: absolute`
- **THEN** it keeps `position: absolute` while the panel is open and after it closes

#### Scenario: Replacing a panel in the same element

- **WHEN** a panel is opened in an element and replaced by a second panel in the same element
- **THEN** after the first panel has closed the element is still `position: relative` and holds one wrapper

### Requirement: Element takes precedence over the application-wide container

A panel opened with `overlayContainer` MUST NOT use the application-wide `OverlayContainer`, nor create its element. Panels opened later without `overlayContainer` SHALL still use the application-wide container, and a panel in an element and one in the application-wide container SHALL be able to be open at the same time.

#### Scenario: Custom OverlayContainer and overlayContainer

- **WHEN** the application provides its own `OverlayContainer` and a panel is opened with `overlayContainer`
- **THEN** the panel is inside the element and the application's container element is never requested

#### Scenario: Global panel after a scoped one

- **WHEN** a panel opened into an element has closed and another panel is opened without `overlayContainer`
- **THEN** the new panel is in the application-wide container and not in the element

### Requirement: Shared registry of open dialogs

A panel, including one rendered into an element, SHALL be registered among the open dialogs of the application's CDK `Dialog`, so that `Dialog.openDialogs` lists it and `Dialog.closeAll()` closes it.

#### Scenario: closeAll

- **WHEN** a panel is open inside an element and `closeAll()` is called on the application's `Dialog`
- **THEN** `openDialogs` is empty and the panel is gone from the element

### Requirement: Pop-ups of the content are not scoped to the element

Overlays opened from inside the panel's content, such as a dropdown or a tooltip, MUST NOT be rendered into the element given as `overlayContainer`. They SHALL be rendered in the application-wide overlay container, so that the element does not clip them, also when a `kbqOverlayLayer` encloses the element: the layer takes the dropdown of a trigger placed elsewhere in it, but not the dropdown of a trigger inside the panel.

#### Scenario: Dropdown in a panel inside an element

- **WHEN** a dropdown trigger inside a panel rendered into an element is activated and no `kbqOverlayLayer` encloses the element
- **THEN** the dropdown panel is in the application-wide overlay container

#### Scenario: Dropdown in a panel inside an overlay layer

- **WHEN** a dropdown trigger inside a panel rendered into an element is activated and a `kbqOverlayLayer` encloses the element
- **THEN** the dropdown panel is in the application-wide overlay container and not in the layer

### Requirement: Size options

`width` SHALL set the overlay pane's CSS width. `minWidth` and `maxWidth` SHALL set its minimum and maximum width, with a number taken as pixels, in the application-wide container and inside an element alike. Without `maxWidth` the panel SHALL be no wider than the container it is rendered into, unless `minWidth` asks for more: a minimum width larger than the container wins over that cap.

#### Scenario: Numeric maxWidth

- **WHEN** a panel is opened with `maxWidth: 500`
- **THEN** the overlay pane has `max-width: 500px`

#### Scenario: Width and minWidth

- **WHEN** a panel is opened with `width: '500px'` and another with `minWidth: '50%'`
- **THEN** the panes have `width: 500px` and `min-width: 50%` respectively

#### Scenario: maxWidth inside an element

- **WHEN** a panel is opened into an element with `maxWidth: '999px'`
- **THEN** the overlay pane has `max-width: 999px`

### Requirement: Extra CSS classes

`containerClass` SHALL add one class or an array of classes to the panel element, and `overlayPanelClass` SHALL add them to the overlay pane. The overlay pane SHALL always carry the `kbq-actions-panel-overlay` class.

#### Scenario: Classes as arrays

- **WHEN** a panel is opened with `containerClass: ['classA', 'classB']` and `overlayPanelClass: ['classA', 'classB']`
- **THEN** both the panel element and the overlay pane have `classA` and `classB`

#### Scenario: Overlay pane class

- **WHEN** a panel is opened without options
- **THEN** its overlay pane has `kbq-actions-panel-overlay`

### Requirement: Text direction

`direction: 'rtl'` SHALL add the `kbq-actions-panel-container_rtl` class to the panel element and set `dir="rtl"` on its overlay. With the built-in default configuration, `direction` SHALL default to `'ltr'`, whatever the direction of the application. When the merged configuration has no `direction`, as with a provided default configuration that leaves it out, the overlay SHALL take the application's direction from its root `Directionality` instead, without the RTL class.

#### Scenario: Right-to-left panel

- **WHEN** a panel is opened with `direction: 'rtl'`
- **THEN** the panel element has `kbq-actions-panel-container_rtl`

#### Scenario: Default direction

- **WHEN** a panel is opened without `direction`, with the built-in default configuration, in an application whose document is right-to-left
- **THEN** its overlay has `dir="ltr"`

#### Scenario: Provided default configuration without direction

- **WHEN** `kbqActionsPanelDefaultConfigProvider({ disableClose: true })` is provided and a panel is opened without `direction` in an application whose document is right-to-left
- **THEN** its overlay has `dir="rtl"`
- **AND** the panel element does not have `kbq-actions-panel-container_rtl`

### Requirement: Scroll strategy

`scrollStrategy` SHALL be a factory that receives the CDK `Overlay` service and returns the scroll strategy enabled for the panel while it is attached. With the built-in default configuration it SHALL be the reposition strategy.

#### Scenario: Custom scroll strategy

- **WHEN** a panel is opened with a `scrollStrategy` factory
- **THEN** the strategy it returns is enabled once

### Requirement: Closing on history navigation

By default the panel SHALL close when the user goes back or forward in the browser history. With `closeOnNavigation: false` it SHALL stay open. A router navigation that does not go through the browser history, such as a link or `router.navigate()`, MUST NOT close it.

#### Scenario: Going back in history

- **WHEN** a panel is open and the user goes back in the browser history
- **THEN** the panel is removed

#### Scenario: closeOnNavigation off

- **WHEN** a panel opened with `closeOnNavigation: false` is open and the user goes back in the browser history
- **THEN** the panel stays open

### Requirement: Default configuration

The configuration passed to `open()` SHALL be merged key by key over the value of `KBQ_ACTIONS_PANEL_DEFAULT_CONFIG`, with keys passed to `open()` winning. `kbqActionsPanelDefaultConfigProvider(config)` SHALL provide that token. Its default is a new `KbqActionsPanelConfig`; a provided value replaces it as a whole.

#### Scenario: Default disableClose

- **WHEN** `kbqActionsPanelDefaultConfigProvider({ disableClose: true })` is provided and a panel is opened without options
- **THEN** the panel has no close button

#### Scenario: Per-call option wins

- **WHEN** that provider is present and a panel is opened with `disableClose: false`
- **THEN** the panel has a close button

### Requirement: Focus is left where it is

Opening a panel MUST NOT move focus, focus MUST NOT be trapped inside an open panel, and closing a panel MUST NOT move focus back to where it was before the panel opened.

#### Scenario: Opening

- **WHEN** focus is on `body` and a panel opens and finishes its entrance
- **THEN** focus is still on `body`

#### Scenario: Tabbing out of the panel

- **WHEN** focus is on the last control of the panel and the user presses Tab
- **THEN** focus leaves the panel

#### Scenario: Closing from the keyboard

- **WHEN** the user tabs from a page control to the close button and presses Enter
- **THEN** the panel closes and focus is not moved back to that page control

### Requirement: Panel semantics

The panel element SHALL have `role="dialog"`, `aria-modal="false"` and `tabindex="-1"`, and SHALL have no accessible name: `KbqActionsPanelConfig` has no option to give it one.

#### Scenario: Attributes of an open panel

- **WHEN** a panel is open
- **THEN** its element has `role="dialog"`, `aria-modal="false"` and `tabindex="-1"` and no `aria-label` or `aria-labelledby`

### Requirement: Page hidden from assistive technology behind an application-wide panel

When a panel in the application-wide overlay container is the first open CDK dialog of the application, every sibling of that overlay container except scripts, styles, live regions and popovers SHALL get `aria-hidden="true"` once the entrance has finished. The previous values SHALL be restored when the last open dialog closes. A panel rendered into an element MUST NOT hide anything.

#### Scenario: Global panel opened

- **WHEN** a panel opens without `overlayContainer` and finishes its entrance
- **THEN** the application's root element next to the overlay container has `aria-hidden="true"`

#### Scenario: Closing the last dialog

- **WHEN** an application-wide panel and a panel inside an element are open, and the application-wide one closes first
- **THEN** no child of `body` is left with `aria-hidden="true"`

### Requirement: Close button text follows the locale

The close button's `aria-label` and the tooltip shown on it SHALL be the `actionsPanel.closeTooltip` string of the active locale: "Отменить выбор" for `ru-RU`, the default, and "Clear" for `en-US`. With `KBQ_LOCALE_SERVICE` provided, the text SHALL follow `setLocale()`; without it, the text SHALL come from `KBQ_ACTIONS_PANEL_LOCALE_CONFIGURATION`.

#### Scenario: Switching the locale

- **WHEN** a panel is open with the default locale and the application switches the locale to `en-US`
- **THEN** the close button's `aria-label` changes from "Отменить выбор" to "Clear"

### Requirement: Overriding the close button text

`kbqActionsPanelLocaleConfigurationProvider(partial)` SHALL override only the strings it is given, for panels whose content injector reaches that provider: the injector of the providing component when `KbqActionsPanel` is provided there, or the `injector` option. Strings it leaves out SHALL keep following the active locale.

#### Scenario: Override next to the service

- **WHEN** a component provides `KbqActionsPanel` and `kbqActionsPanelLocaleConfigurationProvider({ closeTooltip: 'Done' })` and opens a panel
- **THEN** the close button's `aria-label` is "Done"

### Requirement: Reduced motion

When animations are turned off through `KBQ_ANIMATIONS_CONFIG`, through `provideNoopAnimations()` or by the user's `prefers-reduced-motion: reduce` setting, the panel element SHALL carry `kbq-animations-disabled` and SHALL appear and disappear without motion. The opening and closing events SHALL still be emitted, right after the next render.

#### Scenario: Reduced motion preferred

- **WHEN** the user prefers reduced motion and a panel is opened and closed
- **THEN** the panel element has `kbq-animations-disabled`, the panel does not slide
- **AND** `afterOpened` and `afterClosed` emit
