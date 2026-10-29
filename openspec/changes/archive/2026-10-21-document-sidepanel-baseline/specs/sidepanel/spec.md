# Spec Delta

## Purpose

Describes what `@koobiq/components/sidepanel` guarantees to consumers: how `KbqSidepanelService` opens a panel that slides in from an edge of the screen, how the panel and its header, body, footer and close buttons behave, how it closes, stacks, handles focus and assistive technology, and how it remembers whether it was open.

## ADDED Requirements

### Requirement: Opening a component sidepanel

`KbqSidepanelService.open()` called with a component class SHALL render that component inside a new sidepanel in the CDK overlay container before it returns, and SHALL return a `KbqSidepanelRef` whose `instance` is the created component.

#### Scenario: Component content

- **WHEN** the application calls `open()` with a component class
- **THEN** the component's content is in the overlay container right after the call
- **AND** `ref.instance` is an instance of that component

### Requirement: Opening a template sidepanel

`open()` called with a `TemplateRef` SHALL render the template inside a new sidepanel with a context whose `$implicit` is the configured `data` and whose `sidepanelRef` is the returned ref. The returned ref's `instance` SHALL stay unset.

#### Scenario: Template with data

- **WHEN** a template declaring `let-data let-sidepanelRef="sidepanelRef"` is opened with `{ data: { value: 'World!' } }`
- **THEN** the template renders `data.value`
- **AND** the template's `sidepanelRef` is the ref `open()` returned

### Requirement: Data and ref for the content

The content of a sidepanel SHALL be able to inject `KBQ_SIDEPANEL_DATA`, which holds the configured `data` (`null` when none is given), and `KbqSidepanelRef`, which is the ref `open()` returned. This SHALL hold for components and for templates.

#### Scenario: Injecting the data

- **WHEN** a component is opened with `{ data: { value: 'test' } }`
- **THEN** the component's injected `KBQ_SIDEPANEL_DATA` has `value` `'test'`

#### Scenario: Close button in a template sidepanel

- **WHEN** a template sidepanel contains a `button` with `kbq-sidepanel-close` and the user clicks it
- **THEN** the sidepanel closes

### Requirement: Configuration defaults

A sidepanel opened without a config SHALL use position `right`, size `medium`, `hasBackdrop: true`, `disableClose: false` and `data: null`. A config key whose value is `undefined` MUST NOT override a default.

#### Scenario: No config

- **WHEN** a sidepanel is opened without a config
- **THEN** `ref.config` has position `right`, `hasBackdrop` `true` and `disableClose` `false`

#### Scenario: Explicit undefined

- **WHEN** a sidepanel is opened with `{ position: undefined, size: undefined }`
- **THEN** the sidepanel is a medium sidepanel at the right edge

### Requirement: Application-wide defaults

Options provided through `KBQ_SIDEPANEL_DEFAULT_OPTIONS` SHALL apply to every sidepanel the service opens, and the config passed to `open()` SHALL override them key by key, except for keys whose value is `undefined`.

#### Scenario: Default size from the token

- **WHEN** `KBQ_SIDEPANEL_DEFAULT_OPTIONS` provides `{ size: 'large' }` and a sidepanel is opened without a size
- **THEN** the sidepanel is large

#### Scenario: Config wins over the token

- **WHEN** the token provides `{ size: 'large' }` and `open()` is called with `{ size: 'small' }`
- **THEN** the sidepanel is small

### Requirement: Sidepanel ids

Every sidepanel SHALL have an `id`: the configured `id`, or `kbq-sidepanel-<n>` from a counter. The id SHALL be written to the `id` attribute of the `kbq-sidepanel-container` element, and `getSidepanelById()` SHALL return the ref of the open sidepanel with that id, or `undefined`.

#### Scenario: Generated ids

- **WHEN** two sidepanels are opened without an `id`
- **THEN** each ref has an `id` and the two ids differ

#### Scenario: Looking up by id

