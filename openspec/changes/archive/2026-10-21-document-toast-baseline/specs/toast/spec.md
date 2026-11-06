# Spec Delta

## Purpose

Describes what `@koobiq/components/toast` guarantees to consumers: how `KbqToastService` shows, counts down, pauses and dismisses toasts and template toasts, what a `kbq-toast` renders and announces, how users close and read toasts with a pointer, the keyboard or assistive technology, and how the stack is configured, positioned and kept above other overlays.

## ADDED Requirements

### Requirement: Showing a toast

`show(data, duration?, onTop?)` SHALL render a `kbq-toast` with the given data in the toast overlay and return `{ ref, id }`, where `ref` is the toast's `ComponentRef` and `id` identifies it for `hide()`. `toasts` SHALL list the refs of the toasts on the stack.

#### Scenario: A toast appears in the overlay

- **WHEN** the consumer calls `show()` with a title and content
- **THEN** one `kbq-toast` is rendered inside an overlay whose host has the class `kbq-toast-overlay`
- **AND** `toasts` holds one ref

#### Scenario: Shown from a click handler

- **WHEN** a button's click handler calls `show()`
- **THEN** the toast is rendered after the click

### Requirement: Toasts shown outside change detection render

A toast or template toast shown outside change detection, for example from a timer, SHALL be rendered by the next scheduled render, without the caller running change detection.

#### Scenario: Shown from a timer

- **WHEN** `show()` is called while no change detection runs
- **THEN** the toast and its title are rendered once the application is stable

### Requirement: Caller data is left untouched

The service and the toast MUST NOT write into the data object they are given. The defaults for `style`, `icon` and `closeButton` SHALL apply without changing it, so a frozen object can be shown.

#### Scenario: Showing frozen data

- **WHEN** a frozen data object without `style`, `icon` and `closeButton` is shown
- **THEN** no error is thrown and the object still has no `style` and no `iconClass`

### Requirement: Text slots

A toast SHALL render `title`, `caption` and `content` in that order, each only when it is given, followed by `actions`. A string SHALL be rendered as text and a template SHALL be rendered in its place.

#### Scenario: Only a title

- **WHEN** a toast is shown with a title and no caption or content
- **THEN** the title text is rendered and no content block is rendered

### Requirement: Line breaks in string slots

Line breaks in a string `title`, `caption` or `content` SHALL be kept in the rendered text, so a multi-line message grows the toast in height.

#### Scenario: Multi-line content

- **WHEN** a toast is shown with a content string that contains `\n`
- **THEN** each line of the content is rendered on a line of its own

### Requirement: Caption without a title

When there is no `title`, the `caption` SHALL take the title's place and styling (class `kbq-toast__title`). With a title, the caption SHALL be rendered as secondary text below it.

#### Scenario: Caption only

- **WHEN** a toast is shown with a caption and no title
- **THEN** the caption is rendered with the title's styling

### Requirement: Slot template context

Every template passed through the data (`title`, `caption`, `content`, `actions`, `icon`, `closeButton`) SHALL be rendered with the toast component as `$implicit`, so that the template can read `data`, including fields the consumer added to it, and call `close()`.

#### Scenario: Action that closes the toast

- **WHEN** an `actions` template declared with `let-toast` calls `toast.close()` on click
- **AND** the user clicks that action
- **THEN** the toast closes

#### Scenario: Reading custom data

- **WHEN** the data carries an extra field and an `actions` template renders `toast.data` with that field
- **THEN** the field's value appears in the toast

### Requirement: Toast styles

`data.style` SHALL set the host class `kbq-toast_<style>`, for the four `KbqToastStyle` values and for any other string. Without a style the toast SHALL use `contrast`. Every toast SHALL carry the host class `kbq-toast`.

#### Scenario: Warning style

- **WHEN** a toast is shown with `style: KbqToastStyle.Warning`
- **THEN** its host has the class `kbq-toast_warning`

#### Scenario: No style

- **WHEN** a toast is shown without a style
- **THEN** its host has the class `kbq-toast_contrast`

### Requirement: Default icon of the style

By default a toast SHALL show the icon of its style: `kbq-circle-info_16` for contrast, `kbq-circle-check_16` for success, `kbq-triangle-exclamation_16` for warning and error. The icon SHALL carry `aria-hidden="true"` and the classes given in `data.iconClass`. A style outside `KbqToastStyle` SHALL show no glyph.

#### Scenario: Warning icon

