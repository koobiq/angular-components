import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    Directive,
    input,
    Input,
    ViewEncapsulation
} from '@angular/core';
import { KBQ_DROPDOWN_HOST } from '@koobiq/components/dropdown';

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
    providers: [
        { provide: KBQ_DROPDOWN_HOST, useExisting: KbqTopBar }
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'kbq-top-bar',
        '[class.kbq-top-bar_with-shadow]': 'withShadow'
    }
})
export class KbqTopBar {
    /**
     * Enables overflow behavior, applying `kbq-top-bar-overflow` to show a bottom shadow.
     */
    @Input({ transform: booleanAttribute }) withShadow: boolean = false;
}