- **WHEN** a sidepanel is opened with `{ id: 'example' }`
- **THEN** `ref.id` is `'example'` and `getSidepanelById('example')` returns that ref

### Requirement: Unique ids

Opening a sidepanel with an `id` that an open sidepanel already has SHALL throw the error `Sidepanel with id "<id>" exists already. The sidepanel id must be unique.` A sidepanel counts as open until its exit transition has ended.

#### Scenario: Reusing an id

- **WHEN** a sidepanel with `id` `'example'` is open and another one is opened with the same `id`
- **THEN** `open()` throws

### Requirement: Overlay pane class

The `overlayPanelClass` option SHALL add its class or classes to the overlay pane that holds the sidepanel.

#### Scenario: Custom pane class

- **WHEN** a sidepanel is opened with `{ overlayPanelClass: 'custom-overlay' }`
- **THEN** an element with the class `custom-overlay` is in the overlay container

### Requirement: Header

`kbq-sidepanel-header` SHALL render its projected content as the sidepanel title, in an element with the class `kbq-sidepanel-title`, and SHALL carry the class `kbq-sidepanel-header`.

#### Scenario: Title text

- **WHEN** the content contains `<kbq-sidepanel-header>Details</kbq-sidepanel-header>`
- **THEN** the header shows "Details" as the sidepanel title

### Requirement: Header close button

With `closeable` set, the header SHALL render an icon-only close button after the title, and a click on it SHALL close the sidepanel. Without it, which is the default, no close button SHALL be rendered. Changing `closeable` after the sidepanel opened SHALL add or remove the button.

#### Scenario: Closeable header

- **WHEN** a header has `[closeable]="true"` and the user clicks its close button
- **THEN** the sidepanel closes

#### Scenario: Becoming closeable later

- **WHEN** a header renders with `closeable` `false` and then `closeable` becomes `true`
- **THEN** the close button appears in the header

### Requirement: Header title truncation

By default (`truncateText` `true`) the header SHALL carry the class `kbq-sidepanel-header_truncate-text` and keep the title on one line, cut with an ellipsis. A title cut this way SHALL show its full text in a tooltip on hover or keyboard focus. With `truncateText` `false` the title SHALL wrap.

#### Scenario: Long title

- **WHEN** the title is longer than the header and the user hovers it
- **THEN** the title stays on one line and a tooltip shows the full text

### Requirement: Scrollable body

`kbq-sidepanel-body` (element or attribute) SHALL carry the class `kbq-sidepanel-body`, take the height left by the header and the footer, and scroll its content vertically with the library's custom scrollbar instead of the native one (`kbq-scrollbar-viewport` and `kbq-scrollbar-viewport_native-scrollbar-hidden`).

#### Scenario: Custom scrollbar

- **WHEN** a sidepanel with a body opens
- **THEN** the body has the classes `kbq-scrollbar-viewport` and `kbq-scrollbar-viewport_native-scrollbar-hidden`

#### Scenario: Footer stays in place

- **WHEN** the body content is taller than the panel
- **THEN** the body scrolls and the footer stays pinned directly below it

### Requirement: Scrollbar on open

When the sidepanel has opened, the body SHALL briefly show its scrollbar track and then fade it out; hovering the body SHALL show the track again. When the content fits, no scrollbar SHALL stay visible.

#### Scenario: Track flash

- **WHEN** a sidepanel whose body overflows opens
- **THEN** the scrollbar track becomes visible and then fades out

#### Scenario: Short content

- **WHEN** a sidepanel whose body content fits opens
- **THEN** no scrollbar is visible once the flash is over

### Requirement: Overflow shadows

The header SHALL show a shadow while the body is scrolled away from its top, and the footer SHALL show a shadow while the body has content below its visible area, including right after opening.

#### Scenario: Content below on open

- **WHEN** a sidepanel whose body overflows opens
- **THEN** the footer shows its shadow

#### Scenario: Scrolled to the middle

- **WHEN** the body is scrolled halfway down
- **THEN** both the header and the footer show their shadows

### Requirement: Footer and actions