- **WHEN** a warning toast is shown with `icon: true`
- **THEN** its icon has the class `kbq-triangle-exclamation_16`

#### Scenario: Extra icon class

- **WHEN** an error toast is shown with `iconClass: 'kbq-custom'`
- **THEN** its icon has the class `kbq-custom`

### Requirement: Custom icon or no icon

`icon: false` SHALL render no icon. A template passed as `icon` SHALL be rendered in place of the default glyph, and `iconClass` SHALL then not apply.

#### Scenario: Icon turned off

- **WHEN** a toast is shown with `icon: false`
- **THEN** it renders no icon and no icon slot

#### Scenario: Icon template

- **WHEN** a toast is shown with a template as `icon`
- **THEN** the template is rendered and the style's default glyph is not

### Requirement: Stack order

A new toast or template toast SHALL be added below the ones on screen. With `onTop` set, as the third argument of `show()`, the fourth of `showTemplate()` or through the configuration, it SHALL be added above them.

#### Scenario: Default order

- **WHEN** two toasts are shown one after the other
- **THEN** the second is rendered below the first

#### Scenario: On top

- **WHEN** a toast is on screen and another is shown with `onTop` set to `true`
- **THEN** the new toast is rendered above the first

### Requirement: Auto-dismissal

A toast or template toast shown with a positive duration SHALL be removed by the countdown. Each 500 ms step of the heartbeat SHALL subtract 500 ms from its remaining time while the stack is not paused, and the step that brings it to zero or below SHALL remove it. Without a duration argument, the configured `duration` (5000 ms by default) SHALL apply.

#### Scenario: Duration runs out

- **WHEN** a toast is shown with a duration of 3000 ms on an empty stack
- **THEN** it is gone once 3000 ms plus one 500 ms step have passed

#### Scenario: Default duration

- **WHEN** a toast is shown without a duration argument and the default configuration
- **THEN** it is removed about 5 seconds later

### Requirement: Sticky toasts

A toast or template toast shown with a duration of `0` or less SHALL never be removed by the countdown; it SHALL stay until it is closed or hidden.

#### Scenario: Zero duration

- **WHEN** a toast is shown with a duration of `0`
- **THEN** it is still on the stack 10 seconds later

### Requirement: Survivors outlive a dismissal

When a toast or template toast is hidden, by the countdown or explicitly, every remaining one that counts down SHALL have at least the configured `delay` (2000 ms by default) left. One with more time left SHALL keep it.

#### Scenario: Short survivor of a manual close

- **WHEN** a toast with 500 ms left survives the explicit hiding of another toast
- **THEN** it is still on screen after 500 ms plus one step
- **AND** it is gone once the 2000 ms delay has also passed

#### Scenario: Long survivor

- **WHEN** a toast with a duration of 1000 ms expires next to one with a duration of 30000 ms
- **THEN** the second is still on screen 5 seconds after the first expired

### Requirement: One expiry per step

Each heartbeat step SHALL remove at most one toast or template toast; the step SHALL stop at the first one it removes. Toasts SHALL be counted down before template toasts, each in the order they were created.

#### Scenario: Two toasts with the same duration

- **WHEN** two toasts are shown together with the same duration
- **THEN** the first is removed when its duration runs out
- **AND** the second is removed at least the configured delay later

### Requirement: Hover pauses the whole stack

While the pointer is over any toast shown by `show()`, the countdown of every toast and template toast of the service SHALL stop. It SHALL resume once the pointer has left every toast. Hiding another toast MUST NOT end the pause.

#### Scenario: Hovering one of two toasts

- **WHEN** two toasts with a duration of 3000 ms are shown and the pointer rests on one of them for 10 seconds
- **THEN** both are still on screen

#### Scenario: Pointer leaves

- **WHEN** the pointer has rested on a toast with a duration of 3000 ms and then leaves it
- **THEN** the toast is gone once 3000 ms plus one step have passed

#### Scenario: Sibling hidden during the pause

- **WHEN** the pointer rests on a toast and another toast is hidden
- **THEN** the hovered toast is still on screen 10 seconds later

### Requirement: Focus pauses the whole stack

While focus is on a toast or on an element inside it, whether the keyboard, the pointer or code moved it there, the countdown of every toast and template toast of the service SHALL stop. It SHALL resume once focus has left every toast.

#### Scenario: Keyboard focus on the close button

- **WHEN** a toast with a duration of 3000 ms has its close button focused from the keyboard
- **THEN** the toast is still on screen 10 seconds later

