import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    standalone: true,
    selector: 'kbq-top-menu',
    template: `
        <div class="kbq-top-menu__left">test</div>
        <div class="kbq-top-menu__spacer"></div>
        <div class="kbq-top-menu__right">test</div>
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
