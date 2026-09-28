import { booleanAttribute, ChangeDetectionStrategy, Component, input, ViewEncapsulation } from '@angular/core';
import { kbqOptionalNumberAttribute } from '@koobiq/components/core';

/**
 * A themed line separator.
 *
 * Horizontal by default and vertical with `vertical`; `length` gives the line a size of its own where
 * the surrounding layout does not supply one.
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
        '[attr.aria-orientation]': `!decorative() && vertical() ? 'vertical' : null`,
        // `length` runs along the line. The other axis is the divider's thickness and belongs to the
        // stylesheet, so only one of the two is ever written.
        '[style.height.px]': 'vertical() ? length() : null',
        '[style.width.px]': 'vertical() ? null : length()'
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

    /**
     * Length of the line in pixels — its height when `vertical`, its width otherwise. `null`, the
     * default, leaves the length to the layout the divider sits in, which is what a divider spanning a
     * container wants. Set it for a divider that has to be shorter than its surroundings, such as one
     * between the buttons of a toolbar, instead of reaching for a `height` of your own in CSS.
     */
    readonly length = input<number | null, unknown>(null, {
        transform: (value: unknown) => kbqOptionalNumberAttribute(value) ?? null
    });
}