### Requirement: Pausing renews short lifetimes

When the stack goes from running to paused, every toast and template toast that counts down SHALL be given at least the configured `delay` left, so that nothing disappears the instant the pause ends.

#### Scenario: Toast about to expire is hovered

- **WHEN** a toast with 500 ms left is hovered and the pointer leaves it at once
- **THEN** the toast stays on screen for at least the configured delay

### Requirement: Hover and focus state

A toast SHALL expose `hovered()` and `focused()` signals for itself. The service SHALL expose `hovered()` and `focused()` signals that are `true` while at least one of its toasts is hovered or holds focus.

#### Scenario: Hovering a toast

- **WHEN** the pointer enters a toast
- **THEN** the toast's `hovered()` and the service's `hovered()` are `true`
- **AND** both are `false` again once the pointer leaves

#### Scenario: Focusing a toast

- **WHEN** an element inside a toast is focused
- **THEN** the toast's `focused()` and the service's `focused()` are `true`

### Requirement: Built-in close button

By default a toast SHALL render a native `<button type="button">` marked `kbq-toast-close-button` (class `kbq-toast__close-button`) whose `aria-label` is the locale's `close` text, and clicking it SHALL close the toast. A toast with a close button SHALL carry the host class `kbq-toast_dismissible`.

#### Scenario: Clicking the close button

- **WHEN** the user clicks the close button of a toast
- **THEN** the toast leaves the stack and its element is gone once the exit has ended

#### Scenario: Named native button

- **WHEN** a toast is shown with the default close button
- **THEN** the button is a `button` element of type `button` with a non-empty `aria-label`

### Requirement: Custom or no close button

`closeButton: false` SHALL render no close button and no `kbq-toast_dismissible` class. A template passed as `closeButton` SHALL replace the built-in button entirely, and the toast SHALL keep the `kbq-toast_dismissible` class.

#### Scenario: Without a close button

- **WHEN** a toast is shown with `closeButton: false`
- **THEN** it renders no close button and its host has no `kbq-toast_dismissible` class

#### Scenario: Close button template

- **WHEN** a toast is shown with a template as `closeButton`
- **THEN** the template is rendered instead of the built-in button

### Requirement: Closing a toast

`close()` on a toast SHALL report it as read and remove it from its stack. The built-in close button and Escape SHALL close a toast this way.

#### Scenario: Closing from code

- **WHEN** the consumer calls `ref.instance.close()` on a shown toast
- **THEN** the toast leaves the stack
- **AND** `read` emits its data

### Requirement: Escape closes the toast

Escape pressed while focus is on a toast or inside it SHALL close that toast, also when the toast renders no close button. The key's default action SHALL NOT be prevented.

#### Scenario: Escape on a focused toast

- **WHEN** a keydown of Escape reaches a toast
- **THEN** the toast leaves the stack

#### Scenario: Toast without a close button

- **WHEN** a toast shown with `closeButton: false` holds focus and the user presses Escape
- **THEN** the toast closes

### Requirement: Hiding a toast by id

`hide(id)` with an id returned by `show()` SHALL remove the toast from `toasts` at once and start its exit. An id that is not on the stack SHALL be ignored. Hiding a toast this way MUST NOT report it as read.

#### Scenario: Hide by id

- **WHEN** the consumer calls `hide()` with the id of a shown toast
- **THEN** `toasts` is empty right after the call

### Requirement: Exit before removal

A hidden toast SHALL stay in the DOM with the host class `kbq-toast_leaving`, ignoring the pointer, until its exit animation has ended, and SHALL then be removed. When no animation runs, it SHALL be removed right after the next render.

#### Scenario: Exit animation running

- **WHEN** a toast is hidden while its exit animation is still running
- **THEN** its element is still rendered and has the class `kbq-toast_leaving`
- **AND** it is removed once the animation has ended

### Requirement: Read notification

`read` SHALL be a `BehaviorSubject` that starts with `null` and emits a toast's data once, the first time the toast is closed, clicked anywhere, or hovered or focused for more than 500 ms and then left. Removal by the countdown or by `hide()` MUST NOT emit.

#### Scenario: Closed toast is read

- **WHEN** the user clicks the close button of a toast
- **THEN** `read` emits that toast's data object

#### Scenario: Read only once

- **WHEN** the pointer rests on a toast for 600 ms three times and the user then closes it
- **THEN** `read` has emitted that toast's data exactly once