`kbq-sidepanel-footer` and `kbq-sidepanel-actions` (element or attribute) SHALL carry the classes `kbq-sidepanel-footer` and `kbq-sidepanel-actions`. Actions inside a footer SHALL be laid out in a row, aligned to the start with `align="left"` and to the end with `align="right"`.

#### Scenario: Two action groups

- **WHEN** a footer holds one actions block with `align="left"` and another with `align="right"`
- **THEN** the first block's content sits at the start and the second block's at the end of the footer

### Requirement: Component content layout

When the content is a component, its host element SHALL carry the class `kbq-sidepanel-content-host` and be laid out as a column, so that a header, a body and a footer inside it behave as they do in a template sidepanel.

#### Scenario: Component host

- **WHEN** a component is opened in a sidepanel
- **THEN** its host element is a direct child of `.kbq-sidepanel-content` with the class `kbq-sidepanel-content-host`

### Requirement: Close button directive

A `button` with `kbq-sidepanel-close` or `kbqSidepanelClose` SHALL close the enclosing sidepanel when clicked, and SHALL carry the class `kbq-sidepanel-close`. The value bound to the attribute SHALL be the close result. When both spellings are bound, the `kbqSidepanelClose` value SHALL win unless it is `null` or `undefined`. The directive MUST NOT apply to other elements.

#### Scenario: Hyphenated value

- **WHEN** the user clicks `<button kbq-sidepanel-close="hyphenated">`
- **THEN** `afterClosed()` emits `'hyphenated'`

#### Scenario: Both spellings

- **WHEN** the user clicks a button with `kbq-sidepanel-close="loser"` and `[kbqSidepanelClose]="'winner'"`
- **THEN** `afterClosed()` emits `'winner'`

### Requirement: Close button without a value

A close button whose attribute has no value SHALL close the sidepanel with an empty string as the result, not `undefined`, because the bare attribute counts as the value. This includes the close button of a closeable header.

#### Scenario: Bare attribute

- **WHEN** the user clicks `<button kbq-sidepanel-close>`
- **THEN** `afterClosed()` emits `''`

### Requirement: Close button does not submit forms

After it first renders, a close button without a `type` attribute SHALL get `type="button"`, so clicking it inside a form MUST NOT submit the form. A `type` set by the author SHALL be left unchanged.

#### Scenario: Close button inside a form

- **WHEN** the content is a form with a close button that has no `type` and the user clicks it
- **THEN** the sidepanel closes and the form is not submitted

### Requirement: Positions

The `position` option SHALL place the sidepanel at the `right` (default), `left`, `top` or `bottom` edge of the viewport, slide it in from that edge, and add the class `kbq-sidepanel-container_<position>` to the `kbq-sidepanel-container` element.

#### Scenario: Default position

- **WHEN** a sidepanel is opened without a position
- **THEN** its container has the class `kbq-sidepanel-container_right`

#### Scenario: Left edge

- **WHEN** a sidepanel is opened with position `left`
- **THEN** its container has the class `kbq-sidepanel-container_left`

### Requirement: Opened event

`afterOpened()` SHALL emit once, and then complete, when the entrance transition of the sidepanel has ended, or when that transition is cut short because the sidepanel moves again, for example because another sidepanel opens over it at the same position.

#### Scenario: Waiting for the entrance

- **WHEN** a sidepanel opens and its entrance transition is still running
- **THEN** `afterOpened()` has not emitted
- **AND** it emits once the transition ends

### Requirement: Closing events

`close(result)` SHALL start the exit transition. `beforeClosed()` SHALL emit once, after the render that starts it and never inside the `close()` call, so a subscriber added right after `close()` is notified. `afterClosed()` SHALL emit the result once the transition has ended and the sidepanel is removed. Both MUST complete after emitting.

#### Scenario: Closing with a result

- **WHEN** the application calls `ref.close('Result')`
- **THEN** `afterClosed()` emits `'Result'`
- **AND** the `kbq-sidepanel-container` element is removed

#### Scenario: Subscribing right after close

