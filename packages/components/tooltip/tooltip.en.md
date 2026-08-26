Tooltip — a hint that appears on hover or focus. The tooltip closes when the cursor is moved away, focus is removed, the page is scrolled, or <kbd>Esc</kbd> is pressed.

<!-- example(tooltip-overview) -->

### Width

The tooltip size is determined by its content, but the component width cannot exceed 300px.

<!-- example(tooltip-width) -->

Sometimes it's more convenient if the text in the tooltip doesn't wrap and is displayed on a single line. For example, when comparing checksums, outputting email addresses, or file and folder paths. For such cases, don't limit the tooltip width.

<!-- example(tooltip-wide-width) -->

#### Style

<!-- example(tooltip-style) -->

#### Arrow

Add a pointer arrow when it can be confusing which element the hint relates to.

<!-- example(tooltip-arrow) -->

### Positioning

#### Relative to Element

In normal circumstances, the tooltip opens at the top centered. The position near the trigger element can be adjusted manually.

Choose a position where the tooltip won't cover content that the user will interact with next. For example, in a vertical list, open tooltips to the side so the hint doesn't interfere with viewing the neighboring element in the reading direction.

<!-- example(tooltip-placements) -->

#### Position Priority

If there isn't enough space to display the tooltip, it will open on the opposite side. The kbqPlacementPriority attribute helps configure fallback positions if they need to differ from the default order.

#### Near the Cursor

When configuring kbqRelativeToPointer="true", the tooltip is positioned relative to the cursor. This is often needed for long strings (checksums, email, paths) so the hint appears right at the cursor.

<!-- example(tooltip-relative-to-pointer) -->

### Offset

<!-- example(tooltip-offset) -->

### Delay

When hovering over an element, the tooltip appears with a 0.4 second delay and disappears instantly.

When switching focus or hovering over another element with a tooltip, the delay works as follows:

- The first tooltip appears with standard delay,
- Subsequent tooltips appear instantly,
- If the previous element's tooltip has disappeared and more than 2 seconds have passed, the 0.4 second delay applies again.

<!-- example(tooltip-hide-with-timeout) -->

### Moving the Cursor onto the Tooltip

The tooltip receives pointer events, so moving the cursor from the trigger onto the tooltip itself does not
close it. This matters for users who read at high magnification, where the pointer often ends up over the
tooltip, and for tooltips that take a while to read (WCAG 1.4.13 "Content on Hover or Focus"). Combine it with
`[hideWithTimeout]="true"` and `kbqLeaveDelay` to give the cursor time to travel to the tooltip — see the
Interactive Tooltip example.

Set `[ignoreTooltipPointerEvents]="true"` for the opposite behavior: the tooltip becomes transparent to the
pointer and clicks pass through to whatever is underneath it. Use it for tooltips that float over other click
targets — for example the overflow hints of a scrolling option list, where a pointer-capturing tooltip would
swallow the click that selects the neighboring option.

Before v20 the tooltip ignored pointer events by default, so this reverses on upgrade: markup that relied on
clicks passing through now has to ask for it. The built-in overflow hints (`kbq-title`, `kbqEllipsisCenter`,
the option and timezone-option hints) already opt out on their own, and so does any tooltip whose `kbqTrigger`
is `manual` or `none` — hovering such a pane neither keeps it open nor closes it, so there is nothing for a
pointer-capturing pane to protect.

### Only One Tooltip at a Time

At most one tooltip is on screen: showing a new one closes the previously opened tooltip. The rule applies to tooltips opened by `hover`, `focus`, `click` or `keydown` — including the `kbq-title` and `kbqEllipsisCenter` hints.

Tooltips driven programmatically (`kbqTrigger="manual"`) stay out of the rule: they neither close other tooltips nor get closed. Validation hints work this way.

To opt a single tooltip out, use `[kbqTooltipSingleInstance]="false"`; to change the default for the whole application, provide the `KBQ_TOOLTIP_SINGLE_INSTANCE_DEFAULT` token:

```ts
providers: [{ provide: KBQ_TOOLTIP_SINGLE_INSTANCE_DEFAULT, useValue: false }];
```

### Usage Examples

#### Tooltip for Disabled Button

If a certain button or function is unavailable, the tooltip can explain why.

<!-- example(tooltip-disabled) -->

### Custom Hints

For special cases, you can change the tooltip dimensions and place more than just text inside it. Use the Contrast-fade style, which is similar to the application background, to ensure content contrast against the tooltip background.

<!-- example(tooltip-extended) -->

### API

The directive is bound as `[kbqTooltip]`. Historically its inputs were named three different ways — most are
prefixed with `kbqTooltip`, the shared pop-up ones only with `kbq`, and three have no prefix at all. The table
below lists the canonical name of each one.