### Requirement: Focus hand-off on dismissal

When a toast that holds focus received from the keyboard or from code is hidden, focus SHALL move to the `kbq-toast-close-button` element of the first remaining toast in stack order that has one. When none has, focus SHALL return to the element that was focused when the hidden toast was shown, if it is still in the document. Focus received from the pointer SHALL NOT be moved.

#### Scenario: Survivor takes the focus

- **WHEN** the close button of the second of two toasts holds keyboard focus and that toast is hidden
- **THEN** focus is inside the first toast

#### Scenario: On-top stack

- **WHEN** three toasts are shown with `onTop` and the top one, holding keyboard focus, is hidden
- **THEN** focus is in the toast that was second from the top, not in the oldest one

#### Scenario: Last toast closes

- **WHEN** a button had focus when the only toast was shown, and that toast is hidden while it holds keyboard focus
- **THEN** focus returns to the button

#### Scenario: Dismissed with the mouse

- **WHEN** a toast whose close button was focused by a mouse press is hidden
- **THEN** focus is not moved into the remaining toast
- **AND** the remaining toast keeps counting down

### Requirement: Live region role of a toast

A toast with the `warning` or `error` style SHALL carry `role="alert"`; every other style, a custom one included, SHALL carry `role="status"`. Every toast SHALL carry `aria-atomic="true"`.

#### Scenario: Error toast

- **WHEN** an error toast is shown
- **THEN** its host has `role="alert"` and `aria-atomic="true"`

#### Scenario: Contrast toast

- **WHEN** a contrast toast is shown
- **THEN** its host has `role="status"`

### Requirement: Live region of a template toast

When `showTemplate()` renders a template whose first root element has no `role`, that element SHALL get `role="status"` and `aria-atomic="true"`. A root element with a `role` of its own SHALL be left alone, and a template whose roots are only text SHALL get no live region.

#### Scenario: Template with a plain root element

- **WHEN** a template whose root is a `div` is shown with `showTemplate()`
- **THEN** that `div` has `role="status"`

### Requirement: Labelled stack region

The toast container SHALL be a `kbq-toast-container` element with `role="region"` and an `aria-label` taken from the locale's `toastRegion` text. A rendered toast stack SHALL have no axe violations.

#### Scenario: Region attributes

- **WHEN** a toast is shown
- **THEN** its container has `role="region"` and a non-empty `aria-label`

#### Scenario: Axe check

- **WHEN** a toast with a title, a caption and content is shown
- **THEN** axe reports no violations for the overlay container

### Requirement: Localized accessible names

The close button's name and the region label SHALL follow the active locale. Without a locale service, the ru-RU texts `Закрыть` and `Уведомления` SHALL apply; under en-US they SHALL be `Close` and `Notifications`.

#### Scenario: Default locale

- **WHEN** a toast is shown in an application without a locale service
- **THEN** the close button is named `Закрыть` and the region `Уведомления`

#### Scenario: English locale

- **WHEN** the active locale is en-US
- **THEN** the close button is named `Close` and the region `Notifications`

### Requirement: Template toasts

`showTemplate(data, template, duration?, onTop?)` SHALL render `template` in the stack with the data as `$implicit` and return `{ ref, id }`. `templates` SHALL list it until `hideTemplate(id)` removes it at once, without an exit animation. Template ids SHALL form a sequence of their own, used with `hideTemplate()` and not with `hide()`.

#### Scenario: Template context

- **WHEN** a template is shown with `showTemplate()`
- **THEN** the `$implicit` of its context is the data object passed in

#### Scenario: Hiding a template toast

- **WHEN** the consumer calls `hideTemplate()` with the returned id
- **THEN** `templates` is empty right after the call

### Requirement: Countdown of template toasts

A template toast SHALL follow the same countdown, sticky and survivor rules as a toast and SHALL stop counting down while a toast is hovered or focused. Hovering or focusing the template toast itself MUST NOT pause anything.

#### Scenario: Template with a duration

- **WHEN** a template is shown with a duration of 1000 ms
- **THEN** it is gone once 1000 ms plus one step have passed

#### Scenario: Sticky template

- **WHEN** a template is shown with a duration of `0`
- **THEN** it is still on the stack 10 seconds later

### Requirement: Default configuration

Without a provider, `KBQ_TOAST_CONFIG` SHALL resolve to `defaultToastConfig`: position `top-right`, `duration` 5000, `delay` 2000, `onTop` `false` and an `indent` of 0 vertically and 0 horizontally. `defaultToastConfig` and its `indent` SHALL be frozen.

