import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-mobile-16,[kbqMobile16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M3 14.8a1.2 1.2 0 0 0 1 1.183V16h8v-.017a1.2 1.2 0 0 0 1-1.183V1.2a1.2 1.2 0 0 0-1-1.183V0H4v.017q-.106.017-.206.053A1.2 1.2 0 0 0 3 1.2zM4.8 3h6.4a.2.2 0 0 1 .2.2v9.6a.2.2 0 0 1-.2.2H4.8a.2.2 0 0 1-.2-.2V3.2c0-.11.09-.2.2-.2"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqMobile16 extends KbqSvgIcon {}
