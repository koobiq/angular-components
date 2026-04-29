import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-grid-group-24,[kbqGridGroup24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M3 1.8a.3.3 0 0 1 .3-.3h17.4a.3.3 0 0 1 .3.3v1.8a.3.3 0 0 1-.3.3H5.4v16.2h15.3a.3.3 0 0 1 .3.3v1.8a.3.3 0 0 1-.3.3H3.3a.3.3 0 0 1-.3-.3zm4.8 4.8a.3.3 0 0 1 .3-.3h9.3a.3.3 0 0 1 .3.3v1.8a.3.3 0 0 1-.3.3H8.1a.3.3 0 0 1-.3-.3zm0 4.5a.3.3 0 0 1 .3-.3h9.3a.3.3 0 0 1 .3.3v1.8a.3.3 0 0 1-.3.3H8.1a.3.3 0 0 1-.3-.3zm0 4.5a.3.3 0 0 1 .3-.3h9.3a.3.3 0 0 1 .3.3v1.8a.3.3 0 0 1-.3.3H8.1a.3.3 0 0 1-.3-.3z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqGridGroup24 extends KbqSvgIcon {}