#### Scenario: Frozen defaults

- **WHEN** a consumer inspects `defaultToastConfig`
- **THEN** the object and its `indent` are frozen

### Requirement: Configuration provider

`kbqToastConfigurationProvider(partial)` SHALL provide `KBQ_TOAST_CONFIG` as the defaults overridden by the given keys, with `indent` merged key by key. Every provider SHALL get an `indent` object of its own.

#### Scenario: Two providers

- **WHEN** two providers are created without an `indent`
- **THEN** each has its own `indent` object, equal to the default one and not the same object

### Requirement: Stack position

The container SHALL carry the class `kbq-toast-container-<position>`. The stack SHALL be anchored at that position of the viewport: the `top-*` and `bottom-*` positions offset by `indent.vertical` from that edge, the left and right ones by `indent.horizontal` from that side, the `*-center` ones centred horizontally, and `center` centred on both axes, ignoring the indent.

#### Scenario: Every position

- **WHEN** the configuration sets any `KbqToastPosition` and a toast is shown
- **THEN** the container has the class `kbq-toast-container-<position>`

#### Scenario: Default position

- **WHEN** a toast is shown with the default configuration
- **THEN** the container has the class `kbq-toast-container-top-right` and the stack sits in the top right corner

### Requirement: Position read with the overlay

The position SHALL be read when the stack's overlay is created. When the `position` of the provided configuration object has been changed while the stack is open, the next `show()` or `showTemplate()` SHALL hide every toast and template toast on screen and open the stack at the new position.

#### Scenario: Position changed underneath

- **WHEN** a toast is on screen, the provided configuration's `position` is set to `bottom-left`, and another toast is shown
- **THEN** the first toast is hidden and destroyed
- **AND** one container remains, with the class `kbq-toast-container-bottom-left`, holding the new toast

### Requirement: One overlay for the stack

All toasts and template toasts of a service SHALL share one overlay. It SHALL be attached on the first `show()` or `showTemplate()` and detached once nothing is on the stack and the last exit animation has ended. A stack emptied by `hideTemplate()` SHALL detach at once. Repeated show and hide cycles SHALL leave at most one container.

#### Scenario: Waiting for the last exit

- **WHEN** two toasts are hidden one after the other and the first one's exit is still running when the second is gone
- **THEN** the overlay stays attached until the first exit has ended

#### Scenario: Template keeps the container

- **WHEN** a toast and a template toast are on screen and the toast is hidden
- **THEN** the container stays

#### Scenario: Show and hide cycles

- **WHEN** a toast is shown and hidden three times and then shown again
- **THEN** there is one container

### Requirement: Service teardown

Destroying the service SHALL dispose of its overlay with every toast in it, drop every record and stop the heartbeat.

#### Scenario: Service destroyed

- **WHEN** a toast is on screen and the service is destroyed
- **THEN** no `kbq-toast-overlay` remains in the overlay container

### Requirement: Stack raised above later overlays

Every `show()` and `showTemplate()` SHALL move the stack above the overlays opened after it. A stack shown as a popover SHALL be shown again instead of being moved, and focus inside a toast SHALL stay where it is. A stack that is already the topmost overlay MUST NOT be taken out of the DOM and put back.

#### Scenario: Overlay opened after the stack

- **WHEN** a toast is on screen, another overlay opens, and another toast is shown
- **THEN** the toast overlay is the last child of the overlay container
- **AND** the user can click the close button of a toast where the other overlay covers the stack

#### Scenario: Popover overlays

- **WHEN** overlays are shown as popovers and a toast is shown after another overlay opened
- **THEN** the stack is painted above that overlay and the focused close button keeps focus

#### Scenario: Stack already on top

- **WHEN** the stack is the last overlay and another toast is shown
- **THEN** the toasts on screen are not taken out of the DOM

### Requirement: Rendering in a shadow root

Toasts SHALL be rendered in the application's `OverlayContainer`. With `kbqShadowDomOverlayProvider`, they SHALL appear inside the shadow root it resolves and not in the light DOM.

#### Scenario: Micro-frontend in a shadow root

- **WHEN** the application provides `kbqShadowDomOverlayProvider` for a host with an open shadow root and shows a toast
- **THEN** the toast is found in the shadow root and not in `document.body`

### Requirement: Views destroyed from outside

