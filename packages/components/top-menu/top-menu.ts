import { booleanAttribute, ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';

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
        '[class.kbq-top-menu-overflow]': 'hasOverflow',
        '[class.kbq-top-menu-shadow-on-hover]': 'isShadowOnHoverEnabled'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqTopMenu {
    /**
     * Enables overflow behavior, applying `kbq-top-menu-overflow` to show a bottom shadow.
     */
    @Input({ transform: booleanAttribute }) hasOverflow = false;
    /**
     * Enables shadow-on-hover, applying `kbq-top-menu-shadow-on-hover` for a bottom shadow on hover.
     */
    @Input({ transform: booleanAttribute }) isShadowOnHoverEnabled = true;
}
