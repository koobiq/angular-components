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
    selector: '[kbqTopMenuSpacer]',
    host: {
        class: 'kbq-top-menu-spacer'
    }
})
export class KbqTopMenuSpacer {}

/**
 * Directive that dynamically applying CSS classes based on a placement value (left or right).
 */
@Directive({
    standalone: true,
    selector: '[kbqTopMenuContainer]',
    host: {
        class: 'kbq-top-menu-container',
        '[class.kbq-top-menu-container__left]': 'placement() === "left"',
        '[class.kbq-top-menu-container__right]': 'placement() === "right"'
    }
})
export class KbqTopMenuContainer {
    /**
     * Conditionally applies a CSS class based on the value
     */
    placement = input.required<'left' | 'right'>();
}

@Component({
    standalone: true,
    selector: 'kbq-top-menu',
    template: `
        <ng-content />
    `,
    styleUrls: [
        './top-menu.scss',
        './top-menu-tokens.scss'
    ],
    host: {
        class: 'kbq-top-menu',
        '[class.kbq-top-menu_with-shadow]': 'withShadow'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqTopMenu {
    /**
     * Enables overflow behavior, applying `kbq-top-menu-overflow` to show a bottom shadow.
     */
    @Input({ transform: booleanAttribute }) withShadow: boolean = false;
}