- **WHEN** the application calls `close()` and subscribes to `beforeClosed()` right after it
- **THEN** the subscriber is notified once

### Requirement: Only the first close counts

Once a sidepanel has started closing, further `close()` calls MUST be ignored: `afterClosed()` SHALL emit only once, with the result of the first call.

#### Scenario: Closing twice

- **WHEN** the application calls `close('A')` and then `close('B')`
- **THEN** `afterClosed()` emits once, with `'A'`

### Requirement: Open sidepanels list

`openedSidepanels` SHALL list the open sidepanels in the order they were opened. A closing sidepanel SHALL stay in the list until its exit transition ends, and SHALL be gone from it by the time its `afterClosed()` emits.

#### Scenario: During the exit

- **WHEN** two sidepanels are open and `closeAll()` is called
- **THEN** `openedSidepanels` still holds both, in their original order, right after the call
- **AND** it is empty once the exit transitions have ended

### Requirement: Reduced motion

When animations are disabled for the application or the user prefers reduced motion, the container SHALL carry the class `kbq-animations-disabled` and move without a transition, and the opened and closing events SHALL fire right after the render that changes the state.

#### Scenario: Reduced motion

- **WHEN** the user prefers reduced motion and a sidepanel opens
- **THEN** the container has the class `kbq-animations-disabled` and `afterOpened()` emits right after the next render

### Requirement: Backdrop

With `hasBackdrop` `true`, the default, the sidepanel SHALL render a backdrop behind it with the class `kbq-overlay-dark-backdrop`, or the class given in `backdropClass` instead. With `hasBackdrop` `false` there MUST be no backdrop. The backdrop SHALL fade with the panel when it closes and then be removed.

#### Scenario: Default backdrop

- **WHEN** a sidepanel is opened without a config
- **THEN** the overlay container holds a `cdk-overlay-backdrop` element

#### Scenario: Custom backdrop class

- **WHEN** a sidepanel is opened with `{ backdropClass: 'custom-backdrop' }`
- **THEN** the backdrop has the class `custom-backdrop`

### Requirement: Backdrop click closes the sidepanel

A primary-button click on the backdrop SHALL close the sidepanel unless `disableClose` is set. Right and middle clicks on the backdrop MUST NOT close it.

#### Scenario: Clicking the backdrop

- **WHEN** a sidepanel with a backdrop is open and the user clicks the backdrop
- **THEN** the sidepanel closes

#### Scenario: Right click on the backdrop

- **WHEN** the user right-clicks the backdrop
- **THEN** the sidepanel stays open

### Requirement: Page scroll under a sidepanel

By default, a sidepanel with a backdrop SHALL block the page scroll while it is open, and a sidepanel without one SHALL leave the page scrollable. The `scrollStrategy` option SHALL replace this default with the strategy its factory returns. While any sidepanel with a backdrop and the default strategy stays open, the page SHALL stay blocked, whichever of them closes first.

#### Scenario: Modal sidepanel

- **WHEN** a sidepanel with a backdrop is open over a page that overflows
- **THEN** the page cannot scroll

#### Scenario: Non-modal sidepanel

- **WHEN** a sidepanel with `hasBackdrop: false` is open
- **THEN** the page scroll is not blocked

#### Scenario: Lower sidepanel closes first

- **WHEN** two sidepanels with backdrops are open and the lower one closes
- **THEN** the page stays blocked

### Requirement: Escape closes the sidepanel

Escape pressed anywhere in the document SHALL close the topmost sidepanel and prevent the key's default action, unless `disableClose` is set or the key's default action was already prevented, for example by a control or a tooltip inside the panel. A sidepanel below the topmost one MUST NOT receive the key.

#### Scenario: Escape

- **WHEN** a sidepanel is open and the user presses Escape
- **THEN** the sidepanel closes and the key event's default action is prevented

#### Scenario: Tooltip inside the panel

- **WHEN** a tooltip inside the sidepanel is open and the user presses Escape twice
- **THEN** the first press closes only the tooltip and the second closes the sidepanel

