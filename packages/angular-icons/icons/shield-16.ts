import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-shield-16,[kbqShield16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M1 2.202A1.2 1.2 0 0 1 2.2 1h11.6A1.2 1.2 0 0 1 15 2.202v9.383a.2.2 0 0 1-.115.181l-6.8 4.215a.2.2 0 0 1-.17 0l-6.8-4.214A.2.2 0 0 1 1 11.585z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqShield16 extends KbqSvgIcon {}
