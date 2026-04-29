import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-shield-desktop-16,[kbqShieldDesktop16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M4.9 8.41a.2.2 0 0 1-.2-.2V5.006c0-.111.09-.2.2-.2h6.2c.11 0 .2.089.2.2V8.21a.2.2 0 0 1-.2.2z"
                />
                <path
                    d="M2.2 1A1.2 1.2 0 0 0 1 2.202v9.383a.2.2 0 0 0 .115.181l6.8 4.215a.2.2 0 0 0 .17 0l6.8-4.214a.2.2 0 0 0 .115-.182V2.202A1.2 1.2 0 0 0 13.8 1zm1.3 3.405a.8.8 0 0 1 .8-.801h7.4a.8.8 0 0 1 .8.8v4.407a.8.8 0 0 1-.8.801H8.6v1.202h2.2c.11 0 .2.09.2.2v.801a.2.2 0 0 1-.2.2H5.2a.2.2 0 0 1-.2-.2v-.8c0-.112.09-.201.2-.201h2.2V9.612H4.3a.8.8 0 0 1-.8-.801z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqShieldDesktop16 extends KbqSvgIcon {}