#### Scenario: Key already handled

- **WHEN** a control inside the panel prevents the default action of Escape
- **THEN** the sidepanel stays open

### Requirement: Disabling close by the user

With `disableClose` set, Escape, a click on the backdrop, a click on the indent strip and a click on a sidepanel underneath MUST NOT close the sidepanel, and Escape SHALL keep its default action.

#### Scenario: Escape with disableClose

- **WHEN** a sidepanel with `disableClose` is open and the user presses Escape
- **THEN** the sidepanel stays open and the key event's default action is not prevented

#### Scenario: Backdrop with disableClose

- **WHEN** a sidepanel with `disableClose` is open and the user clicks the backdrop
- **THEN** the sidepanel stays open

### Requirement: Close controls ignore disableClose

`disableClose` MUST NOT affect `KbqSidepanelRef.close()`, the close buttons (`kbq-sidepanel-close`) or the close button of a closeable header: they SHALL close the sidepanel whatever its value.

#### Scenario: Close button with disableClose

- **WHEN** a sidepanel with `disableClose` has a footer button with `kbq-sidepanel-close` and the user clicks it
- **THEN** the sidepanel closes

### Requirement: disableClose can change while open

`disableClose` SHALL be read from `ref.config` each time the user tries to close the sidepanel, so setting `ref.config.disableClose` after the sidepanel opened SHALL take effect for the next attempt.

#### Scenario: Turning disableClose on

- **WHEN** a sidepanel was opened without `disableClose`, the application sets `ref.config.disableClose = true`, and the user clicks the backdrop and presses Escape
- **THEN** the sidepanel stays open

### Requirement: Non-modal mode

With `hasBackdrop: false`, the sidepanel SHALL leave the page behind it interactive: there is no backdrop and, unless `trapFocus` is set, no focus trap, no `aria-modal`, and the rest of the page stays available to assistive technology. A click elsewhere on the page MUST NOT close it.

#### Scenario: Clicking the page

- **WHEN** a non-modal sidepanel is open and the user clicks a button on the page behind it
- **THEN** the button receives the click and the sidepanel stays open

### Requirement: Stacking sidepanels

Opening a sidepanel while others are open SHALL put it on top of them. When it opens at the same position as the previous top sidepanel, that one SHALL be pushed back and partly visible, the one before it SHALL be hidden, and only the backdrop of the topmost sidepanel at that position SHALL stay visible.

#### Scenario: Three modal sidepanels

- **WHEN** three sidepanels with backdrops are opened at the right edge
- **THEN** all three backdrops exist and all but one are transparent

#### Scenario: Opened from afterOpened of a lower one

- **WHEN** the `afterOpened()` handler of a first sidepanel opens a third one, after a second one was opened over the first at the same position
- **THEN** `openedSidepanels` lists the first, the second and the third in that order
- **AND** the third is on screen, the second is pushed back and the first is hidden

### Requirement: Indent strip of a stack

When two or more sidepanels are open at the same position, the topmost of them SHALL show one indent strip that exposes the panel underneath and SHALL carry the class `kbq-sidepanel_nested`; no other panel of the stack SHALL show one, however deep it is. Sidepanels at other positions MUST NOT count. The strip SHALL be recomputed when a panel of the stack closes.

#### Scenario: Second panel at the same position

- **WHEN** one sidepanel is open at the right edge and a second one opens there
- **THEN** exactly one `.kbq-sidepanel-indent` exists, on the top panel

#### Scenario: Different positions

- **WHEN** one sidepanel is open at the right edge and another one opens at the left edge
- **THEN** no indent strip exists

#### Scenario: Lower panel closes

- **WHEN** the lower of two stacked sidepanels closes
- **THEN** the remaining sidepanel shows no indent strip

### Requirement: Clicking the strip closes the top panel

A click on the indent strip, or on a sidepanel underneath at the same position, SHALL close the sidepanel above it unless that sidepanel has `disableClose`. A click on a sidepanel at another position MUST NOT close it.

