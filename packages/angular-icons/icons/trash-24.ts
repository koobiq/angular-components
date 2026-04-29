import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-trash-24,[kbqTrash24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    fill-rule="evenodd"
                    d="M20.25 20.4c0 1.16-.94 2.1-2.1 2.1H5.85c-1.16 0-2.1-.94-2.1-2.1V7.8h16.5zM9 10.5a.3.3 0 0 0-.3.3v8.4a.3.3 0 0 0 .3.3h1.2a.3.3 0 0 0 .3-.3v-8.4a.3.3 0 0 0-.3-.3zm4.8 0a.3.3 0 0 0-.3.3v8.4a.3.3 0 0 0 .3.3H15a.3.3 0 0 0 .3-.3v-8.4a.3.3 0 0 0-.3-.3z"
                    clip-rule="evenodd"
                />
                <path
                    d="M14.4 1.5c1.16 0 2.1.94 2.1 2.1h4.95a.3.3 0 0 1 .3.3v1.8a.3.3 0 0 1-.3.3H2.55a.3.3 0 0 1-.3-.3V3.9a.3.3 0 0 1 .3-.3H7.5c0-1.16.94-2.1 2.1-2.1z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqTrash24 extends KbqSvgIcon {}
