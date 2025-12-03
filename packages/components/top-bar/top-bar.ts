import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    Directive,
    inject,
    input,
    Input,
    ViewEncapsulation
} from '@angular/core';
import { KbqOverflowItems } from '@koobiq/components/overflow-items';

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
        '[class.kbq-top-bar-container__end]': 'placement() === "end"',
        '[class.kbq-top-bar-container__with-overflow-items]': 'overflowItems'
    }
})
export class KbqTopBarContainer {
    /**
     * Conditionally applies a CSS class based on the value
     */
    readonly placement = input.required<'start' | 'end'>();
    /**
     * Track if container has `KbqOverflowItems` directive assigned.
     * Used to replace `gap` with `margin` so `KbqOverflowItems` will calculate correct width on resize.
     * @docs-private
     */
    protected readonly overflowItems = inject(KbqOverflowItems, { optional: true, self: true });
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