#### Scenario: Indent click

- **WHEN** two sidepanels are stacked at the right edge and the user clicks the indent strip
- **THEN** the top sidepanel closes and no indent strip remains

#### Scenario: Top panel with disableClose

- **WHEN** the top sidepanel of a stack has `disableClose` and the user clicks its indent strip
- **THEN** both sidepanels stay open

#### Scenario: Panel at another position

- **WHEN** non-modal sidepanels are open at the right and the left edges and the user clicks the right one
- **THEN** both stay open

### Requirement: Closing all sidepanels

`closeAll()` SHALL close every open sidepanel, from the top of the stack down, including those opened through other service instances that share the stack.

#### Scenario: Three open sidepanels

- **WHEN** three sidepanels are open and `closeAll()` is called
- **THEN** no `kbq-sidepanel-container` remains once the exit transitions have ended

### Requirement: Service instances

A `KbqSidepanelService` provided below the root, by a component or by importing `KbqSidepanelModule`, SHALL share the open stack with the instances above it, so `openedSidepanels`, `getSidepanelById()`, the id check and `closeAll()` cover all of them. When such an instance is destroyed, it SHALL close only the sidepanels opened through it.

#### Scenario: Component-level service destroyed

- **WHEN** a component that provides its own `KbqSidepanelService` opens a sidepanel and is then destroyed
- **THEN** that sidepanel closes

### Requirement: Calls from an effect

`open()` and `close()` MUST NOT make an Angular `effect()` that calls them depend on the state of the open sidepanels, so the effect does not run again as the stack changes.

#### Scenario: Opening over another sidepanel from an effect

- **WHEN** an effect opens a sidepanel while another one is open
- **THEN** the effect runs once and two sidepanels are open

#### Scenario: Closing from an effect

- **WHEN** an effect closes the top of two stacked sidepanels
- **THEN** the effect runs once and one sidepanel stays open

### Requirement: Focus moves into the sidepanel

By default (`trapFocusAutoCapture` `true`), opening a sidepanel, modal or not, SHALL move focus to the element marked `cdkFocusInitial`, or else to the first element in the panel that Tab can reach — the close button of a closeable header that comes first. With `trapFocusAutoCapture: false`, focus MUST stay where it was.

#### Scenario: Element marked cdkFocusInitial

- **WHEN** a sidepanel whose body has a button marked `cdkFocusInitial` opens
- **THEN** that button has focus

#### Scenario: Opened from a dropdown item

- **WHEN** a dropdown item opens a sidepanel
- **THEN** focus is inside the sidepanel, not on the dropdown trigger or the item

#### Scenario: Auto capture off

- **WHEN** a sidepanel is opened with `trapFocusAutoCapture: false` while a page button has focus
- **THEN** the page button keeps focus

### Requirement: Focus returns on close

When a sidepanel that moved focus into itself is removed at the end of its exit, focus SHALL return to the element that had focus when it opened, for modal and non-modal sidepanels alike. This SHALL happen before `afterClosed()` emits, so a subscriber can move focus elsewhere.

#### Scenario: Modal sidepanel

- **WHEN** a sidepanel opened while a page button had focus closes
- **THEN** the page button has focus again

#### Scenario: Non-modal sidepanel

- **WHEN** a sidepanel with `hasBackdrop: false` opened while a page button had focus closes
- **THEN** the page button has focus again

### Requirement: Focus trap

`trapFocus` SHALL default to the value of `hasBackdrop`. While a trapping sidepanel is open, Tab and Shift+Tab SHALL cycle through the focusable elements inside it, including the header close button and the footer buttons, and focus MUST NOT leave it.

#### Scenario: Tabbing in a modal sidepanel

- **WHEN** a modal sidepanel is open and the user presses Tab six times
- **THEN** focus stays inside the sidepanel after every press

### Requirement: Dialog semantics

The `kbq-sidepanel-container` element SHALL have `role="dialog"` and `tabindex="-1"`. It SHALL have `aria-modal="true"` while focus is trapped and no `aria-modal` attribute otherwise.

