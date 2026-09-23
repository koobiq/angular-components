import { booleanAttribute, ChangeDetectionStrategy, Component, input, ViewEncapsulation } from '@angular/core';

/**
 * A themed line separator.
 *
 * Horizontal by default and vertical with `vertical`; the vertical orientation fills the flex or grid
 * row it sits in, and `--kbq-divider-size-vertical-height` pins it to a fixed height instead.
 *
 * The divider carries `role="separator"` so the boundary it draws is also exposed programmatically.
 * A divider that only repeats a boundary already conveyed by the layout should set `decorative`.
 */
@Component({
    selector: 'kbq-divider',
    template: '',
    styleUrls: ['divider.scss', 'divider-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-divider',
        '[class.kbq-divider_vertical]': 'vertical()',
        '[class.kbq-divider_horizontal]': '!vertical()',
        '[class.kbq-divider_paddings]': 'paddings()',
        // The element is empty, so `presentation` is enough to keep a decorative divider out of the
        // accessibility tree; `aria-hidden` is left to the caller, who may have to hide a divider
        // that still has to announce itself elsewhere.
        '[attr.role]': `decorative() ? 'presentation' : 'separator'`,
        // `horizontal` is the ARIA default for a separator, so only the vertical case is emitted.
        '[attr.aria-orientation]': `!decorative() && vertical() ? 'vertical' : null`
    }
})
export class KbqDivider {
    /** Whether the divider is vertically oriented. Defaults to `false`, a horizontal divider. */
    readonly vertical = input(false, { transform: booleanAttribute });

    /**
     * Whether the divider spaces itself from the content around it. Defaults to `true`, which emits margins
     * (not padding) along the divider's cross axis.
     */
    readonly paddings = input(true, { transform: booleanAttribute });

    /**
     * Whether the divider is purely decorative. A decorative divider is hidden from assistive
     * technology, for boundaries that a heading, a group or the layout itself already conveys.
     * Defaults to `false`.
     */
    readonly decorative = input(false, { transform: booleanAttribute });
}
