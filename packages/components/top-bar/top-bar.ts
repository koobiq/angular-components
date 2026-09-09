import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    Directive,
    input,
    ViewEncapsulation
} from '@angular/core';

/**
 * Separator between the two `[kbqTopBarContainer]` slots of a `kbq-top-bar`. It reserves
 * `--kbq-top-bar-spacer-min-width` of guaranteed clearance, so the two sides never collide.
 */
@Directive({
    selector: '[kbqTopBarSpacer]',
    host: {
        class: 'kbq-top-bar-spacer'
    }
})
export class KbqTopBarSpacer {}

/**
 * Marks a slot inside `kbq-top-bar` and applies `kbq-top-bar-container_start` or
 * `kbq-top-bar-container_end` according to `placement`.
 */
@Directive({
    selector: '[kbqTopBarContainer]',
    host: {
        class: 'kbq-top-bar-container',
        '[class.kbq-top-bar-container_start]': 'placement() === "start"',
        '[class.kbq-top-bar-container_end]': 'placement() === "end"'
    }
})
export class KbqTopBarContainer {
    /** Side of the bar the slot occupies. Required; the accepted values are `start` and `end`. */
    readonly placement = input.required<'start' | 'end'>();
}

/**
 * Toolbar row for the top of a page or a panel. It expects two `[kbqTopBarContainer]` slots —
 * `placement="start"` and `placement="end"` — with an optional `[kbqTopBarSpacer]` between them.
 *
 * The host carries no landmark role on purpose: the same bar is page chrome in one place and a panel
 * header in another, and a page may hold only one `banner`. Add `role="banner"` (or wrap the bar in a
 * `<header>`) where it is the page header.
 */
@Component({
    selector: 'kbq-top-bar',
    template: `
        <ng-content />
    `,
    styleUrls: [
        './top-bar.scss',
        './top-bar-tokens.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-top-bar',
        '[class.kbq-top-bar_with-shadow]': 'withShadow()',
        // `|| null` also strips an empty string: `setElementAttribute` only removes the attribute for
        // `== null`, so `aria-label=""` would otherwise render as an empty attribute, which nulls the
        // banner landmark's accessible name per the accname algorithm.
        '[attr.aria-label]': 'ariaLabel() || null'
    }
})
export class KbqTopBar {
    /**
     * Applies the `kbq-top-bar_with-shadow` modifier, which draws the bottom shadow used to signal that
     * page content is scrolled under the bar.
     */
    readonly withShadow = input<boolean, unknown>(false, { transform: booleanAttribute });

    /**
     * Accessible name of the bar. Set it alongside a landmark role whenever a page renders more than one
     * bar, so assistive technology can tell them apart.
     */
    readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });
}