#### Scenario: Modal sidepanel

- **WHEN** a sidepanel with the default config is open
- **THEN** its container has `role="dialog"` and `aria-modal="true"`

#### Scenario: Non-modal sidepanel

- **WHEN** a sidepanel with `hasBackdrop: false` is open
- **THEN** its container has `role="dialog"` and no `aria-modal`

### Requirement: Accessible name

A `kbq-sidepanel-header` SHALL name the sidepanel: its title element SHALL get the id `<sidepanel id>-title` and the container SHALL point `aria-labelledby` at it, also when the header renders after the sidepanel opened. An `ariaLabelledBy` in the config SHALL win over the header. An `ariaLabel` in the config SHALL be written to `aria-label`.

#### Scenario: Named by the header

- **WHEN** a sidepanel with a header titled "Details" opens
- **THEN** the element its container's `aria-labelledby` points to contains "Details"

#### Scenario: Explicit ariaLabelledBy

- **WHEN** a sidepanel with a header is opened with `{ ariaLabelledBy: 'outer-heading' }`
- **THEN** its container has `aria-labelledby="outer-heading"`

#### Scenario: Label from the config

- **WHEN** a sidepanel without a header is opened with `{ ariaLabel: 'Details' }`
- **THEN** its container has `aria-label="Details"` and no `aria-labelledby`

### Requirement: Page hidden from assistive technology

While at least one sidepanel that traps focus is open, every other child of the overlay container's parent, except `script` and `style` elements and elements with `aria-live`, SHALL have `aria-hidden="true"`. When the last such sidepanel is removed, each of them SHALL get back its previous `aria-hidden` value.

#### Scenario: Modal sidepanel open and closed

- **WHEN** a modal sidepanel opens and then closes
- **THEN** the page elements outside the overlay container have `aria-hidden="true"` while it is open
- **AND** none of them has `aria-hidden` after it closed

#### Scenario: Non-modal sidepanel

- **WHEN** only a sidepanel with `hasBackdrop: false` is open
- **THEN** no page element outside the overlay container has `aria-hidden`

#### Scenario: Component-level service destroyed

- **WHEN** a modal sidepanel opened through the root service is open and a component-level service is destroyed
- **THEN** the page stays hidden from assistive technology

### Requirement: No automated accessibility violations

An open sidepanel with a closeable header, a body and a footer with a close button SHALL pass the axe-core checks that the unit test environment can run.

#### Scenario: Axe audit

- **WHEN** such a sidepanel is open and axe-core audits the overlay container
- **THEN** it reports no violations

### Requirement: Localized close button name

The close button of a closeable header SHALL take its accessible name from `a11y.close` of the active locale ("Закрыть" for the default `ru-RU`, "Close" for `en-US`), and `[localeOverrides]` on the header SHALL override it for that header.

#### Scenario: Default locale

- **WHEN** a closeable header renders under the default locale
- **THEN** its close button has `aria-label="Закрыть"`

#### Scenario: Override on the header

- **WHEN** a closeable header binds `[localeOverrides]="{ a11y: { close: 'Dismiss' } }"`
- **THEN** its close button has `aria-label="Dismiss"`

### Requirement: Recording the open state

With `stateSavingKey` set, opening the sidepanel SHALL store `{ opened: true }` under that key in the application's state store, and closing it on its own — through `close()`, a close button, the backdrop, Escape or the indent strip — SHALL store `{ opened: false }` once it is removed. Without a key nothing MUST be stored.

#### Scenario: Open and close

- **WHEN** a sidepanel with a `stateSavingKey` is opened and then closed through its ref
- **THEN** the store holds `{ opened: true }` after opening and `{ opened: false }` after closing

#### Scenario: No key

- **WHEN** a sidepanel without a `stateSavingKey` is opened and closed
- **THEN** the store holds no key

### Requirement: Group close keeps the open state

Closing sidepanels as a group — `closeAll()`, or the service instance that opened them being destroyed — MUST NOT record them as closed, so the stored `{ opened: true }` stays.

