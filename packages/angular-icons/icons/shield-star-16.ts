import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-shield-star-16,[kbqShieldStar16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M2.2 1A1.2 1.2 0 0 0 1 2.202v9.383a.2.2 0 0 0 .115.181l6.8 4.215a.2.2 0 0 0 .17 0l6.8-4.214a.2.2 0 0 0 .115-.182V2.202A1.2 1.2 0 0 0 13.8 1zm5.975 3.115.977 2.143c.028.062.09.105.16.11l2.51.184c.174.012.242.226.106.332l-1.893 1.48a.18.18 0 0 0-.066.192l.582 2.224c.041.16-.134.29-.28.209L8.094 9.777a.2.2 0 0 0-.19 0L5.73 10.989c-.147.082-.322-.049-.28-.209l.581-2.224a.18.18 0 0 0-.066-.193l-1.893-1.48c-.136-.105-.068-.319.105-.331l2.51-.184a.19.19 0 0 0 .161-.11l.977-2.143a.193.193 0 0 1 .35 0"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqShieldStar16 extends KbqSvgIcon {}