A toast or template toast whose view is destroyed by whoever holds its ref SHALL disappear from `toasts` or `templates` at once, SHALL be dropped from the stack on the next heartbeat step, and SHALL then keep neither the heartbeat running nor the overlay attached.

#### Scenario: Destroyed template ref

- **WHEN** the ref of a sticky template toast is destroyed by the consumer
- **THEN** `templates` is empty at once
- **AND** after the next step the heartbeat stops and no container remains

#### Scenario: Ref destroyed during the exit

- **WHEN** a hidden toast's ref is destroyed before its exit animation ends
- **THEN** the overlay is detached

### Requirement: Custom toast component

When `KBQ_TOAST_FACTORY` provides a component that extends `KbqToastComponent`, `show()` SHALL create that component instead of `kbq-toast`.

#### Scenario: Factory component

- **WHEN** `KBQ_TOAST_FACTORY` provides a subclass of `KbqToastComponent` and a toast is shown
- **THEN** `toasts[0].instance` is an instance of that subclass

### Requirement: Factory component without an id

When the factory component has no numeric `id`, `show()` SHALL throw "KBQ_TOAST_FACTORY must provide a component extending KbqToastComponent: `id` is missing." and SHALL leave nothing rendered, also when it is called again.

#### Scenario: Component that does not extend the toast

- **WHEN** `KBQ_TOAST_FACTORY` provides a component without an `id` and `show()` is called twice
- **THEN** each call throws that error
- **AND** none of those components is left in the overlay container

### Requirement: Container hosted by a consumer

A `kbq-toast-container` placed in a consumer's template SHALL create toasts with `createToast(data, component, onTop)` and template toasts with `createTemplate(data, template, onTop)` without a stack wired up by hand, and SHALL remove a view with `remove(viewRef)`.

#### Scenario: Toast in a consumer container

- **WHEN** a consumer's template renders `<kbq-toast-container />` and calls `createToast()` on it
- **THEN** no error is thrown and a `kbq-toast` is rendered inside that container

### Requirement: Countdown heartbeat

`timer` SHALL emit every 500 ms while the service holds at least one toast or template toast and is not paused. It SHALL NOT emit while the stack is empty, SHALL emit outside the Angular zone, and SHALL stop once the service is destroyed.

#### Scenario: Empty stack

- **WHEN** a subscriber listens to `timer` for 2 seconds with nothing on the stack, and then a toast is shown
- **THEN** no value arrives while the stack is empty and one arrives 500 ms after the toast is shown

#### Scenario: Outside the Angular zone

- **WHEN** `timer` emits while a toast is on screen
- **THEN** no emission runs inside the Angular zone

#### Scenario: After destroy

- **WHEN** the service is destroyed with a toast on screen
- **THEN** `timer` emits nothing more

### Requirement: Calls from reactive contexts

`show()`, `showTemplate()`, `hide()` and `hideTemplate()` SHALL run untracked, so calling them from an `effect()` MUST NOT make the signals they read along the way dependencies of that effect.

#### Scenario: Toast shown from an effect

- **WHEN** an `effect()` that reads one signal calls `show()`
- **THEN** the effect runs again only when that signal changes, not when the toast stack changes

### Requirement: Stack reflow reported as a scroll

The toast container SHALL report every change of its own size, such as a toast being added or collapsing away, as a scroll of the container through the CDK scroll dispatcher, so that overlays with the reposition scroll strategy, including ones anchored inside a toast, update their position. Real scroll events of the container SHALL be reported as well.

#### Scenario: Stack resized

- **WHEN** the size of the toast container changes
- **THEN** the scroll dispatcher emits the container as the scrolled element
- **AND** an attached overlay with the reposition strategy updates its position

#### Scenario: Template toast removed

- **WHEN** a template toast is hidden while a toast stays and the container's size changes
- **THEN** the scroll dispatcher emits once

#### Scenario: Real scroll

- **WHEN** the toast container receives a `scroll` event
- **THEN** the scroll dispatcher emits

### Requirement: Motion and reduced motion

A toast SHALL slide in when shown and slide out while collapsing its height when hidden, unless animations are off through `KBQ_ANIMATIONS_CONFIG`, no-op animations or the user's reduced-motion setting. Then the toast SHALL carry the host class `kbq-animations-disabled`, appear and disappear without motion, and still close normally.

#### Scenario: Reduced motion

- **WHEN** the system asks for reduced motion and the user shows a sticky toast and clicks its close button
- **THEN** the toast is visible after showing and hidden after the click