#### Inputs

| Name                         | Type                                          | Default          | Description                                                                                                                                    |
| ---------------------------- | --------------------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `kbqTooltip`                 | `string \| TemplateRef`                       | —                | The content. Changing it refreshes an open tooltip.                                                                                            |
| `kbqTooltipHeader`           | `string \| TemplateRef`                       | —                | Header above the content. Only rendered with `kbqTooltipModifier="extended"`.                                                                  |
| `kbqTooltipContext`          | `unknown`                                     | `null`           | Value passed to a template content as `$implicit`.                                                                                             |
| `kbqTooltipDisabled`         | `boolean`                                     | `false`          | Suppresses the tooltip and hides it if it is open.                                                                                             |
| `kbqTooltipClass`            | `string`                                      | `''`             | Extra CSS classes applied to the tooltip element.                                                                                              |
| `kbqTooltipColor`            | `KbqComponentColors \| string`                | `contrast`       | Color theme: `contrast`, `contrast-fade`, `theme`, `warning`, `error`.                                                                         |
| `kbqTooltipArrow`            | `boolean`                                     | `false`          | Renders the arrow pointing at the trigger.                                                                                                     |
| `kbqTooltipOffset`           | `number \| null`                              | `null`           | Gap in pixels between the tooltip and its trigger.                                                                                             |
| `kbqTooltipModifier`         | `'default' \| 'warning' \| 'extended'`        | `'default'`      | Visual modifier. `extended` enables the header and roomier paddings.                                                                           |
| `kbqTooltipSingleInstance`   | `boolean`                                     | `true`           | Whether the tooltip joins the "only one tooltip at a time" group.                                                                              |
| `kbqVisible`                 | `boolean`                                     | `false`          | Shows or hides the tooltip programmatically.                                                                                                   |
| `kbqPlacement`               | `KbqPopUpPlacementValues`                     | `'top'`          | Placement relative to the trigger.                                                                                                             |
| `kbqPlacementPriority`       | `string \| string[] \| null`                  | `null`           | Ordered fallback placements used when there is not enough space.                                                                               |
| `kbqRelativeToPointer`       | `boolean`                                     | `false`          | Positions the tooltip at the cursor. Only for `top`/`bottom`, and not combined with placement priority.                                        |
| `kbqTrigger`                 | `string`                                      | `'hover, focus'` | Comma-separated trigger events: `hover`, `focus`, `click`, `keydown`, `manual`.                                                                |
| `kbqEnterDelay`              | `number`                                      | `400`            | Delay in milliseconds before showing. See [Delay](#delay).                                                                                     |
| `kbqLeaveDelay`              | `number`                                      | `0`              | Delay in milliseconds before hiding. Applies to every hide — on `mouseleave`, on `blur` and on `hideWithTimeout`.                              |
| `hideWithTimeout`            | `boolean`                                     | `false`          | Additionally keeps the tooltip open while the pointer is over it, and lets a return to the trigger cancel the pending hide.                    |
| `ignoreTooltipPointerEvents` | `boolean`                                     | `false`          | Makes the tooltip transparent to pointer events. See [Moving the Cursor onto the Tooltip](#moving-the-cursor-onto-the-tooltip).                |
| `forDisabledComponent`       | `{ disabledSignal: WritableSignal<boolean> }` | —                | Mirrors the disabled state of a wrapped control: the wrapper becomes focusable and the tooltip is enabled only while that control is disabled. |

#### Outputs

| Name                 | Type                                    | Description                                  |
| -------------------- | --------------------------------------- | -------------------------------------------- |
| `kbqVisibleChange`   | `EventEmitter<boolean>`                 | Emits when the tooltip is shown or hidden.   |
| `kbqPlacementChange` | `EventEmitter<KbqPopUpPlacementValues>` | Emits the new placement whenever it changes. |

#### Showing a Tooltip Without a Template Trigger

`showForElement(element)` and `showForMouseEvent(event)` open the tooltip anchored to an element or to the
cursor position of a mouse event, for cases where the directive cannot be declared in the template — a hint
shared by the cells of a virtualized table, for instance. The directive still has to be created inside an
injection context; see the Dynamic Tooltip example.

### Recommendations

- If you need to use interactive elements (buttons, links, etc.) inside the tooltip, use [Popover](/components/popover) instead.
- The Tooltip component is always preferable to the system one. Don't use both methods simultaneously in the same interface.
- For tooltips to work effectively, it's important to keep them brief and clear. Long explanations can be difficult to read and distracting, so it's best to avoid them.
- The tooltip height depends on the content. The recommended maximum height is 480px (may be increased at the designer's discretion).