#### Scenario: closeAll

- **WHEN** a sidepanel with a `stateSavingKey` is open and `closeAll()` is called
- **THEN** the store still holds `{ opened: true }` for that key

### Requirement: Reading the open state

`wasOpen(key)` SHALL return the stored `opened` flag. It SHALL return `false` for an empty key, for a key with nothing stored, and for a stored value that is not an object with a boolean `opened`.

#### Scenario: Stored values

- **WHEN** the store holds `{ opened: true }` and later `{ opened: false }` under a key
- **THEN** `wasOpen()` returns `true` and then `false`

#### Scenario: Unusable payload

- **WHEN** the store holds `{ opened: 'yes' }` under the key
- **THEN** `wasOpen()` returns `false`

### Requirement: State saving turned off

While state saving is turned off through `KbqStateSavingService`, opening and closing a sidepanel MUST NOT write to the store, and `wasOpen()` SHALL return `false` whatever is stored.

#### Scenario: Turned off

- **WHEN** state saving is turned off and a sidepanel with a `stateSavingKey` opens
- **THEN** nothing is stored, and `wasOpen()` returns `false` even after `{ opened: true }` is put in the store

### Requirement: Clearing the open state

`clearSavedState(key)` SHALL remove what is stored under the key. Persistence SHALL stay on, so a sidepanel using that key is recorded again when it next opens or closes.

#### Scenario: Clearing while open

- **WHEN** a sidepanel with a `stateSavingKey` is open, `clearSavedState()` is called with its key, and the sidepanel then closes
- **THEN** the store holds nothing right after the clear and `{ opened: false }` after the close

### Requirement: State keys are claimed

A key the service has written or read through `wasOpen()` SHALL be reported by `KbqStateSavingService` as in use, not as an orphan. When the service instance is destroyed, it SHALL release its keys.

#### Scenario: Key read before opening

- **WHEN** the store holds an entry that `KbqStateSavingService` reports as an orphan and `wasOpen()` reads its key
- **THEN** the key is no longer reported as an orphan

#### Scenario: Service destroyed

- **WHEN** the service that read a key is destroyed
- **THEN** `KbqStateSavingService` reports no sidepanel keys

### Requirement: Shared state key warning

In development mode, opening a sidepanel whose `stateSavingKey` an open sidepanel already uses SHALL log a console warning that contains "already persists under the state saving key". The sidepanel SHALL still open.

#### Scenario: Two panels, one key

- **WHEN** two sidepanels are opened with the same `stateSavingKey`
- **THEN** a warning is logged and both sidepanels are open

### Requirement: Size presets

The `size` option SHALL add the class `kbq-sidepanel_<size>` to the container. A sidepanel at the left or right edge SHALL take the full viewport height and be 400 px wide when `small`, 640 px when `medium` (the default) and 960 px when `large`.

#### Scenario: Medium by default

- **WHEN** a sidepanel at the right edge is opened without a size
- **THEN** its container has the class `kbq-sidepanel_medium` and the panel is 640 px wide

#### Scenario: Large

- **WHEN** a sidepanel at the right edge is opened with size `large`
- **THEN** the panel is 960 px wide

### Requirement: Top and bottom sidepanels

A sidepanel at the top or bottom edge SHALL span the viewport width minus its margins and take a third of the viewport height, but at least 400 px. The size preset MUST NOT change its width.

#### Scenario: Top and bottom at once

- **WHEN** one sidepanel is opened at the top edge and another at the bottom edge
- **THEN** both span the width of the viewport and neither shows an indent strip

### Requirement: Custom injector for the content

When `injector` is set in the config, the content of the sidepanel SHALL be created with that injector as the parent of its injector, so it can inject tokens provided there. Without it, the parent SHALL be the injector of the service instance that opened the sidepanel.

#### Scenario: Token from a custom injector

- **WHEN** a component that injects a custom token is opened with an `injector` that provides the token
- **THEN** the component receives the provided value
