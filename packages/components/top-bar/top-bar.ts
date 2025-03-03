import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    Directive,
    input,
    Input,
    ViewEncapsulation
} from '@angular/core';

@Directive({
    standalone: true,
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
    standalone: true,
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
    placement = input.required<'start' | 'end'>();
}

@Component({
    standalone: true,
    selector: 'kbq-top-bar',
    template: `
        <ng-content />
    `,
    styleUrls: [
        './top-bar.scss',
        './top-bar-tokens.scss'
    ],
    host: {
        class: 'kbq-top-bar',
        '[class.kbq-top-bar_with-shadow]': 'withShadow'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqTopBar {
    /**
     * Enables overflow behavior, applying `kbq-top-bar-overflow` to show a bottom shadow.
     */
    @Input({ transform: booleanAttribute }) withShadow: boolean = false;
}
