import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    input,
    ViewEncapsulation
} from '@angular/core';
import { KbqFlagShadow, KbqFlagShape, KbqFlagSize } from './flag.types';

const baseClass = 'kbq-flag';

/**
 * Presentational wrapper for a country flag.
 *
 * `KbqFlag` does not know how to resolve a country code — it only decorates the projected
 * content (an inline `<svg>` or an `<img>`) with shape, sizing and a themed inset shadow, and
 * applies the accessibility contract. The flag image itself is provided by the consumer, e.g.
 * from the `country-flag-icons` package or any custom source:
 *
 * ```html
 * <kbq-flag><img src="…/AL.svg" alt="" /></kbq-flag> Albania
 * <kbq-flag [innerHTML]="sanitizedSvgString"></kbq-flag>
 * ```
 *
 * Accessibility: when the flag is the only indicator (no adjacent text) pass `label` — the host
 * becomes `role="img"` with an accessible name. When there is adjacent visible text, mark the flag
 * `decorative` so it is hidden from screen readers and does not duplicate the label.
 */
@Component({
    selector: 'kbq-flag',
    template: '<ng-content />',
    styleUrls: ['flag.scss', 'flag-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: baseClass,
        '[class.kbq-flag_square]': "shape() === 'square'",
        '[class.kbq-flag_circle]': "shape() === 'circle'",
        '[class.kbq-flag_shadow-inset]': "shadow() === 'inset'",
        '[class]': 'sizeClass()',
        '[attr.role]': "decorative() ? null : (label() ? 'img' : null)",
        '[attr.aria-label]': 'decorative() ? null : (label() || null)',
        '[attr.aria-hidden]': "decorative() ? 'true' : null"
    },
    exportAs: 'kbqFlag'
})
export class KbqFlag {
    /**
     * Shape of the flag. `square`/`circle` expect a 1:1 (square) flag source to be projected.
     * @default rectangle
     */
    readonly shape = input<KbqFlagShape>('rectangle');
    /**
     * Inset hairline that keeps the flag distinct from the background. Its color adapts to the theme.
     * @default inset
     */
    readonly shadow = input<KbqFlagShadow>('inset');
    /** Predefined integer size (px). Only applies to the default `rectangle` shape. */
    readonly size = input<KbqFlagSize>();
    /** Marks the flag as decorative — hidden from screen readers (use when adjacent text is present). */
    readonly decorative = input(false, { transform: booleanAttribute });
    /** Accessible name for the flag. Use when the flag carries meaning and has no adjacent text. */
    readonly label = input<string>();

    /** @docs-private */
    protected readonly sizeClass = computed(() => {
        const size = this.size();

        return size ? `kbq-flag_size-${size}` : null;
    });
}
