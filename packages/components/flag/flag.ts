import { booleanAttribute, ChangeDetectionStrategy, Component, input, ViewEncapsulation } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { KbqFlagShadow, KbqFlagShape } from './flag.types';

/**
 * Presentational wrapper for a consumer-provided country flag (inline `<svg>` or `<img>`).
 * Decorates it with shape and shadow and applies the accessibility contract.
 *
 * The flag is either projected, or passed as markup through the `svg` input. Do not bind
 * `[innerHTML]` on the host element — that write replaces whatever was projected into it.
 *
 * ```html
 * <kbq-flag decorative><img src="…/AL.svg" alt="" /></kbq-flag> Albania
 * ```
 */
@Component({
    selector: 'kbq-flag',
    template: `
        <ng-content />
        @if (svg()) {
            <span class="kbq-flag__svg" [innerHTML]="svg()"></span>
        }
    `,
    styleUrls: ['flag.scss', 'flag-tokens.scss'],
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
        '[attr.aria-hidden]': "decorative() || !label() ? 'true' : null"
    },
    exportAs: 'kbqFlag'
})
export class KbqFlag {
    /**
     * Shape of the flag. The flag is cropped to it, so `square`/`circle` are best fed a 1:1 source —
     * a center crop of a rectangular flag can cut off meaningful elements.
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
    /**
     * Flag markup rendered into a slot of its own, for flags that come from a package as a string.
     * A plain string is sanitized, and Angular's sanitizer drops `<svg>` — pass an SVG through
     * `DomSanitizer.bypassSecurityTrustHtml`, and only for markup known at build time.
     */
    readonly svg = input<SafeHtml | string>();
    /** Marks the flag as decorative — hidden from screen readers (use when adjacent text is present). */
    readonly decorative = input(false, { transform: booleanAttribute });
    /**
     * Accessible name for the flag. Use when the flag carries meaning and has no adjacent text.
     * Without it the flag is hidden from screen readers, so a flag whose only name comes from the
     * projected image (`alt`, `<title>`) has to repeat it here.
     */
    readonly label = input<string>();
}
