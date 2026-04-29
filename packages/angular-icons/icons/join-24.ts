import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-join-24,[kbqJoin24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24">
            <path
                d="M1.8 1.5a.3.3 0 0 0-.3.3v1.8a.3.3 0 0 0 .3.3h4.948l3.919 8.1-3.92 8.1H1.8a.3.3 0 0 0-.3.3v1.8a.3.3 0 0 0 .3.3h5.324a1.8 1.8 0 0 0 1.62-1.016l4.008-8.284h3.973v3.38c0 .238.273.378.472.241l6.677-4.58a.29.29 0 0 0 0-.482l-6.677-4.58c-.199-.137-.472.003-.472.24V10.8h-3.973L8.744 2.516A1.8 1.8 0 0 0 7.124 1.5z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqJoin24 extends KbqSvgIcon {}
