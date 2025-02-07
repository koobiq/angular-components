import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

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
        class: 'kbq-top-menu'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqTopMenu {}
