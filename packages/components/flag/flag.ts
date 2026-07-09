import { booleanAttribute, ChangeDetectionStrategy, Component, input, ViewEncapsulation } from '@angular/core';
import { KbqFlagShadow, KbqFlagShape } from './flag.types';

/**
 * Presentational wrapper for a country flag.
 *
 * `KbqFlag` does not know how to resolve a country code — it only decorates the projected
 * content (an inline `<svg>` or an `<img>`) with shape, shadow and an optional stylized look, and
 * applies the accessibility contract. The flag image itself is provided by the consumer, e.g.
 * from the `country-flag-icons` package or any custom source:
 *
 * ```html
 * <kbq-flag><img src="…/AL.svg" alt="" /></kbq-flag> Albania
 * ```
 *
 * The rendered size follows the font size (`height: 1em`); set an explicit `font-size`, `width`
 * or `height` to resize it.
 */
@Component({
    selector: 'kbq-flag',
    template: '<ng-content />',
    styleUrl: 'flag.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-flag',
        '[class.kbq-flag_square]': "shape() === 'square'",
        '[class.kbq-flag_circle]': "shape() === 'circle'",
        '[class.kbq-flag_shadow-inset]': "shadow() === 'inset'",
        '[class.kbq-flag_stylized]': 'stylized()',
        '[class.kbq-flag_empty]': 'empty()',
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
    /** Adds rounded corners, a drop shadow and a gradient imitating folds for a volumetric look. */
    readonly stylized = input(false, { transform: booleanAttribute });
    /** Renders a neutral placeholder — use when no flag can be shown (unknown / invalid country code). */
    readonly empty = input(false, { transform: booleanAttribute });
    /** Marks the flag as decorative — hidden from screen readers (use when adjacent text is present). */
    readonly decorative = input(false, { transform: booleanAttribute });
    /** Accessible name for the flag. Use when the flag carries meaning and has no adjacent text. */
    readonly label = input<string>();
}
