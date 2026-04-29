import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-pause-24,[kbqPause24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M13.501 4.8a.3.3 0 0 1 .3-.3h3.9a.3.3 0 0 1 .3.3v14.4a.3.3 0 0 1-.3.3h-3.9a.3.3 0 0 1-.3-.3zM6 4.8a.3.3 0 0 1 .3-.3h3.9a.3.3 0 0 1 .3.3v14.4a.3.3 0 0 1-.3.3H6.3a.3.3 0 0 1-.3-.3z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqPause24 extends KbqSvgIcon {}
