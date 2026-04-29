import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-mobile-24,[kbqMobile24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M4.5 22.2A1.8 1.8 0 0 0 6 23.975V24h12v-.025a1.8 1.8 0 0 0 1.5-1.775V1.8A1.8 1.8 0 0 0 18 .025V0H6v.025q-.16.027-.309.08A1.8 1.8 0 0 0 4.5 1.8zM7.2 4.5h9.6a.3.3 0 0 1 .3.3v14.4a.3.3 0 0 1-.3.3H7.2a.3.3 0 0 1-.3-.3V4.8a.3.3 0 0 1 .3-.3"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqMobile24 extends KbqSvgIcon {}
