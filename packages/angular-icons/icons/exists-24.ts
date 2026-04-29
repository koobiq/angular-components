import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-exists-24,[kbqExists24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M5.55 21a.3.3 0 0 1-.3-.3v-2.065a.3.3 0 0 1 .3-.3h9.644v-5.317H6.981a.3.3 0 0 1-.3-.3v-2.025a.3.3 0 0 1 .3-.3h8.213V5.679H5.621a.3.3 0 0 1-.3-.3V3.3a.3.3 0 0 1 .3-.3H18.45a.3.3 0 0 1 .3.3v17.4c0-.584-.134.3-.3.3z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqExists24 extends KbqSvgIcon {}
