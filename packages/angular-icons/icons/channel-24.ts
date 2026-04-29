import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-channel-24,[kbqChannel24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M16.5 1.8a.3.3 0 0 1 .3-.3h5.4a.3.3 0 0 1 .3.3v8.4a.3.3 0 0 1-.3.3h-5.4a.3.3 0 0 1-.3-.3v-3h-3.3v11.7a.3.3 0 0 1-.3.3H7.5v3a.3.3 0 0 1-.3.3H1.8a.3.3 0 0 1-.3-.3v-8.4a.3.3 0 0 1 .3-.3h5.4a.3.3 0 0 1 .3.3v3h3.3V5.1a.3.3 0 0 1 .3-.3h5.4z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqChannel24 extends KbqSvgIcon {}
