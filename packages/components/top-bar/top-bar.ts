import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    Directive,
    input,
    ViewEncapsulation
} from '@angular/core';

@Directive({
    selector: '[kbqTopBarSpacer]',
    host: {
        class: 'kbq-top-bar-spacer'
    }
})
export class KbqTopBarSpacer {}

/**
 * Directive that dynamically applying CSS classes based on a placement value (left or right).
 */
@Directive({
    selector: '[kbqTopBarContainer]',
    host: {
        class: 'kbq-top-bar-container',
        '[class.kbq-top-bar-container__start]': 'placement() === "start"',
        '[class.kbq-top-bar-container__end]': 'placement() === "end"'
    }
})
export class KbqTopBarContainer {
    /**
     * Conditionally applies a CSS class based on the value
     */
    readonly placement = input.required<'start' | 'end'>();
}

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
        '[class.kbq-top-bar_with-shadow]': 'withShadow()'
    }
})
export class KbqTopBar {
    /**
     * Enables overflow behavior, applying `kbq-top-bar-overflow` to show a bottom shadow.
     */
    readonly withShadow = input<boolean, unknown>(false, { transform: booleanAttribute });
}
