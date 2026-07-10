import { booleanAttribute, ChangeDetectionStrategy, Component, input, ViewEncapsulation } from '@angular/core';
import { KbqFlagShadow, KbqFlagShape } from './flag.types';

/**
 * Presentational wrapper for a consumer-provided country flag (inline `<svg>` or `<img>`).
 * Decorates it with shape and shadow and applies the accessibility contract.
 *
 * ```html
 * <kbq-flag><img src="…/AL.svg" alt="" /></kbq-flag> Albania
 * ```
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
    /** Renders a neutral placeholder — use when no flag can be shown (unknown / invalid country code). */
    readonly empty = input(false, { transform: booleanAttribute });
    /** Marks the flag as decorative — hidden from screen readers (use when adjacent text is present). */
    readonly decorative = input(false, { transform: booleanAttribute });
    /** Accessible name for the flag. Use when the flag carries meaning and has no adjacent text. */
    readonly label = input<string>();
}
